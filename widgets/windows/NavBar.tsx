import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

export default function NavBar(gdkmonitor: Gdk.Monitor) {
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

const [isRevealed, reveal] = createState(false)
const [visible, setVisible] = createState(false)

app.connect("request", (app, request, respond) => {
    if (request == "toggle-navbar") {
		visible(!isRevealed())
        reveal(!isRevealed());
        respond(`Toggled navbar visibility ${isRevealed()}`);
    }
    if (request == "show-navbar") {
	setVisible(true)
	reveal(true)
	respond(`Navbar shown`)
    }
    if (request == "hide-navbar") {
	reveal(false)
	delayHide(250)
	respond(`Navbar hidden`)
    }
})

async function delayHide(time: number) {
	await new Promise(resolve => setTimeout(resolve, time))
	setVisible(false)
}

  return (
     <window
	visible={visible}
	name="NavBar"
	class="NavBar"
	anchor={BOTTOM | LEFT | RIGHT}
	margin-left={80}
	margin-right={80}
	gdkmonitor={gdkmonitor}
	exclusivity={Astal.Exclusivity.IGNORE}
	layer={Astal.Layer.OVERLAY}
	keymode={Astal.Keymode.NONE}
	application={app}
    >
	<revealer 
		transition-type={Gtk.RevealerTransitionType.SLIDE_UP}
		reveal-child={isRevealed}
	>
	<box orientation={Gtk.Orientation.HORIZONTAL} hexpand >
			<button 
				$type="start"
				onClicked={() => {execAsync(`uwsm app -- swayview`)}}
				hexpand
			>
				<label label="" />
			</button>
			<button 
				$type="center"
				onClicked={() => {execAsync(`bash -c "swaymsg workspace $(($(swaymsg -t get_workspaces | jq '. | max_by(.num) | .num') + 1))"`); reveal(!isRevealed())}}
				hexpand
			>
				<label label="" />
			</button>
			<button 
				$type="end"
				onClicked={() => {execAsync(`swaymsg workspace next`)}}
				hexpand
			>
				<label label="" />
			</button>
		</box>
	</revealer>
    </window>
  )
}
