/*The lightning system used in this canvas is informed by the sketch found here: https://editor.p5js.org/remarkability/sketches/3ZDMmFqhR

Here is the link to video documentation:
https://vimeo.com/666706708

---WARNING, THIS SKETCH CONTAINS FLASHING LIGHT---

I have trained my own pix2pix model on images of lightning to make this interactive 
sketch. Move the mouse, click when lightning strikes. If you catch a square, press
enter to use the pix2pix model to fill in the blank.*/

let SIZE = 256,
    pix2pix,
    isProcessing = true,
    img,
    rectSize = 100,
    imgArraySize = 196,
    imgArray = [],
    looping = true;

//Lightning Variables.
let center,
    effectSize,
    steps,
    bolts,
    maxSteps = 30;

function preload() {
    // load a single random image.
    //    let v = floor(random(1, 196));
    //    img = loadImage("photos/resized/File " + String(v) + ".png");

    //load all images into an image array to call every frame.
    for (var i = 1; i < imgArraySize; i++) {
        imgArray[i] = loadImage("photos/resized/File " + String(i) + ".png");
    }
}

function setup() {
    let c = createCanvas(SIZE, SIZE);

    // load our model
    pix2pix = ml5.pix2pix("models/customModel.pict", modelLoaded);

    // draw background
    background(255);

    //initialise lightning variables.
    center = createVector(SIZE / 2, SIZE / 2);
    effectSize = SIZE / 2;
    bolts = [];
    strokeJoin(BEVEL);
    frameRate(15);
}

// Draw on the canvas when mouse is pressed
function draw() {
    //draw images.
    img = imgArray[floor(random(1, 196))]; //take a random image from the array.
    image(img, 0, 0, SIZE, SIZE);

    //draw discharge.
    stroke(255);
    if (random(0.0, 1.0) < 0.1) {
        let d = new Lightning(center, p5.Vector.random2D(), 0.01);
        bolts.push(d);
    }
    //filter the array to only keep the bolts that are still active.
    bolts = bolts.filter(blt => !blt.done());

    for (let i = 0; i < bolts.length; i++) {
        bolts[i].update(5 - i % -15); //only update the discharge every so often, creating the effect of a lightning bolt.
        bolts[i].draw();
    }
    center = createVector(mouseX, mouseY);
}

function Lightning(pos, v0, spawnProb) {
  this.pos = [pos.copy()]; //change to pos? 
  this.v0 = v0;
  this.spawnProb = spawnProb;
  this.squareLoc;
  
  //begin functions.
  this.update = function(stepNo){
    let point0 = this.pos[this.pos.length - 1]; //get the last point in the array.
    for(let i = 0; i < stepNo; i++) {
      let point1 = createVector(point0.x + v0.x*8, point0.y + v0.y*8); //create the next child spawn point based upon random angle * 4.
      this.pos.push(point1); //push the next spawn point to the position array.
      point0 = point1; //set the current point to the next point we just calculated.
      v0.add(p5.Vector.random2D().mult(0.74)); 
      v0.normalize(); //set a new spawn angle for the next child.
    }
  }
  
  this.draw = function() {
    
    for(let i = 1; i < this.pos.length; i++){
      let point0 = this.pos[i-1]; //set the first point to the last point calculated.
      let point1 = this.pos[i]; //set the next point to the point just calculated. 
      line(point0.x, point0.y, point1.x, point1.y); //draw the line between them. 
      if(i == 25){ //if there are 25 points calculated, create the point to draw the square.
        this.squareLoc = createVector(point1.x, point1.y);
      }
    }
    if(this.squareLoc){
      rect(this.squareLoc.x, this.squareLoc.y, 100, 100); //draw the square at the point created earlier.
    }
  }
  
  this.done = function() {
    return this.pos.length > maxSteps; //return done when the length of the Lightning exceeds its maximum.
  }
}

function keyPressed() {
    if (keyCode === RETURN && !isProcessing) {
        // press return to start transfer
        runPix2Pix();
    } else if (keyCode == 67) {
        // press c to capture canvas.
        saveCanvas("myCanvas", "jpg");
    }
}

function mouseMoved() {
    
}

function mousePressed() {
    if (looping && isProcessing == false) { //make sure clicks dont work when pix2pix is running.
        looping = false;
        noLoop();
    } else if(looping == false && isProcessing == false){
        looping = true;
        loop();
        draw();
    }
}

function modelLoaded() {
    console.log('model loaded');
    isProcessing = false;
}

function runPix2Pix() {
    // Update status message
    isProcessing = true;
    console.log("applying pix2pix");

    // pix2pix requires a canvas DOM element, we can get p5.js canvas and pass this
    // Select canvas DOM element, this is the p5.js canvas
    const canvasElement = select("canvas").elt;

    // Apply pix2pix transformation
    pix2pix.transfer(canvasElement).then((result) => {
        isProcessing = false;
        let rec_img = createImg(result.src, "a generated image using pix2pix"); // hide the DOM element
        rec_img.hide();
        image(rec_img, 0, 0, width, height); // draw the image on the canvas
        //        rec_img.remove(); // this removes the DOM element, as we don't need it anymore
    });
}
