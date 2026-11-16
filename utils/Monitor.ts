import { Gdk } from "ags/gtk4"
import { createBinding } from "ags"

const mainMonitor = Gdk.Display.get_default().get_monitors().get_item(0)
export const monitorRect  = createBinding(mainMonitor, "geometry")
