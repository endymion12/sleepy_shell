import { Gtk } from "ags/gtk4"
import AstalBattery from "gi://AstalBattery"
import Pango from "gi://Pango";
import PangoCairo from "gi://PangoCairo";
import AstalPowerProfiles from "gi://AstalPowerProfiles"
import { createState, createBinding, createComputed } from "ags"

export default function BarModuleBattery() {
  const battery = AstalBattery.get_default()
  const percent = createBinding(battery, "percentage")((p) => Math.round(p * 100))
  const isCharging = createBinding(battery, "charging")
  function BatteryStatus() {
    const batteryClassName = createBinding(
      battery,
      "percentage",
    )((p) => ((p <= 0.15) && !(isCharging())) ? "battery-indicator-critical" : "battery-indicator")

    function drawBattery(area: Gtk.DrawingArea, cr: any, width: number, height: number) {
      // Clear layout canvas background (completely transparent for status bars)
      cr.setSourceRGBA(0, 0, 0, 0);
      cr.setOperator(0); // CLEAR operator
      cr.paint();
      cr.setOperator(2); // OVER operator (reset to normal drawing)

      // Configuration dimensions for a status-bar sized battery shell
      const pad = 0;
      const bWidth = width - pad * 2 - 4; // leave room for the positive tip
      const bHeight = height - pad * 2;
      const radius = 4; // rounded corner smoothness

      // 1. Draw the Main Battery Outer Shell (Rounded Rectangle)
      cr.setSourceRGB(0.8, 0.8, 0.8); // Silver/white outline border
      cr.setLineWidth(2);

      // Cairo rounded corners logic
      cr.newSubPath();
      cr.arc(pad + radius, pad + radius, radius, Math.PI, (3 * Math.PI) / 2);
      cr.arc(pad + bWidth - radius, pad + radius, radius, (3 * Math.PI) / 2, 0);
      cr.arc(pad + bWidth - radius, pad + bHeight - radius, radius, 0, Math.PI / 2);
      cr.arc(pad + radius, pad + bHeight - radius, radius, Math.PI / 2, Math.PI);
      cr.closePath();
      cr.stroke();

      // 2. Draw the Battery Positive Tip (+) on the right side
      const tipX = pad + bWidth;
      const tipY = pad + bHeight / 4;
      const tipW = 3;
      const tipH = bHeight / 2;
      cr.rectangle(tipX, tipY, tipW, tipH);
      cr.fill();

      // 3. Draw the Inner Charge Level (Progress Bar Fill)
      const innerPad = 4;
      let boltSpaceReserve = 0

      // Pick colour dynamically based on battery condition
      if (isCharging()) {
        cr.setSourceRGB(0.2, 0.8, 0.2); // Energetic charging green
        // Draw charging bolt
        cr.setLineWidth(1);
        const boltWidth = 4
        const boltX = (pad + bWidth) - (innerPad + (boltWidth / 2));
        const boltStartY = pad + innerPad;
        const boltEndY = (pad + bHeight) - innerPad;
        const boltMidY = pad + (bHeight / 2);
        const boltLeftX = boltX - (boltWidth / 2);
        const boltMidLeftX = boltX - (boltWidth / 4);
        const boltRightX = boltX + (boltWidth / 2);
        const boltMidRightX = boltX + (boltWidth / 4);
        cr.moveTo(boltMidLeftX, boltMidY);
        cr.lineTo(boltX, boltStartY);
        cr.lineTo(boltLeftX, boltMidY);
        cr.lineTo(boltRightX, boltMidY);
        cr.lineTo(boltX, boltEndY);
        cr.lineTo(boltMidRightX, boltMidY);
        cr.stroke();
        boltSpaceReserve = boltWidth
      } else if (percent() <= 20) {
        cr.setSourceRGB(0.9, 0.2, 0.2); // Critical warning red
      } else if (percent() <= 30) {
        cr.setSourceRGB(1, 0.7, 0.2)
      } else {
        cr.setSourceRGB(0.6, 0.6, 0.6); // Neutral standard level
      }

      const maxFillWidth = bWidth - innerPad * 2;
      const fillWidth = maxFillWidth * (percent() / 100);
      const fillHeight = bHeight - innerPad * 2;

      if (fillWidth > 0) {
        cr.rectangle(pad + innerPad, pad + innerPad, fillWidth, fillHeight);
        cr.fill();
      }

      // 4. Render Percentage Text cleanly using Pango
      cr.setSourceRGB(1.0, 1.0, 1.0); // White text

      // Create a layout bound to this cairo context
      const layout = PangoCairo.create_layout(cr);
      layout.set_text(`${percent()}%`, -1);

      // Describe font settings natively
      const fontDesc = Pango.FontDescription.from_string("Sans Bold 10");
      layout.set_font_description(fontDesc);

      // Safely extract layout geometry size
      const [pixelWidth, pixelHeight] = layout.get_pixel_size();

      // Calculate exact center coordinates relative to your battery wrapper boundaries
      const textX = pad + (bWidth / 2) - (pixelWidth / 2) - boltSpaceReserve;
      const textY = pad + (bHeight / 2) - (pixelHeight / 2);

      // Position the brush and commit the layout text to pixels
      cr.moveTo(textX, textY);
      PangoCairo.show_layout(cr, layout);
    }

    return (
      <drawingarea
      widthRequest={52}
      heightRequest={20}
      class={batteryClassName}
      $={(self) => {
        self.set_draw_func(drawBattery)
        battery?.connect("notify::percentage", () => self.queue_draw());
        battery?.connect("notify::charging", () => self.queue_draw());
      }}
      />
    )
  }

  function BatteryPanel() {
    const percentLabel = percent((p) => `${p}%`)
    const timeToFull = createBinding(battery, "timeToFull")((s) => {
      const minutes = Math.floor(s / 60)
      const hours = Math.floor(minutes / 60)
      const mRemain = minutes - (hours * 60)
      return `${hours} hrs ${mRemain} min`
    })
    const timeToEmpty = createBinding(battery, "timeToEmpty")((s) => {
      const minutes = Math.floor(s / 60)
      const hours = Math.floor(minutes / 60)
      const mRemain = minutes - (hours * 60)
      return `${hours} hrs ${mRemain} min`
    })
    const timeLabel = createComputed(() => (isCharging()) ? timeToFull() : timeToEmpty() )
    const timeCaption = isCharging((c) => (c) ? "until fully charged" : "remaining" )

    function AnimatedBatteryGraphic() {
      interface Droplet {
        x: number
        y: number
        radius: number
        splshStg: number
      }
      let droplets: Droplet[] = []
      function drawBatteryAnimated(area: Gtk.DrawingArea, cr: any, width: number, height: number) {
        const radius = 12
        const tipLength = height / 19
        const tipWidth = width * (3/5)
        const lineWidth = 3

        if (isCharging()) {
          cr.setSourceRGBA(0.2, 0.8, 0.2, 0.8)
        } else if (percent() <= 20) {
          cr.setSourceRGBA(0.9, 0.2, 0.2, 0.8)
        } else if (percent() <= 30) {
          cr.setSourceRGBA(1, 0.7, 0.2, 0.8)
        } else {
          cr.setSourceRGBA(1, 1, 1, 0.8)
        }

        const levelHeight = tipLength + lineWidth + ((height - tipLength - (lineWidth * 2)) * (100 - percent()) / 100)
        let angle: number
        let angleTwo: number
        if (levelHeight < (tipLength + lineWidth)) {
          if (levelHeight <= (tipLength + lineWidth)) {
            angle = (3 * Math.PI) / 2
            angleTwo = (3 * Math.PI) / 2
          } else {
            const angle = Math.asin((tipLength + radius - levelHeight) / radius) + Math.PI
            const angleTwo = (2 * Math.PI) - Math.asin((tipLength + radius - levelHeight) / radius)
          }
          cr.arc(radius, radius, radius - lineWidth, Math.PI, angle)
          cr.arc(width - radius, radius, radius - lineWidth, angleTwo, 0)
        }
        cr.lineTo(width - lineWidth, tipLength + lineWidth + ((height - tipLength - (lineWidth * 2)) * (100 - percent()) / 100))
        cr.arc(width - radius, height - radius, radius - lineWidth, 0, Math.PI / 2)
        cr.arc(radius, height - radius, radius - lineWidth, Math.PI / 2, Math.PI)
        cr.lineTo(lineWidth, tipLength + lineWidth + ((height - tipLength - (lineWidth * 2)) * (100 - percent()) / 100))
        cr.fill()

        if (isCharging()) {
          cr.setSourceRGBA(0.2, 0.8, 0.2, 0.8)
          if (Math.random() > 0.90) {
            const x = lineWidth + (Math.random() * (width - lineWidth))
            const y = Math.random() * height * (1 / 4) + tipLength + lineWidth
            const r = Math.random() * 10
            const newDroplet: Droplet = { x: x, y: y, radius: r, splshStg: 0 }
            droplets.push(newDroplet)
          }
          droplets.forEach((droplet, index) => {
            if (droplet.splshStg == 0) {
              if (droplet.y >= (levelHeight - droplet.radius)) {
                cr.setSourceRGBA(0.2, 0.8, 0.2, 0.8)
                cr.newSubPath()
                cr.arc(droplet.x, droplet.y, droplet.radius, -(Math.PI / 4), (Math.PI / 4) + Math.PI)
                cr.stroke()
                cr.setSourceRGBA(0, 0, 0, 0)
                cr.setOperator(0)
                cr.arc(droplet.x, droplet.y, droplet.radius, -(Math.PI / 4), (Math.PI / 4) + Math.PI)
                cr.fill()
                cr.setOperator(2)
                droplet.splshStg += 1
              } else {
                cr.setSourceRGBA(0.2, 0.8, 0.2, 0.8)
                cr.newSubPath()
                cr.arc(droplet.x, droplet.y, droplet.radius, 0, (2 * Math.PI))
                cr.fill()
                droplet.y += 1
              }
            } else if (droplet.splshStg <= 16) {
              droplet.radius += 0.5
              cr.setSourceRGBA(0.2, 0.8, 0.2, 0.8)
              cr.arc(droplet.x, droplet.y, droplet.radius, -(Math.PI / 4) + ((droplet.splshStg * Math.PI) / 32), (Math.PI / 4) + Math.PI - (droplet.splshStg * Math.PI / 32))
              cr.stroke()
              cr.setSourceRGBA(0, 0, 0, 0)
              cr.setOperator(0)
              cr.arc(droplet.x, droplet.y, droplet.radius, -(Math.PI / 4), (Math.PI / 4) + Math.PI)
              cr.fill()
              cr.setOperator(2)
              droplet.splshStg += 1
            } else {
              droplets.splice(index, 1)
            }
          })
        }

        cr.setSourceRGB(1, 1, 1)
        cr.setLineWidth(lineWidth)

        cr.newSubPath()
        cr.arc(radius, radius + tipLength, radius, Math.PI, (3 * Math.PI) / 2)
        cr.arc(width - radius, radius + tipLength, radius, (3 * Math.PI) / 2, 0)
        cr.arc(width - radius, height - radius, radius, 0, Math.PI / 2)
        cr.arc(radius, height - radius, radius, Math.PI / 2, Math.PI)
        cr.closePath()
        cr.stroke()

        cr.rectangle((width / 2) - (tipWidth / 2), 0, tipWidth, tipLength)
        cr.fill()
      }

      return (
        <drawingarea
          widthRequest={70}
          $={(self) => {
            self.set_draw_func(drawBatteryAnimated)
            battery?.connect("notify::percentage", async () => {
              self.queue_draw()
              while (isCharging()) {
                self.queue_draw()
                await new Promise(resolve => setTimeout(resolve, 16))
              }
            })
            battery?.connect("notify::charging", async () => {
              self.queue_draw()
              while (isCharging()) {
                self.queue_draw()
                await new Promise(resolve => setTimeout(resolve, 16))
              }
            })
          }}
        />
      )
    }

    function PowerProfileSelector() {
      const powerProfilesInst = new AstalPowerProfiles.PowerProfiles
      const profiles = powerProfilesInst.get_profiles()
      const activeProfile = createBinding(powerProfilesInst, "activeProfile")
      let box: Gtk.Box = new Gtk.Box()

      return (
        <Gtk.Frame
          labelWidget={<label label="Select power plan" class="heading" />}
          label-xalign={0.5}
        >
          <box orientation={Gtk.Orientation.VERTICAL} >
          {profiles.map((profile) => {
            const active = activeProfile((aP) => (profile.profile == aP))
            return (
              <box orientation={Gtk.Orientation.HORIZONTAL} >
                <Gtk.CheckButton
                  active={active}
                  onMap={(self) => {
                      self.set_group(self.get_parent().get_prev_sibling()?.get_first_child() ?? null)
                    }}
                  onActivate={(self) => {
                      self.get_active() && powerProfilesInst.set_active_profile(profile.profile)
                    }}
                />
                <label label={profile.profile} />
              </box>
            )
          })}
        </box>
      </Gtk.Frame>
    )
    }
    return (
      <box orientation={Gtk.Orientation.HORIZONTAL} >
        <box orientation={Gtk.Orientation.VERTICAL} >
          <label label={percentLabel} class="title-1" />
          <box orientation={Gtk.Orientation.VERTICAL} >
            <label label={timeLabel} class="heading" />
            <label label={timeCaption} class="caption" />
          </box>
          <PowerProfileSelector />
        </box>
        <AnimatedBatteryGraphic />
      </box>
    )
  }

  return (
    <menubutton>
      <BatteryStatus />
      <popover
        halign={Gtk.Align.END}
        hasArrow={false}
      >
        <BatteryPanel />
      </popover>
    </menubutton>
  )
}
