import { Gtk } from "ags/gtk4"
import SystemTray from "../applets/SystemTray"
import BatteryApplet from "../applets/BatteryApplet"
import NetworkApplet from "../applets/NetworkApplet"
import TunerApplet from "../applets/TunerApplet"
import { formattedClock } from "./../../services/DateTime"
import RotationLock from "../controls/RotationLock"
import PowerButton from "../applets/PowerButton"
import ScreenshotButton from "../controls/ScreenshotButton"

export default function MenuBar() {
    return (
        <centerbox orientation={Gtk.Orientation.HORIZONTAL} >
            <box $type="start" spacing={0} >
                <NetworkApplet />
                <BatteryApplet />
            </box>
            <box
                class="spacer"
                $type="center"
                spacing={0}
                hexpand
                halign={Gtk.Align.CENTER}
            >
                <label
                    class="Clock"
                    label={formattedClock("%X")}
                />
            </box>
            <box $type="end" spacing={0} >
                <TunerApplet />
                <SystemTray />
                <ScreenshotButton />
                <RotationLock />
                <PowerButton />
            </box>
        </centerbox>
    )
}
