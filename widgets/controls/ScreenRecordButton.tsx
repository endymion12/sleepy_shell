import { recordScreen } from "../../services/CaptureScreen"
import { createPoll } from "ags/time"
import { recording } from "../../services/CaptureScreen"
import { createComputed } from "gnim"

export default function ScreenRecordButton() {

    let flash = false
    const iconRecordingAnimated = createPoll("", 800, () => {
        if (flash) {
            flash = false
            return "media-record-symbolic"
        } else {
            flash = true
            return ""
        }
    })
    const iconName = createComputed(() => {
        if (recording()) {
            return iconRecordingAnimated()
        } else return "camera-video-symbolic"
    })

    return (
        <button
            onClicked={recordScreen}
            iconName={iconName}
        />
    )
}
