import GLib from "gi://GLib"
import { createPoll } from "ags/time"
import { formattedClock } from "./../../services/DateTime.ts"

export default function BarModuleClock() {
  return (
    <label
      margin-end={10}
      class="Clock"
      label={formattedClock("%X")}
    />
  )
}
