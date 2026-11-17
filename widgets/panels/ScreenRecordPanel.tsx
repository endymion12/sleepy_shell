import { Gtk } from "ags/gtk4"
import { exec, execAsync } from "ags/process"

export async function TakeScreenshot(area: string = "screen", includeCursor: boolean = false, copy: boolean = true, filename?: string) {
    try {
        let screenshotCmd: string = "grim"
        switch (area) {
            case "screen":
                break
            case "window":
                const windowGeom = exec(["bash", "-c", "swaymsg -t get_tree | jq -j 'recurse(.nodes[],.floating_nodes[]) | select(.focused) | .rect.x, `,`, .rect.y, ` `, .rect.width, `x`, .rect.height'"])
                screenshotCmd = screenshotCmd.concat(` -g ${windowGeom}`)
                break
            default:
                const commaIndex = area.indexOf(",")
                const spaceIndex = area.indexOf(" ")
                const xIndex = area.indexOf("x")
                if (!isNaN(Number(area.slice(0, commaIndex))) && !isNaN(Number(area.slice(commaIndex + 1, spaceIndex))) && !isNaN(Number(area.slice(spaceIndex + 1, xIndex))) && !isNaN(Number(area.slice(xIndex + 1)))) {
                    screenshotCmd = screenshotCmd.concat(` -g ${area}`)
                } else {
                    throw new Error("Invalid area")
                }
        }
        if (includeCursor) {
            screenshotCmd = screenshotCmd.concat(' -c')
        }
        if (filename) {
            screenshotCmd = screenshotCmd.concat(` ${filename}`)
        }
        if (copy) {
            screenshotCmd = screenshotCmd.concat(' | wl-copy')
        }
        execAsync(screenshotCmd)
    } catch (err) {
        console.error(err)
    }
}

export default function ScreenRecordPanel() {

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
            >
                <button
                />
            </box>
        </box>
    )
}
