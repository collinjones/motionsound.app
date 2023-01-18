class UI {
    constructor (simulation) {
        this.simulation = simulation 
        this.currentObjectDrawType = "Circle";

        this.MIDIIn_selector = null;
        this.MIDIOut_selector = null;
        this.checkboxStatic = null;
        this.selectObjectDrawType = null;
        this.buttonClearScene = null;
        this.selectRoot = null;
        this.selectMode = null;

        this.UIElements = [];

        var rect = document.getElementById('defaultCanvas0').getBoundingClientRect();
        this.canvasBottomY = floor(rect.bottom);
        this.canvasTopY = floor(rect.top);
        this.canvasLeftX = floor(rect.left);
        this.canvasRightX = floor(rect.right);
        this.ready = false;

        this.setup();
    }

    /* MAIN LOGIC */

    update() {
        if (this.ready) {
            if (this.mouseHoveringUI()) {
                this.showUI() 
                this.simulation.disableInteraction();
            } else {
                this.hideUI();
                this.simulation.enableInteraction();
            }
        }
    }

    /* SETUP METHODS */

    setup () {
        this.setupObjectDrawSelector();
        this.setupClearSceneButton();
        this.setupModeSelector();
        this.setupRootSelector();
        this.setupPlatformStaticCheckbox();
        this.ready = true;
    }

    setupMIDIIO() {
        this.setupMIDIInput();
        this.setupMIDIOutput();
    }

    setupMIDIInput() {
        this.MIDIIn_selector = createSelect();
        this.MIDIIn_selector.changed(this.simulation.MIDIIn_controller.changeMIDIIn.bind(this));
        this.MIDIIn_selector.position(width - 100, height);
        this.MIDIIn_selector.id('midi-in-dropdown')
        this.MIDIIn_selector.option('MIDI Input')

        /* Populating dropdown list */
        for (let i = 0; i < WebMidi.inputs.length; i++) {
            this.MIDIIn_selector.option(WebMidi.inputs[i].name);
        }
        // this.simulation.MIDIIn_controller.MIDIIn = WebMidi.getInputByName(this.MIDIIn_selector.value());
        

        // this.simulation.MIDIIn_controller.MIDIIn.addListener("noteon", this.simulation.MIDIIn_controller.noteOn.bind(this));
        this.addToElementPool(this.MIDIIn_selector, true);
    }

    setupMIDIOutput() {
        /* Create and position selector */
        this.MIDIOut_selector = createSelect();
        this.MIDIOut_selector.changed(this.simulation.MIDIOut_controller.changeMIDIOut.bind(this));
        this.MIDIOut_selector.position(width - this.MIDIOut_selector.width + 10, height);
        this.MIDIOut_selector.id('midi-out-dropdown');
        this.MIDIIn_selector.option('MIDI Output')

        /* Populating dropdown list */
        for (let i = 0; i < WebMidi.outputs.length; i++) {
            this.MIDIOut_selector.option(WebMidi.outputs[i].name)
        }
        this.simulation.MIDIOut_controller.MIDIOut = WebMidi.getOutputByName(this.MIDIOut_selector.value());
        this.addToElementPool(this.MIDIOut_selector, true);
    }

    setupPlatformStaticCheckbox() {
        this.checkboxStatic = createCheckbox('Static', false);

        this.checkboxStatic.position(this.canvasLeftX + 10, 
            this.selectObjectDrawType.y + this.selectObjectDrawType.height + 10);

        this.checkboxStatic.hide();
        this.addToElementPool(this.checkboxStatic, false);
    }

    setupObjectDrawSelector() {
        this.selectObjectDrawType = createSelect();
        this.selectObjectDrawType.changed(this.changeObjectType.bind(this)).position(10 + this.canvasLeftX, this.canvasBottomY - 75);
        this.selectObjectDrawType.option("Circle")
        this.selectObjectDrawType.option("Platform")
        this.selectObjectDrawType.option("Emitter");
        this.addToElementPool(this.selectObjectDrawType, true);
    }

    setupClearSceneButton() {
        this.buttonClearScene = createButton('Clear all');
        this.buttonClearScene.position(
            this.canvasLeftX + 10, 
            this.canvasBottomY - 100
        ).mousePressed(this.clearScene.bind(this));
        this.addToElementPool(this.buttonClearScene, true);
    }

    setupRootSelector() {
        this.selectRoot = createSelect();
        this.selectRoot.changed(this.changeRoot.bind(this));
        this.selectRoot.position(10, this.selectMode.y + this.selectMode.height + 10);
        var roots = Object.keys(this.simulation.MIDIFactory.noteNames)
        for (let i = 0; i < roots.length; i++) {
            this.selectRoot.option(roots[i]);
        }
        this.selectRoot.hide();
        this.addToElementPool(this.selectRoot, false);
    }

    setupModeSelector() {
        this.selectMode = createSelect();
        this.selectMode.changed(this.changeMode.bind(this));
        this.selectMode.position(10, this.selectObjectDrawType.y + this.selectObjectDrawType.height + 10); 

        /* Populate selector options with available modes */
        var mode_keys = Object.keys(this.simulation.MIDIFactory.modes)
        for (let i = 0; i < mode_keys.length; i++) {
            this.selectMode.option(mode_keys[i])
        }
        this.selectMode.hide();
        this.addToElementPool(this.selectMode, false);
    }


    /* CALLBACKS */

    changeRoot() {
        this.simulation.MIDIFactory.setNewRoot(this.selectRoot.value());
    }

    changeMode(){
        let newMode = this.simulation.MIDIFactory.modes[this.selectMode.value()];
        this.simulation.MIDIFactory.setNewMode(newMode);
    }

    clearScene() {
        Composite.clear(this.simulation.world); 
        this.simulation.boundaries = [];
        this.simulation.circles = [];
        this.simulation.emitters = [];
    }

    changeObjectType() {
        this.currentObjectDrawType = this.selectObjectDrawType.value();
        if (this.currentObjectDrawType == "Platform") {
            this.checkboxStatic.show();
            this.activateElement(this.checkboxStatic);
        } else {
            this.checkboxStatic.hide();
            this.deactivateElement(this.checkboxStatic);
        }

        if (this.currentObjectDrawType == "Emitter") {
            this.selectMode.show();
            this.selectRoot.show();
            this.activateElement(this.selectMode);
            this.activateElement(this.selectRoot);
        } else {
            this.selectMode.hide();
            this.selectRoot.hide();
            this.deactivateElement(this.selectMode);
            this.deactivateElement(this.selectRoot);
        }
    }

    /* UTILITIES */

    addToElementPool(element, active) {
        this.UIElements.push({
            element: element, 
            active: active,
        })
    }

    hideUI() {
        for (let element in this.UIElements) {
            this.UIElements[element].element.hide();
        }
    }

    showUI() {
        for (let element in this.UIElements) {
            if (this.UIElements[element].active){
                this.UIElements[element].element.show();
            }
        }
        
    }

    mouseHoveringUI() {
        return mouseY < height && mouseY > height - 100
    }

    activateElement(UIElement) {
        for (let element in this.UIElements) {
            if (UIElement == this.UIElements[element]) {
                this.UIElements[element].active = true;
            }
        }
    }

    deactivateElement(UIElement) {
        for (let element in this.UIElements) {
            if (UIElement == this.UIElements[element]) {
                this.UIElements[element].active = false;
            }
        }
    }
}