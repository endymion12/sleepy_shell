import { Gtk } from "ags/gtk4"
import BarModuleNetwork from "./../modules/Network"
import BarModuleTray from "./../modules/Tray"
import BarModuleClock from "./../modules/Clock"
import BatteryApplet from "../applets/BatteryApplet"
import BarModulePower from "./../modules/Power"
import BarModuleTuner from "./../modules/Tuner"
import BarModuleRotationLock from "./../modules/RotationLock"


export default function MenuBar() {
    return (
        <centerbox orientation={Gtk.Orientation.HORIZONTAL} >
            <box $type="start" spacing={5} >
                <BarModuleNetwork />
                <BarModuleTuner />
            </box>
            <box
                class="spacer"
                $type="center"
                spacing={5}
                hexpand
            >
            </box>
            <box $type="end" spacing={5} >
                <BarModuleClock />
                <BarModuleTray />
                <BarModuleRotationLock />
                <BatteryApplet />
                <BarModulePower />
            </box>
        </centerbox>
    )
}
