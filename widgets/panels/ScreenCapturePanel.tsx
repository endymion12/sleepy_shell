import { Gtk } from "ags/gtk4"
import { takeScreenshot } from "../../services/CaptureScreen"

export default function ScreenRecordPanel() {

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
            >
                <button
                    onClicked={takeScreenshot}
                />
            </box>
        </box>
    )
}
