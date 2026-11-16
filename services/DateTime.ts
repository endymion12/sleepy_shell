import GLib from "gi://GLib"
import { createPoll } from "ags/time"
import { Accessor } from "gnim"

function getOrdinalSuffix(day: number): string {
    switch (day) {
        case 1: case 21: case 31: return "st";
        case 2: case 22: return "nd";
        case 3: case 23: return "rd";
        default: return "th";
    }
}

export function getDateWithSuffix(): string {
    const now = GLib.DateTime.new_now_local()
    const date = now.format("%e");
    const suffix = getOrdinalSuffix(Number(date));
    return `${date?.trim()}${suffix}` || '1st'
}

export function getFormattedDateTime(format: string = "%X"): string {
    const now = GLib.DateTime.new_now_local()
    return now.format(format) || '00:00:00'
}

export function formattedClock(format: string = "%X"): Accessor<string> {
    const init = getFormattedDateTime(format)

    let interval = 0
    if (format.includes("&f")) {
        interval = 1
    } else if (format.includes("%c") || format.includes("%s") || format.includes("%S") || format.includes("%T") || format.includes("%X") || format.includes("%::z")) {
        interval = 500
    } else {
        interval = 30000
    }

    const clock = createPoll(init, interval, () => getFormattedDateTime(format))
    return clock
}
