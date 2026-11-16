import { Astal, Gtk, Gdk } from "ags/gtk4"
import GObject, { register, property, getter } from "ags/gobject"
import { readFile } from "ags/file"

export interface Note {
    freq: number
    scaleDeg: number
    octave: number
}

const JSObjectParam = (name: string, flags: ParamFlags) => GObject.ParamSpec.jsobject(name, "", "", flags)

function determineDegOnePitch(refPitch: number, refPitchValue: { value: number; isCents: boolean }) {
    if (refPitchValue.isCents) {
        return refPitch / (2 ** (refPitchValue.value / 1200))
    } else {
        return refPitch / refPitchValue.value
    }
}

@register({ GTypeName: "Tuner"})
export class Tuner extends GObject.Object {
    @property(JSObjectParam) refNote: Note = { freq: 440, scaleDeg: 10, octave: 4 }
    @property(String) scaleName: string = "vallotti"
    @property(Number) octavesRange: number = 3
    @property(Number) lowestOctave: number = 3;

    @getter(JSObjectParam)
    get scale(): Object[] | undefined {
        if (!this.scaleName) {
            console.log(`Scale name has not been set`)
            return undefined;
        }

        const fileContent = readFile(`/home/india/.config/scales/${this.scaleName}.scl`)
        if (!fileContent) {
            console.log(`Couldn't read content of /home/india/.config/scales/${this.scaleName}.scl`)
            return undefined
        }

        const scaleStrings: string[] = fileContent.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("!")).slice(2).toSpliced(0,0,"0","1").concat("2")
        const scale: { value: number; isCents: boolean }[] = scaleStrings.map((line) => {
            const isCents = line.includes(".")
            return { value: Number(line), isCents }
        }).filter(item => !isNaN(item.value))

        return scale
    }

    @getter(JSObjectParam)
    get possibleNotes(): Note[] | undefined {
        const scale = this.scale
        if (!scale) {
            console.log(`Couldn't find scale to use for tuning`)
            return undefined;
        }
        if (!this.refNote) {
            console.log(`Couldn't find reference note`)
            return undefined
        }

        const { freq: refFreq, scaleDeg: refScaleDeg, octave: refOct } = this.refNote
        const refPitchValue = scale[refScaleDeg]
        const refOctDegOnePitch: number = determineDegOnePitch(refFreq, refPitchValue)

        let notes: Note[] = []

        for (let n = 0; n < this.octavesRange; n++) {
            const currOct = this.lowestOctave + n
            const degOnePitch: number = refOctDegOnePitch * (1 / (2 ** (refOct - currOct)))

            scale.forEach((item, index) => {
                if (index > 0 && index < 13) {
                    let freq: number

                    if (item.isCents) {
                        freq = degOnePitch * (2 ** (item.value / 1200))
                    } else {
                        freq = degOnePitch * item.value
                    }

                    const newNote: Note = { freq: freq, scaleDeg: index, octave: currOct}
                    notes.push(newNote)
                }
            })
        }
        return notes
    }

    tune(freq: number): [Note, number] | undefined {
        const notes = this.possibleNotes
        const scale = this.scale

        if (!notes) {
            console.log(`Couldn't find possible notes for tuner`)
            return undefined
        }
        if (!scale) {
            console.log(`Couldn't find scale to use for tuning`)
            return undefined
        }

        const notesByDistance = [...notes].sort((a, b) => {
            const aDist = Math.abs(freq - a.freq)
            const bDist = Math.abs(freq - b.freq)
            return aDist - bDist
        })
        const closestNote = notesByDistance[0]
        const closestFreq = closestNote.freq
        const closestPitchValue = scale[closestNote.scaleDeg]
        const tuningOctaveDegOne = determineDegOnePitch(closestFreq, closestPitchValue)
        const octaveBandWidth = tuningOctaveDegOne
        const freqDiff = freq - closestFreq
        const err = (freqDiff / octaveBandWidth) * 1200

        if (((closestNote.octave == this.lowestOctave) && (closestNote.scaleDeg == 1) && (err < -60)) || ((closestNote.octave == this.lowestOctave + (this.octavesRange - 1)) && (closestNote.scaleDeg == 12) && (err > 60))) {
            console.log(`Note out of range`)
            return undefined
        }

        return [closestNote, err]
    }
}
