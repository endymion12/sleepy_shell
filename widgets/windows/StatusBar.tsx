import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createState } from "ags"
import BarModuleNetwork from "./../modules/Network"
import BarModuleTray from "./../modules/Tray"
import BarModuleClock from "./../modules/Clock"
import BarModuleBattery from "./../modules/Battery"
import BarModulePower from "./../modules/Power"
import BarModuleTuner from "./../modules/Tuner"
import BarModuleRotationLock from "./../modules/RotationLock"


export default function StatusBar(gdkmonitor: Gdk.Monitor) {
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
            name="StatusBar"
            class="StatusBar"
            anchor={TOP | LEFT | RIGHT}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.ON_DEMAND}
            application={app}
            css={customCSS}
        >
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
                    <BarModuleBattery />
                    <BarModulePower />
                </box>
            </centerbox>
        </window>
    )
}
