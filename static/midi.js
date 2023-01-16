class MIDI_Message {
    constructor(data) {
        /*
        data is Uint8Array[3] with
        data[0] : command/channel
        data[1] : note
        data[2] : velocity
        */
        this.cmd = data[0] >> 4;
        this.channel = data[0] & 0xf; // 0-15
        this.type = data[0] & 0xf0;
        this.note = data[1];
        this.velocity = data[2];
        if (this.velocity == 0) {
            this.type = MIDI_Message.NOTE_OFF;
        } else {
            this.type = MIDI_Message.NOTE_ON;
        }
        this.toString = function () {
            return 'type=' + this.type +
                ' channel=' + this.channel +
                ' note=' + this.note +
                ' velocity=' + this.velocity;
        };
    }
}
MIDI_Message.NOTE_ON = 144;
MIDI_Message.NOTE_OFF = 128;

class MIDIOutput {
    
    constructor() {
        this.MIDIOut = null;          // MIDI output device
        this.MIDIOut_selector = null; // html dropdown selector

        // request MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({sysex: false});
        } else {
            alert("No MIDI support in your browser.");
        }
    }

    setup (pos) {
        /* Create and position selector */
        this.MIDIOut_selector = createSelect();
        this.MIDIOut_selector.changed(this.changeMIDIOut.bind(this));
        this.MIDIOut_selector.position(pos.x, pos.y);
        this.MIDIOut_selector.id('midi-out-dropdown')

        /* Populating dropdown list */
        for (let i = 0; i < WebMidi.outputs.length; i++) {
            this.MIDIOut_selector.option(WebMidi.outputs[i].name)
        }
        this.MIDIOut = WebMidi.getOutputByName(this.MIDIOut_selector.value());
    }

    playNote(note) {
        this.MIDIOut.playNote(note, {attack: 1, duration: 100});
    }

    changeMIDIOut() {
        let val = this.MIDIOut_selector.value();
        this.MIDIOut = WebMidi.getOutputByName(val);
    }
 
}

class MIDIInput {

    constructor(simulation) {
        this.simulation = simulation;
        this.MIDIIn = null;
        this.MIDIIn_selector = null;

        // request MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({
                sysex: false});
        } else {
            alert("No MIDI support in your browser.");
        }
    }

    setup(pos) {
        this.MIDIIn_selector = createSelect();
        this.MIDIIn_selector.changed(this.changeMIDIIn.bind(this));
        this.MIDIIn_selector.position(pos.x, pos.y);
        this.MIDIIn_selector.id('midi-in-dropdown')

        /* Populating dropdown list */
        for (let i = 0; i < WebMidi.inputs.length; i++) {
            this.MIDIIn_selector.option(WebMidi.inputs[i].name);
        }
        this.MIDIIn = WebMidi.getInputByName(this.MIDIIn_selector.value());
        console.log(this.MIDIIn)

        this.MIDIIn.addListener("noteon", this.noteOn.bind(this));
    }

    /* Returns the note played */
    noteOn(e) {
        console.log(e)
        this.simulation.createCircle(createVector(mouseX, mouseY), e.note.identifier);
    }

    changeMIDIIn() {
        let val = this.MIDIIn_selector.value();
        this.MIDIIn.removeListener();
        this.MIDIIn = WebMidi.getInputByName(val);
        this.MIDIIn.addListener("noteon", this.noteOn.bind(this));
    }
}
