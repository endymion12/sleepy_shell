import { Gtk } from "ags/gtk4"
import AstalNetwork from "gi://AstalNetwork"
import { createBinding, createComputed } from "ags"
import { createPoll } from "ags/time"

export default function NetworkIndicator() {
    const network = AstalNetwork.get_default()
    const primary = createBinding(network, "primary")
    const wifi = createBinding(network, "wifi")
    const wifiSSID = createBinding(wifi(), "ssid")
    const wired = createBinding(network, "wired")
    const networkState = createBinding(network, "state")
    const networkConnectivity = createBinding(network, "connectivity")
    const wifiState = createBinding(wifi(), "state")
    const scanning = createBinding(wifi(), "scanning")
    const wifiEnabled = createBinding(wifi(), "enabled")
    const wifiInternet = createBinding(wifi(), "internet")

    let iconConnectingAnimatedState = 1
    const iconConnectingAnimated = createPoll("", 90, () => {
        if (iconConnectingAnimatedState < 11) {
            iconConnectingAnimatedState += 1
        } else {
            iconConnectingAnimatedState = 1
        }
        let digit = '01'
        if (iconConnectingAnimatedState < 10) {
            digit = `0${iconConnectingAnimatedState}`
        } else {
            digit = `${iconConnectingAnimatedState}`
            print(digit)
        }
        print(digit)
        return `nm-stage01-connecting${digit}-symbolic`
    })

    const networkLabel = createComputed(() => {
        switch (primary()) {
            case 0:
                if (!wifiEnabled()) {
                    return ""
                }
                if (scanning()) {
                    return "Scanning..."
                }
                if (wifiState() == 20) {
                    return "Unavailable"
                }
                return "Not connected"
            case 1:
                return "Ethernet"
            case 2:
                return wifiSSID()
            default:
                return null
        }
    })

    const wifiIconName = createBinding(wifi(), "iconName")
    const wiredIconName = createBinding(wired(), "iconName")

    const iconName = createComputed(() => {
        if (networkState() == 40) {
            const output = iconConnectingAnimated()
            return output
        }
        if (networkConnectivity() == 2) {
            return "dialog-password-symbolic"
        }
        switch (primary()) {
            case 0:
                if (wifiState() == 20) {
                    return "action-unavailable-symbolic"
                }
                if (scanning()) {
                    return "content-loading-symbolic"
                }
                return "network-wireless-offline-symbolic"
            case 1:
                return wiredIconName() || iconConnectingAnimated()
            case 2:
                if (wifiInternet() == 2) {
                    return "network-error-symbolic"
                }
                return wifiIconName() || iconConnectingAnimated()
            default:
                return null
        }
    })
    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} >
            <image iconName={iconName} />
            <label label={networkLabel} />
        </box>
    )
}
