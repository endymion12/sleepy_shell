import app from "ags/gtk4/app"
import { createState, createComputed } from "ags"
import { execAsync } from "ags/process"

export default function BarModuleRotationLock() {
    const [active, setActive] = createState(false)
    const [rot8Cmd, setRot8Cmd] = createState("uwsm app -- rot8")

    app.connect("request", (app, [cmd, arg], respond) => {
        if (cmd == "rotate") {
            execAsync("pkill -e rot8")
            let options = ""
            if (arg) {
                options = `-${arg}`
            }
            setRot8Cmd(`uwsm app -- rot8 ${options}`.trim())
            if (!active()) {
                execAsync(rot8Cmd())
            }
            respond(`Set rotation options ${options}`);
        }
    })

    const [icon, updateIcon] = createState("package-available-locked-symbolic")

    return (
        <togglebutton
            onToggled={(self) => {
                setActive(self.active)
                if (active()) {
                    execAsync("pkill -e rot8")
                    updateIcon("package-installed-locked-symbolic")
                } else {
                    execAsync("pgrep -x rot8").catch(() => execAsync(rot8Cmd()))
                    updateIcon("package-available-locked-symbolic")
                }
            }}
        >
            <image iconName={icon} />
        </togglebutton>
    )
}
