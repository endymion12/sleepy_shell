import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { formattedClock, getFormattedDateTime, getDateWithSuffix } from "./../../services/DateTime"

function getClockDate() {
	const weekday = getFormattedDateTime("%A")
	const dayOfMonth = getDateWithSuffix()
	const month = getFormattedDateTime("%B")
	const year = getFormattedDateTime("%Y")
	return `${weekday}, ${dayOfMonth} ${month} ${year}`;
}

export default function Clock() {
	const time = formattedClock("%l:%M")
	const date = createPoll("", 60000, getClockDate);

	return (
		<box
			class="Clock"
			orientation={Gtk.Orientation.VERTICAL}
			spacing={15}
			width-request={1000}
			height-request={250}
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
		>
			<label class="Time" label={time} />
			<label class="Date" label={date} />
		</box>
	)
}
