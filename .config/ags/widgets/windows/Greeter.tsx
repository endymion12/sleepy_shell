import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { formattedClock } from "./../../services/DateTime.ts"
import { createComputed } from "ags"

export default function Lockscreen(gdkmonitor: Gdk.Monitor) {
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

return (
	<window
//		visible
		name="Lockscreen"
		class="Desktop"
		anchor={TOP | BOTTOM | LEFT | RIGHT}
		gdkmonitor={gdkmonitor}
//		exclusivity={Astal.Exclusivity.EXCLUSIVE}
//		layer={Astal.Layer.BACKGROUND}
		layer={Astal.Layer.TOP}
		application={app}
//		keymode={Astal.Keymode.EXCLUSIVE}
	>
			<overlay>
				<box
					orientation={Gtk.Orientation.VERTICAL}
				>
						<box
							orientation={Gtk.Orientation.VERTICAL}
							margin-top={30}
							valign={Gtk.Align.START}
						>
								<label
									label={createComputed(() => {
											const hours = formattedClock("%I")()
											const minutes = formattedClock("%M")()
											const clockLabel = hours + "\n" + minutes
											return clockLabel})
									}
									class="large-text-widget"
								/>
						</box>
						<box
							vexpand
						/>
						<box
							margin-bottom={150}
							valign={Gtk.Align.END}
						>
							<label
								label="Press any key to continue..."
								hexpand
							/>
						</box>
				</box>
				<revealer
					$type="overlay"
					transitionType={Gtk.RevealerTransitionType.CROSSFADE}
				>
						<box
							class="frosted-glass"
							hexpand
							vexpand
						>
								<box
									class="dialog"
								>
									<label label="Username" />
									<entry />
								</box>
						</box>
				</revealer>
			</overlay>
    </window>
)
}
