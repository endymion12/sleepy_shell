import { takeScreenshot } from "../../services/CaptureScreen"

export default function ScreenshotButton() {

    return (
        <button
            onClicked={takeScreenshot}
            iconName="camera-photo-symbolic"
        />
    )
}
