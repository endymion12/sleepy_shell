import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function BarModulePower() {
  return (
    <menubutton class="circular" >
      <image iconName="system-shutdown-symbolic" />
      <popover
      halign={Gtk.Align.END}
      hasArrow={false}
      >
        <box orientation={Gtk.Orientation.VERTICAL} widthRequest={150} >
          <button onClicked={() => execAsync('uwsm app -- hyprlock')}>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} >
              <image iconName="lock-symbolic" />
              <label label="Lock" />
            </box>
          </button>
          <button onClicked={() => execAsync('systemctl sleep')} >
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} >
              <image iconName="system-suspend-symbolic" />
              <label label="Sleep" />
            </box>
          </button>
          <button onClicked={() => execAsync('loginctl terminate-user ""')}>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} >
              <image iconName="system-log-out-symbolic" />
              <label label="Log out" />
            </box>
          </button>
          <button onClicked={() => execAsync('poweroff')}>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} >
              <image iconName="system-shutdown-symbolic" />
              <label label="Power off" />
            </box>
          </button>
          <button onClicked={() => execAsync('systemctl reboot')}>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5} >
              <image iconName="system-reboot-symbolic" />
              <label label="Restart" />
            </box>
          </button>
        </box>
      </popover>
    </menubutton>
  )
}
