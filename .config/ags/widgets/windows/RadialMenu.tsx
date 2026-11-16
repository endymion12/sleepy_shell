import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { For, createState } from "ags"
import Pango from "gi://Pango";
import PangoCairo from "gi://PangoCairo";
import Cairo from "gi://Cairo";
import { execAsync } from "ags/process"

export default function RadialMenu(gdkmonitor: Gdk.Monitor) {

const [isVisible, setVisible] = createState(false)

app.connect("request", (app, request, respond) => {
    if (request == "show-radial-menu") {
	setVisible(true)
	respond(`Radial menu shown`)
    }
    if (request == "hide-radial-menu") {
	setVisible(false)
	respond(`Radial menu hidden`)
    }
})

const [slices, setSlices] = createState([
	{ label: "LINGOT", action: 'uwsm app -- lingot' },
	{ label: "Ente Auth", action: 'uwsm app -- enteauth' },
	{ label: "Drone", action: 'uwsm app -- pd ~/Documents/"Scale Drone.pd"' },
])

const r = 180
const buffer = 20
const innerRad = 70

const nSlices = slices().length
const sliceAngleSwept = (2 * Math.PI) / nSlices

let red = new Array()
let green = new Array()
let blue = new Array()
for (let i = 0.5; i <= 1; i += 0.01) {
    red.push(1)
    green.push(i)
    blue.push(0.5)
}
for (let i = 0.5; i <= 1; i += 0.01) {
    red.push(1-i)
    green.push(1)
    blue.push(0.5)
}
for (let i = 0.5; i <= 1; i += 0.01) {
    red.push(0.5)
    green.push(1)
    blue.push(i)
}
for (let i = 0.5; i <= 1; i += 0.01) {
    red.push(0.5)
    green.push(1-i)
    blue.push(1)
}
for (let i = 0.5; i <= 1; i += 0.01) {
    red.push(i)
    green.push(0.5)
    blue.push(1)
}
for (let i = 0.5; i <= 1; i += 0.01) {
    red.push(1)
    green.push(0.5)
    blue.push(1-i)
}
const rgbSegment = red.length / nSlices

let drawingarea = new Gtk.DrawingArea()

function mapSliceWidget(label: string, index: number) {

	function drawSlice(area: Gtk.DrawingArea, cr: any, width: number, height: number, label: string, index: number) {
		const sliceStart = sliceAngleSwept * index
		const sliceEnd = sliceStart + sliceAngleSwept
		const sliceStartX = (r * Math.cos(sliceStart)) + r
		const sliceStartY = (-(r * Math.sin(sliceStart))) + r
		const sliceEndX = (r * Math.cos(sliceEnd)) + r
		const sliceEndY = (-(r * Math.sin(sliceEnd))) + r
		
		const rgbIndex = index * rgbSegment
		const sliceRed = red[rgbIndex]
		const sliceGreen = green[rgbIndex]
		const sliceBlue = blue[rgbIndex]

		cr.setSourceRGB(sliceRed, sliceGreen, sliceBlue)
		cr.moveTo(r, r)
		cr.lineTo(sliceStartX, sliceStartY)
		cr.arcNegative(r,r,r,-sliceStart, -sliceEnd)
		cr.fillPreserve()
		
		cr.setSourceRGBA(0, 0, 0, 0)
		cr.setOperator(0)
		cr.setLineWidth(buffer)
		cr.closePath()
		cr.stroke()
		cr.setSourceRGBA(0, 0, 0, 0)
		cr.setOperator(0)
		cr.moveTo(r,r)
		cr.arc(r,r,innerRad,0,2 * Math.PI)
		cr.fill()
		
		cr.setOperator(2)

		cr.setSourceRGB(1.0,1.0,1.0)
		const layout = PangoCairo.create_layout(cr)
		layout.set_text(label, -1);
		const fontDesc = Pango.FontDescription.from_string("Sans Bold 10");
		layout.set_font_description(fontDesc);
		const textAngle = sliceEnd - (sliceAngleSwept / 2)
		let rotation = -textAngle
		const textX =  ((innerRad+10) * Math.cos(textAngle)) + r
		const textY =  (-((innerRad+10) * Math.sin(textAngle))) + r
		const [pixelWidth, pixelHeight] = layout.get_pixel_size()
		const actualTextX = textX - pixelWidth
		const actualTextY = textY - pixelHeight
		cr.translate(textX, textY)
		if ((textAngle > (Math.PI / 2)) && (textAngle < (3 * Math.PI / 2))) {
			cr.translate(-pixelWidth,-pixelHeight)
			rotation = -(textAngle + Math.PI)
		}
		cr.rotate(rotation)
		PangoCairo.show_layout(cr, layout);
	}

	return (
			<drawingarea
				$type="overlay"
				$={(self) => {
				drawingarea = self
				self.set_draw_func((area: Gtk.DrawingArea, cr: any, width: number, height: number) => {
					drawingarea.cr = cr
					drawSlice(area, cr, width, height, label, index)
				})
				}}
			>
			</drawingarea>
	)
}

function getItemClicked(x: number, y: number) {
	let index = 0
	let item = -1
	while (item < 0) {	
		const cr = drawingarea.cr
		const sliceStart = sliceAngleSwept * index
		const sliceEnd = sliceStart + sliceAngleSwept
		const sliceStartX = (r * Math.cos(sliceStart)) + r
		const sliceStartY = (-(r * Math.sin(sliceStart))) + r
		const sliceEndX = (r * Math.cos(sliceEnd)) + r
		const sliceEndY = (-(r * Math.sin(sliceEnd))) + r

		cr.moveTo(r+(innerRad * Math.cos(sliceStart)), (-(innerRad * Math.sin(sliceStart))) + r)
		cr.lineTo(sliceStartX, sliceStartY)
		cr.arcNegative(r,r,r,-sliceStart, -sliceEnd)
		cr.lineTo((innerRad * Math.cos(sliceEnd)) + r, (-(innerRad * Math.sin(sliceEnd))) + r)
		cr.arc(r,r,innerRad,-sliceEnd,-sliceStart)
		cr.setLineWidth(buffer)
		cr.closePath()
		if (cr.inFill(x,y)) {
			item = index
		}
		cr.setSourceRGBA(0, 0, 0, 0)
		cr.setOperator(0)
		cr.fill()
		index += 1
	}
	return item
}

return (
     <Gtk.Window
	visible={isVisible}
	title="RadialMenu"
	class="RadialMenu"
//	gdkmonitor={gdkmonitor}
//	keymode={Astal.Keymode.EXCLUSIVE}
	application={app}
	onCloseRequest={() => {
     		setVisible(false)
      		return true
    	}}
    >
    	<overlay
    		heightRequest={2*r + 20}
    		widthRequest={2*r + 20}
    	>
		<Gtk.GestureClick
			onPressed={(self, n_press, x, y) => {
				const item = getItemClicked(x,y)
				const slice = slices()[item]
				execAsync(slice.action)
				setVisible(false)
				return true
			}}
		/>
    		<For each={slices} >
    			{(item, index) => {
    				const label = item.label
    				const n = index()
    				return mapSliceWidget(label, n)
			}}
		</For>
	</overlay>
    </Gtk.Window>
)
}
