import app from "ags/gtk4/app"
import style from "/styles/base.scss"
import Desktop from "./widgets/windows/Desktop"
import NavBar from "./widgets/windows/NavBar"
import Panels from "./widgets/windows/Panels"
import RadialMenu from "./widgets/windows/RadialMenu"
import Greeter from "./widgets/windows/Greeter"

app.start({
    icons: `${SRC}/assets/icons`,
    css: style,

    main() {
        app.get_monitors().map(Desktop)
        app.get_monitors().map(NavBar)
        app.get_monitors().map(Panels)
        app.get_monitors().map(RadialMenu)
        app.get_monitors().map(Greeter)
    },

})
