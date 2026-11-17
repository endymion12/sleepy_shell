import { Gtk } from "ags/gtk4"
import BatteryIndicator from "../indicators/BatteryIndicator"
import BatteryPanel from "../panels/BatteryPanel";

export default function BatteryApplet() {

    return (
        <menubutton>
            <BatteryIndicator />
            <popover
                halign={Gtk.Align.END}
                hasArrow={false}
            >
                <BatteryPanel />
            </popover>
        </menubutton>
    )
}
