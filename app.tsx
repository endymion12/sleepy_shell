import app from "ags/gtk4/app"
import style from "/styles/base.scss"
import Desktop from "./widgets/windows/Desktop"
import NavBar from "./widgets/windows/NavBar"
import StatusBar from "./widgets/windows/StatusBar"
import RadialMenu from "./widgets/windows/RadialMenu"
import Greeter from "./widgets/windows/Greeter"
import { getScope } from "gnim"

app.start({
icons: `${SRC}/assets/icons`,
css: style,

main() {
  app.get_monitors().map(Desktop)
  app.get_monitors().map(NavBar)
  app.get_monitors().map(StatusBar)
  app.get_monitors().map(RadialMenu)
  app.get_monitors().map(Greeter)
},

})
