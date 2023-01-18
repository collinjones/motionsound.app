class Emitter {
    constructor(simulation, pos, size, delay) {
        this.simulation = simulation;
        this.pos = pos;
        this.max_particles = 1;
        this.particles = [];
        this.trigger = new TimedTrigger(delay);
        this.text = null;
        this.mode = null;
        this.size = size
    }

    setMode(mode) {
        this.mode = mode;
    }

    addParticles() {
        if(this.trigger.canExecute()) {
            if (this.particles.length < this.max_particles) {
                let note = this.simulation.MIDIFactory.generateRandomNoteName();
                this.simulation.circles.push(new Circle(this.simulation, this.pos.x, this.pos.y, this.size, note, 0, 0.8))
            }
        }
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        noFill();
        stroke(0, 0, 0, 100)
        ellipse(0, 0, this.size * 2, this.size * 2);
        text(str((this.trigger.getTimeUntilExecution() / 1000).toFixed(1)), this.size + 5, this.size)
        pop();
    }
    
    emit() {
        this.addParticles();
        for (let i = 0; i < this.particles.length; i++) {
            this.cleanUp(i);
        }
        this.draw();
    }

    cleanUp(i) {
        if(this.particles.length != 0) {
            if (this.particles[i].checkIfOutsideBounds()) {
                this.particles.splice(i, 1);
            }
        }
    }
}