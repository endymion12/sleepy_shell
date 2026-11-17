import { Gtk } from "ags/gtk4"
import AstalBattery from "gi://AstalBattery"
import Pango from "gi://Pango";
import PangoCairo from "gi://PangoCairo";
import { createBinding } from "ags"

export default function BatteryIndicator() {
    const battery = AstalBattery.get_default()
    const percent = createBinding(battery, "percentage")((p) => Math.round(p * 100))
    const isCharging = createBinding(battery, "charging")

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
            $={(self: Gtk.DrawingArea) => {
                self.set_draw_func(drawBattery)
                battery?.connect("notify::percentage", () => self.queue_draw());
                battery?.connect("notify::charging", () => self.queue_draw());
            }}
        />
    )
}
