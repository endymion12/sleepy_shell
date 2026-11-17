import { Gtk } from "ags/gtk4"
import { Note, Tuner } from "./../../services/Tuner"
import { createSubprocess } from "ags/process"
import { createComputed, createBinding, createState } from "ags"

export default function TunerApplet() {
    const tuner = new Tuner()

    tuner.refNote = { freq: 415, scaleDeg: 10, octave: 4 }
    tuner.scaleName = "vallotti"
    tuner.octavesRange = 3
    tuner.lowestOctave = 3

    const noteNames = ["---", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

    const aubioOutput = createSubprocess("", "bash -c 'arecord -D plughw:0,6 -f S16_LE -r 48000 -c 2 | stdbuf --output=L aubiopitch -i -'")

    const [tunerAppletVisible, setTunerAppletVisible] = createState(false)

    const currFreq = createComputed(() => {
        if (tunerAppletVisible()) {
            const raw = aubioOutput()
            if (typeof raw === "string" && raw.trim().length > 0) {
                const freqStartIndex = aubioOutput().indexOf(" ")
                if (freqStartIndex !== -1) {
                    return Number(aubioOutput().slice(freqStartIndex + 1))
                } else {
                    console.log(`Couldn't find second argument (frequency) of subprocess string ${raw}`)
                    return undefined
                }
            } else {
                console.log(`Subprocess output ${raw} is not a valid string`)
                return undefined
            }
        } else {
            return undefined
        }
    })

    const tunerData = createComputed(() => {
        const freqStr = currFreq()
        if (!freqStr || isNaN(Number(freqStr))) {
            console.log(`Frequency ${freqStr} is not a valid number`)
            return { name: "---", error: "0" }
        }

        try {
            const tuningResult = tuner.tune(freqStr)
            if (!tuningResult || tuningResult.length < 2) {
                console.log(`Tuning result ${tuningResult} did not return expected length 2.`)
                return { name: "---", error: "0" }
            }

            const note: Note = tuningResult[0]
            const errorCents = tuningResult[1]

            return {
                name: noteNames[note.scaleDeg] || "---",
                error: typeof errorCents === "number" ? errorCents.toFixed(0) : `${errorCents}`
            }
        } catch (e) {
            console.log(e)
            return { name: "---", error: "0" }
        }
    })

    const currNoteName = createComputed(() => tunerData().name)

    const currErr = createComputed(() => `${Math.max(Math.min(Number(tunerData().error), 60), -60)}`)

    const lowValue = createComputed(() => {
        const currErrNum = Number(currErr())
        if (currErrNum < 0) return -currErrNum
        //        else if (currErrNum == 0) return 0
        else return 2
    })

    const highValue = createComputed(() => {
        const currErrNum = Number(currErr())
        if (currErrNum > 0) return currErrNum
        //        else if (currErrNum == 0) return 0
        else return 2
    })

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} >
            <togglebutton
                active={tunerAppletVisible}
                onToggled={(self: Gtk.ToggleButton) => {
                    setTunerAppletVisible(self.get_active())
                }}
            >
                <image iconName="tuning-fork-symbolic" />
            </togglebutton>
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                visible={tunerAppletVisible}
            >
                <label label={currNoteName} class="title-2" widthRequest={40} />
                <label label={currErr} widthRequest={150} xalign={0} />
                <levelbar
                    class="square"
                    orientation={Gtk.Orientation.HORIZONTAL}
                    inverted
                    value={lowValue}
                />
                <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
                <levelbar
                    class="square"
                    orientation={Gtk.Orientation.HORIZONTAL}
                    value={highValue}
                />
                <box class="spacer" widthRequest={150} />
                <menubutton>
                    <image iconName="go-down-symbolic" />
                    <popover hasArrow={false} >
                        <box orientation={Gtk.Orientation.VERTICAL} >
                            <entry
                                text={createBinding(tuner, "refNote")((n) => `${n.freq}`)}
                                onActivate={(self: Gtk.Entry) => {
                                    const pitch = self.text
                                    tuner.refNote = { freq: pitch, scaleDeg: 10, octave: 4 }
                                }}
                            />
                            <entry
                                text={createBinding(tuner, "scaleName")}
                                onActivate={(self: Gtk.Entry) => {
                                    tuner.scaleName = self.text
                                }}
                            />
                        </box>
                    </popover>
                </menubutton>
            </box>
        </box>
    )
}
