import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { For, createState, createBinding } from "ags"
import GLib from "gi://GLib"
import { monitorRect} from "./../../utils/Monitor"
import Clock from "./../panels/Clock"
import AppDrawer from "./../panels/AppDrawer"

export default function Desktop(gdkmonitor: Gdk.Monitor) {
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

const initSpacerHeight = monitorRect((rect) => Math.min(rect.height, 1200) - 380)
const [spacerHeight, setSpacerHeight] = createState(initSpacerHeight())

const scrollMultiplierTouch = 2
const scrollMultiplierMouse = 50
const decelConstant = 8

let scrollableViewport: Gtk.Viewport = new Gtk.Viewport()
let scrollMultiplier = 50
let scrollY = 0

function scrollDy(self, dx, dy) {
	const vAdjustment = scrollableViewport.get_vadjustment()

	const prevHeight = spacerHeight()
	const prevVAdjustment = vAdjustment.get_value()

	scrollY = dy * scrollMultiplier
	const newVAdjustment = prevVAdjustment + scrollY
	
	if (scrollY < 0) {
		if (prevVAdjustment > 0) {
			vAdjustment.set_value(newVAdjustment)
			scrollableViewport.set_vadjustment(vAdjustment)
		} else {
			setSpacerHeight(Math.min(initSpacerHeight(), (prevHeight - scrollY)))
		}
	}
	if (scrollY > 0) {
		if (prevHeight > 100) {
			setSpacerHeight(Math.max(100, (prevHeight - scrollY)))
		} else {
			vAdjustment.set_value(newVAdjustment)
			scrollableViewport.set_vadjustment(vAdjustment)
		}
	}
}

async function spacerTendencyOnScrollEnd() {
	const vAdjustment = scrollableViewport.get_vadjustment()
	const prevVAdjustment = vAdjustment.get_value()

	if (prevVAdjustment == 0) {
		while ((spacerHeight() < initSpacerHeight()) && (spacerHeight() > 100)) {
			setSpacerHeight(spacerHeight() - scrollY)
			scrollY += (scrollY / 500)
			if (spacerHeight() > initSpacerHeight()) {
				setSpacerHeight(initSpacerHeight())
			}
			if (spacerHeight() < 100) {
				setSpacerHeight(100)
			}
			await new Promise(resolve => setTimeout(resolve, 1))
		}
	}
}

async function decelerate(self, vel_x, vel_y) {
	const vAdjustment = scrollableViewport.get_vadjustment()
	
	if ((spacerHeight() == 100) || (spacerHeight() == initSpacerHeight())) {
	while (vel_y != 0) {
		scrollY = vel_y * 0.001

		vAdjustment.set_value(vAdjustment.get_value() + scrollY)
		scrollableViewport.set_vadjustment(vAdjustment) 
	
		if (vel_y < 0) {
			vel_y = Math.min(0, vel_y + decelConstant)
		}
		if (vel_y > 0) {
			vel_y = Math.max(0, vel_y - decelConstant)
		}

		await new Promise(resolve => setTimeout(resolve, 1))
	}
	}
}

const desktopScrollController = new Gtk.EventControllerScroll({
	flags: Gtk.EventControllerScrollFlags.VERTICAL |
		Gtk.EventControllerScrollFlags.KINETIC
})

desktopScrollController.connect('scroll-begin', () => {
	scrollMultiplier = scrollMultiplierTouch
	return true
})

desktopScrollController.connect('scroll', (self, dx, dy) => {
	scrollDy(self, dx, dy)
	return true
})

desktopScrollController.connect('scroll-end', () => {
	spacerTendencyOnScrollEnd()
	scrollMultiplier = scrollMultiplierMouse
	return true
})

desktopScrollController.connect('decelerate', (self, vel_x, vel_y) => {
	decelerate(self, vel_x, vel_y)
	return true
})

let startY = 0
let lastY = 0
let lastT = 0

const touchscreenScrollController = new Gtk.GestureDrag({
	propagationPhase: Gtk.PropagationPhase.CAPTURE
})

touchscreenScrollController.connect('drag-begin', (self, start_x, start_y) => {
	startY = start_y
	lastY = startY
        lastT = GLib.get_monotonic_time()
	scrollMultiplier = scrollMultiplierTouch
})

touchscreenScrollController.connect('drag-update', (self, offset_x, offset_y) => {
	self.set_state(Gtk.EventSequenceState.CLAIMED)
	const currentY = startY + offset_y
	const dy = currentY - lastY
	scrollDy(self, 0, -dy)
	lastY = currentY
	lastT = GLib.get_monotonic_time()
})

touchscreenScrollController.connect('drag-end', (self, offset_x, offset_y) => {
	const currentY = startY + offset_y
        const currentT = GLib.get_monotonic_time()
	const dy = currentY - lastY
	const dt = (currentT - lastT) / 1000000
	const velY = dy / (dt * 60)
	spacerTendencyOnScrollEnd()
	decelerate(self, 0, -velY)
	scrollMultiplier = scrollMultiplierMouse
})

const [searchEntry, setSearchEntry] = createState(new Gtk.SearchEntry())
const [typingState, setTypingState] = createState(false)

return (
     <window
	visible
	name="Desktop"
	class="Desktop"
	anchor={TOP | BOTTOM | LEFT | RIGHT}
	gdkmonitor={gdkmonitor}
	exclusivity={Astal.Exclusivity.IGNORE}
	layer={Astal.Layer.BACKGROUND}
	application={app}
	keymode={Astal.Keymode.EXCLUSIVE} 
	onMoveFocus={() => {
		if (!searchEntry().is_focus()) {
			setTypingState(false)
		}
	}}
	onNotify:isActive={(self) => {
		if (!self.isActive) {
			const vAdjustment = scrollableViewport.get_vadjustment()
			vAdjustment.set_value(0)
			scrollableViewport.set_vadjustment(vAdjustment) 
			setSpacerHeight(initSpacerHeight())
		}
	}}
     >
			<Gtk.EventControllerKey
				propagationPhase={Gtk.PropagationPhase.CAPTURE}
				onKeyPressed={(self) => {
					const keyEvent = self.get_current_event()
					const keyval = keyEvent.get_keyval()
					const keyName = Gdk.keyval_name(keyval)
					const modifier = keyEvent.get_modifier_state()
					if (!(modifier === Gdk.ModifierType.SHIFT_MASK) && !(modifier === Gdk.ModifierType.CONTROL_MASK) && !(modifier === Gdk.ModifierType.ALT_MASK) && (keyName.length === 1)) {
						const searchWidget = searchEntry()
						if (spacerHeight() == initSpacerHeight()) {
							scrollY = 50
							setSpacerHeight(spacerHeight() - scrollY)
							spacerTendencyOnScrollEnd()
						}
						if (!typingState()) {
							searchWidget.grab_focus()
							searchWidget.insert_text(keyName, -1, -1)
							searchWidget.set_position(-1)
							setTypingState(true)
						}
						return false
					} else {
						return false
					}
				}}
			/>
	<scrolledwindow
			$={(self) => {
				scrollableViewport = self
				const selfControllers = self.observe_controllers()
				for (let i = 0; i < selfControllers.get_n_items(); i++) {
					const controller = selfControllers.get_item(i)
					if (controller instanceof (Gtk.EventControllerScroll)) {
						self.remove_controller(controller)
					}
				}
                		self.add_controller(desktopScrollController)
				self.add_controller(touchscreenScrollController)
           		}}
	>
	<box
		orientation={Gtk.Orientation.VERTICAL}
		marginStart={100}
		marginEnd={100}
	>
		<box class="Spacer" height-request={80} />
		<Clock />
		<box 
			class="Spacer"
			valign={Gtk.Align.CENTER}	
			halign={Gtk.Align.CENTER}
			height-request={spacerHeight}
		>
		</box>
		<AppDrawer $type="center" searchEntry={searchEntry} setSearchEntry={setSearchEntry} />
	</box>
	</scrolledwindow>
    </window>
)
}
