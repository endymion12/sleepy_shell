import { Gtk } from "ags/gtk4"
import AstalBattery from "gi://AstalBattery"
import Pango from "gi://Pango";
import PangoCairo from "gi://PangoCairo";
import AstalPowerProfiles from "gi://AstalPowerProfiles"
import { createBinding, createComputed } from "ags"

export default function BatteryPanel() {
    const battery = AstalBattery.get_default()
    const percent = createBinding(battery, "percentage")((p) => Math.round(p * 100))
    const isCharging = createBinding(battery, "charging")

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
    const timeLabel = createComputed(() => (isCharging()) ? timeToFull() : timeToEmpty())
    const timeCaption = isCharging((c) => (c) ? "until fully charged" : "remaining")

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
            const tipWidth = width * (3 / 5)
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
                    angle = Math.asin((tipLength + radius - levelHeight) / radius) + Math.PI
                    angleTwo = (2 * Math.PI) - Math.asin((tipLength + radius - levelHeight) / radius)
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
                $={(self: Gtk.DrawingArea) => {
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

        return (
            <Gtk.Frame
                labelWidget={<label label="Select power plan" class="heading" />}
                label-xalign={0.5}
            >
                <box orientation={Gtk.Orientation.VERTICAL} >
                    {profiles.map((profile: AstalPowerProfiles.Profile) => {
                        const active = activeProfile((aP) => (profile.profile == aP))
                        return (
                            <box orientation={Gtk.Orientation.HORIZONTAL} >
                                <Gtk.CheckButton
                                    active={active}
                                    onMap={(self: Gtk.CheckButton) => {
                                        self.set_group(self.get_parent().get_prev_sibling()?.get_first_child() ?? null)
                                    }}
                                    onActivate={(self: Gtk.CheckButton) => {
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
