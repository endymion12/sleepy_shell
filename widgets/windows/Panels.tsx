import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import { createState } from "ags"
import MenuBar from "../panels/MenuBar"


export default function Panels(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
    const [customCSS, setCustomCSS] = createState(`* { background: #00000085; }`)

    app.connect("request", (app, [cmd, arg], respond) => {
        if (cmd == "bar-color") {
            let colour = arg
            if (colour.length < 8) {
                colour = arg + "D2"
            }
            setCustomCSS(`* { background: #${colour}; }`)
            respond(`Set status bar to color #${colour}`);
        }
    })

    return (
        <window
            visible
            name="Panels"
            class="Panels"
            anchor={TOP | LEFT | RIGHT}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.ON_DEMAND}
            application={app}
            css={customCSS}
        >
            <MenuBar />
        </window>
    )
}
