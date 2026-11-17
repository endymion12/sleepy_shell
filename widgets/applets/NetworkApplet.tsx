import { Gtk } from "ags/gtk4"
import NetworkIndicator from "../indicators/NetworkIndicator"
import NetworkPanel from "../panels/NetworkPanel"

export default function NetworkApplet() {

    return (
        <menubutton>
            <NetworkIndicator />
            <popover
                halign={Gtk.Align.START}
                hasArrow={false}
            >
                <NetworkPanel />
            </popover>
        </menubutton>
    )
}
