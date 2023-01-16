var Engine = Matter.Engine,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint

var simulation;
var startMouseVector;
var start_vector_set = false;
var distance = 0;
var angle = 0;
var drawing_rect = false;
var paused = false;

function windowResized() {
    resizeCanvas(windowWidth - 100, 800);
}

function setup() {
    canvas = createCanvas(windowWidth - 100, 800);
    rectMode(CENTER)
    simulation = new Simulation(canvas);
}

function draw() {
    if (!paused) {
        simulation.run();
        if(drawing_rect) {
            drawRect();
        }
    }
        
    if (!focused) {
        paused = true;
    } else {
        paused = false;
    }
}

// REFACTOR probably encapsulated inside boundary somehow
// Draws platforms in real-time as user drags to resize 
function drawRect() {
    push();
    translate(startMouseVector.x, startMouseVector.y)
    stroke(color(255, 204, 0, 100))
    if (simulation.checkbox_static.checked()) {
        fill(255, 204, 0);
    } else {
        noFill();
        ellipse(0, 0, 5, 5)    
    }
    
    rotate(angle)
    rect(0, 0, distance * 2, 10);
    pop();
}

function mouseInBounds() {
    return mouseX >= 1 && mouseX <= width && mouseY <= height && mouseY >= 1 ? true : false;
}

function mousePressed() {
    if (mouseButton === LEFT){
        if (simulation.current_draw_type == "Circle" && mouseInBounds()) {
            simulation.createCircle(createVector(mouseX, mouseY), simulation.MIDIFactory.generateRandomNoteName());
        } else if (simulation.current_draw_type == "Emitter" && mouseInBounds()) {
            simulation.createEmitter();
        }
    }
}

function mouseDragged() {
    if(simulation.current_draw_type == "Platform" && mouseInBounds()
        && mouseButton === LEFT) {
        if(!start_vector_set) {
            startMouseVector = createVector(mouseX, mouseY)
            start_vector_set = true; 
        } else {
            let currentMouseVector = createVector(mouseX, mouseY)
            let angleV = createVector(mouseX - startMouseVector.x, mouseY - startMouseVector.y);
            distance = floor(startMouseVector.dist(currentMouseVector));
            angle = angleV.heading();
            drawing_rect = true; 
        }
    }  
}

function mouseReleased() {
    if (start_vector_set) {
        simulation.createBoundary(
            startMouseVector, angle, distance * 2, simulation.checkbox_static.checked()
        );
        start_vector_set = false;
        drawing_rect = false;
    }
}