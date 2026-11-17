import { Gtk } from "ags/gtk4"
import PowerMenu from "../panels/PowerMenu"

export default function PowerButton() {
    return (
        <menubutton class="circular" >
            <image iconName="system-shutdown-symbolic" />
            <popover
                halign={Gtk.Align.END}
                hasArrow={false}
            >
                <PowerMenu />
            </popover>
        </menubutton>
    )
}
