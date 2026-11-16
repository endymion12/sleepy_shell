import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import AstalNetwork from "gi://AstalNetwork"
import { For, createState, createBinding, createComputed } from "ags"
import { createPoll } from "ags/time"

export default function BarModuleNetwork() {
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
    switch(primary()) {
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

  let ssids = []
  const [accessPoints, setAccessPoints] = createState(
    wifi().access_points.filter(
      (ap) => {
        const thisSSID = ap.ssid
        if (!thisSSID) {
          return false
        }
        if (ssids.includes(thisSSID)) {
          return false
        }
        ssids.push(thisSSID)
        return true
      }
    ).sort((a, b) => b.strength - a.strength).slice(0,15)
  )

  async function connect(ap: AstalNetwork.AccessPoint) {
    try {
      await execAsync(`nmcli device wifi connect ${ap.bssid}`)
    } catch (error) {
      // you can implement a popup asking for password here
      console.error(error)
    }
  }

  function NetworkStatus() {
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
      switch(primary()) {
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

  function NetworkToggle() {
    return (
      <box orientation={Gtk.Orientation.HORIZONTAL} widthRequest={250} >
        <togglebutton
          active={createBinding(wifi(), "enabled")}
          onToggled={(self) => {
            network.wifi.set_enabled(self.get_active())
          }}
          halign={Gtk.Align.START}
          valign={Gtk.Align.CENTER}
          margin-start={2}
          margin-top={2}
          margin-bottom={2}
        >
            <image iconName="network-wireless-symbolic" />
        </togglebutton>
        <label label="WiFi" hexpand class="title-1" />
      </box>
    )
  }

  function Scan() {
    setAccessPoints([])
    wifi().scan()
  }

  function NetworkList() {
    wifi().connect("notify::access-points", (self) => {
      ssids = []
      setAccessPoints(
        self.access_points.filter(
          (ap) => {
            const thisSSID = ap.ssid
            if (!thisSSID) {
              return false
            }
            if (ssids.includes(thisSSID)) {
              return false
            }
            ssids.push(thisSSID)
            return true
          }
        ).sort((a, b) => b.strength - a.strength).slice(0,15)
      )
    })

    return (
      <box hexpand orientation={Gtk.Orientation.VERTICAL} >
      <label
        label="Scanning for networks..."
        visible={scanning}
        class="caption"
      />
      <For each={accessPoints}>
        {(ap: AstalNetwork.AccessPoint) => (
          <button
            onClicked={() => {
              connect(ap)
            }}
            visible={!(ap.ssid == wifiSSID())}
          >
              <box orientation={Gtk.Orientation.HORIZONTAL} >
                <image iconName={createBinding(ap, "iconName")} />
                <label
                  label={createBinding(ap, "ssid")}
                  margin-start={8}
                />
              </box>
          </button>
        )}
      </For>
      </box>
    )
  }

  return (
    <menubutton>
      <NetworkStatus />
      <popover
      halign={Gtk.Align.START}
      hasArrow={false}
      >
        <box orientation={Gtk.Orientation.VERTICAL} >
          <NetworkToggle />
          <Gtk.Separator orientation={Gtk.Orientation.HORIZONTAL} />
          <label label="Current network" class="heading" />
          <label label={networkLabel} />
          <Gtk.Separator orientation={Gtk.Orientation.HORIZONTAL} />
          <box>
            <label label="Available networks" class="heading" hexpand/>
            <button
              iconName="view-refresh-symbolic"
              onClicked={Scan}
              halign={Gtk.Align.END}
              class="circular"
            />
          </box>
          <NetworkList />
        </box>
      </popover>
    </menubutton>
  )
}
