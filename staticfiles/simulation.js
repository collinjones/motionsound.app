class Simulation {
     
    constructor (canvas) {
        this.canvas = canvas;
        this.engine = null;
        this.world = null;
        this.mouse = null;

        this.circles = [];
        this.boundaries = [];
        this.emitters = [];

        this.screen_boundary;

        this.screen_div = 50;
        this.width_div = width / this.screen_div
        this.height_div = height / this.screen_div

        this.button_clearAll = createButton('Clear all');
        this.select_objectType = createSelect();
        this.select_mode = createSelect();
        this.select_root = createSelect();
        this.slider_circleSize = createSlider(5, 25, 10, 1); // 5 to 25, default 10, 1 step increments 
        this.checkbox_static = createCheckbox('Static', false);
        this.current_draw_type = "Circle";

        this.MIDIOut_controller = new MIDIOutput();  // midi output controller
        this.MIDIIn_controller = new MIDIInput(this);  // midi output controller
        this.MIDIFactory = new MIDIFactory();
        this.setup();
    }

    setup() {
        
        WebMidi.enable().then(this.onEnabled.bind(this)).catch(err => alert(err));
        this.inputSetup();
        this.engine = Engine.create();
        this.world = this.engine.world;  
        this.mouse = new Mouse(this);
        this.engine.timing.timeScale = 0.5

        /* Add collision listener with collisionEvent as callback */
        Events.on(this.engine, 'collisionStart', this.collisionEvent.bind(this))

        Runner.run(this.engine);
        this.MIDIFactory.deriveMode();
    }

    draw() {
        this.drawPlatforms();
        this.drawCircles(); 
        this.mouse.draw();
    }

    run() {
        background('gray');
        this.update();
        this.draw();
    }

    update() {
        this.updateEmitters();
    }

    changeMode(){
        let newMode = this.MIDIFactory.modes[this.select_mode.value()];
        this.MIDIFactory.setNewMode(newMode);
    }

    changeRoot() {
        this.MIDIFactory.setNewRoot(this.select_root.value());
    }

    inputSetup() {
        var rect = document.getElementById('defaultCanvas0').getBoundingClientRect();
        var canvasBottomY = floor(rect.bottom);


        this.button_clearAll.position(width - this.button_clearAll.width - 10, canvasBottomY + 10);
        this.button_clearAll.mousePressed(this.clearCanvas.bind(this))

        this.select_objectType.changed(this.changeObjectType.bind(this));
        this.select_objectType.position(10, canvasBottomY + 10);
        this.select_objectType.option("Circle");
        this.select_objectType.option("Platform");
        this.select_objectType.option("Emitter");

        this.select_mode.changed(this.changeMode.bind(this));
        this.select_mode.position(10, this.select_objectType.y + this.select_objectType.height + 10);  
        var mode_keys = Object.keys(this.MIDIFactory.modes)
        for (let i = 0; i < mode_keys.length; i++) {
            this.select_mode.option(mode_keys[i])
        }
        this.select_mode.hide();

        this.select_root.changed(this.changeRoot.bind(this));
        this.select_root.position(10, this.select_mode.y + this.select_mode.height + 10);
        var roots = Object.keys(this.MIDIFactory.noteNames)
        for (let i = 0; i < roots.length; i++) {
            this.select_root.option(roots[i]);
        }
        this.select_root.hide();

        this.slider_circleSize.position(
            this.select_objectType.x,
            this.select_objectType.y + this.select_objectType.height + 10
        );

        this.checkbox_static.position(10, this.select_objectType.y + this.select_objectType.height + 10)
        this.checkbox_static.hide();

        this.button_clearAll.id('clearall-button');
        this.select_objectType.id('object-type-dropdown');
        this.slider_circleSize.id('circle-size-slider');
        this.checkbox_static.id('static-platform-checkbox')
    }

    changeObjectType() {
        this.current_draw_type = this.select_objectType.value();
        if (this.current_draw_type == "Platform") {
            this.checkbox_static.show();
        } else {
            this.checkbox_static.hide();
        }

        if (this.current_draw_type == "Circle") {
            this.slider_circleSize.show();
        } else {
            this.slider_circleSize.hide();
        }

        if (this.current_draw_type == "Emitter") {
            this.select_mode.show();
            this.select_root.show();
        } else {
            this.select_mode.hide();
            this.select_root.hide();
        }
    }

    clearCanvas() {
        Composite.clear(this.world); 
        this.boundaries = [];
        this.circles = [];
        this.emitters = [];
    }

    onEnabled() {
        this.MIDIOut_controller.setup(createVector(
            this.button_clearAll.x - 60, 
            this.button_clearAll.y + this.button_clearAll.height + 10
        ));

        this.MIDIIn_controller.setup(createVector(
            this.MIDIOut_controller.MIDIOut_selector.x, 
            this.MIDIOut_controller.MIDIOut_selector.y + this.MIDIOut_controller.MIDIOut_selector.height + 5
        ));
    }

    drawCircles() {
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].draw();

            /* Remove circle if out of bounds */
            if (this.circles[i].checkIfOutsideBounds()) {
                this.circles.splice(i, 1)
            }
    
            /* Break loop if all circles are destroyed */
            if (this.circles.length == 0) {
                break;
            }
        }
    }

    drawPlatforms() {
        for (let x = 0; x < this.boundaries.length; x++) {
            this.boundaries[x].draw();
            //this.boundaries[x].update();
        }
    }

    updateEmitters() {
        for (let i = 0; i < this.emitters.length; i++) {
            this.emitters[i].emit();
        }
    }

    /* Generate rotating platforms */
    generateRotatingPlatforms() {
        for (let y = 0; y < this.height_div; y++) {
            this.boundaries[y] = [];
            for (let x = 0; x < this.width_div; x++) {
                this.boundaries[y].push(new Boundary(this,           // sim
                    (x * this.screen_div) + this.screen_div / 2,     // x pos
                    (y * this.screen_div) + this.screen_div / 2,     // y pos
                    this.screen_div,                                 // width
                    this.screen_div/10,                              // height
                    random(5),                                       // angle
                    random(0.05) + 0.01,                             // angle velocity
                    color(255, 204, 0))),
                    true
            }
        }
    }

    /* Function triggered on a collision event */
    collisionEvent(event) {

        var pairs = event.pairs;

        /* For each pair */
        for(let i = 0; i < pairs.length; i++) {
            var bodyA = pairs[i].bodyA;
            var bodyB = pairs[i].bodyB;

            if (bodyA.label == "Circle Body" && bodyB.label == "Rectangle Body" ||
                bodyB.label == "Circle Body" && bodyA.label == "Rectangle Body") {
                /* Find the circle body and handle its collision event */
                if (bodyA.label == "Circle Body") {
                    this.circleCollisionEvent(bodyA); 
                } else if (bodyB.label == "Circle Body") {
                    this.circleCollisionEvent(bodyB);
                }
            }
        }
    }

    /* Function triggered on a circle collision event */
    circleCollisionEvent(body) {
        
        /* Find the circle in the array of circles */
        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i].body.id == body.id) {
                this.circles[i].collisionEvent();
                break;
            }
        }  
    }

    

    /* Generate a new circle */
    createCircle(pos, note) {
        this.circles.push(new Circle(this, pos.x, pos.y, this.slider_circleSize.value(), note, 0, 0.5))
    }

    createEmitter() {
        this.emitters.push(new Emitter(this, createVector(mouseX, mouseY)));
    }

    createBoundary(pos, angle, size, isStatic) {
        this.boundaries.push(new Boundary(this, pos.x, pos.y, size, 10,                  
            angle, 0, color(255, 204, 0), isStatic));                           
    }

}