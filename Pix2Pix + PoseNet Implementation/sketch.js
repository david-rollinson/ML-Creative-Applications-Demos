/* D+ML4CP Week 5 - Pose estimation with webcam */

//MOVE HANDS AND SHOULDERS TO DRAW!

//I have made a drawing app for poseNet. It takes the locations of the shoulders and hands and uses them to draw to a graphics object. I have attempted to simulate double pendulum physics with the help of a Coding Train tutorial (referenced in the pendulum.js class). I initially thought simulating pendulum physics would help to smooth the jitteriness of the detections, however I couldn't work out how to smooth the acceleration and velocity between detected points and apply them to the pendulum simulation. As a result, its just as jittery as before, but I think it still creates a level of unpredictability that could be interesting. I have applied pix2pix model functionality, however my laptop is too slow for it to work so it is untested!

let SIZE = 512;
let width = 512;
let height = 512;

let video, poseNet, poses = [];
    
let ready = false, paused = false; //setup booleans to control text display. 

let pendulum1, pendulum2;

let lastKeypoints = []; //stores the last keypoints. 

let leftHand, rightHand;

let buffer;

//DECLARE PREV XY VALUES FOR SHOULDERS AND HANDS.
let px1s, py1s, px1h, py1h, px2s, py2s, px2h, py2h;

//PIX2PIX
let pix2pix, isProcessing = true;

//------------------------------------------------

function setup() {
  createCanvas(SIZE*2, SIZE);
  
  // load the webcam, use the cameraReady() callback
  video = createCapture(VIDEO, cameraReady);
  video.size(SIZE, SIZE);
  
  buffer = createGraphics(width, height);
  buffer.background(0,0,255);
  
  //INITIALIZE PREV XY VALUES FOR SHOULDERS AND HANDS.
  px2s = width/8;
  py2s = height/3;
  px2h = 3*(width/8);
  py2h = 2*(height/3);
  px1h = 5*(width/8);
  py1h = 2*(height/3);
  px1s = 7*(width/8);
  py1s = height/3;
  
  //Generate 2 new pendulums. Set 2 different initial angles.
  pendulum1 = new Pendulum(0, 0);
  pendulum2 = new Pendulum(0, 0);
  pendulum1.setAngle(PI / 2);
  pendulum2.setAngle(-1*(PI / 2));
  
  // load pix2pix model.
  pix2pix = ml5.pix2pix("https://cdn1.joe.ac/models/pix2pix/edges2cats_AtoB.pict", modelLoaded);
}

function cameraReady(stream) {
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  
  // .on() is an event listener
  poseNet.on('pose', detectedPose);
  
  // Hide the video element, and just show the canvas
  video.hide();
}

function detectedPose(results) {
  // we store the pose in the poses global variable
  poses = results;
}

function modelReady() {
  console.log("PoseNet model ready");
  ready = true;
}

function draw() {
  push();
  //flip the image (move to left and scale in x dir)
  translate(video.width, 0);
  scale(-1, 1);
  imageMode(CORNER);
  background(255);
  image(buffer, 0, 0, width,height);
  // We can call both functions to draw all keypoints and the skeletons
  // drawKeypoints();
  // drawSkeleton();
  
  updateKeypoints();
  if (poses.length > 0) {
    //KEY: index 5 = left shoulder, 6 = right shoulder, 
    //9 = left hand, 10 = right hand.
    
    //SHOULDERS.
    let leftShoulder = createVector(lastKeypoints[5].x, lastKeypoints[5].y);
    let rightShoulder = createVector(lastKeypoints[6].x, lastKeypoints[6].y);
    pendulum1.setPosition(leftShoulder.x, leftShoulder.y);
    pendulum1.draw();
    pendulum2.setPosition(rightShoulder.x, rightShoulder.y);
    pendulum2.draw();
    
    //HANDS.
    leftHand = createVector(lastKeypoints[9].x, lastKeypoints[9].y);
    rightHand = createVector(lastKeypoints[10].x, lastKeypoints[10].y);
    circle(leftHand.x, leftHand.y, 10);
    circle(rightHand.x, rightHand.y, 10);
  }
      //BUFFER.
      buffer.stroke(0);
      buffer.strokeWeight(2);
      if (frameCount > 1 && poses.length > 0 && pendulum1.bob2.x != 0) {
      //LHS DRAW
      //SHOULDER------------------------------------------------
      buffer.line(px1s, py1s, pendulum1.bob2.x, pendulum1.bob2.y);
      px1s = pendulum1.bob2.x;
      py1s = pendulum1.bob2.y;
      //HAND------------------------------------------------
      buffer.line(px1h, py1h, leftHand.x, leftHand.y);
      px1h = leftHand.x;
      py1h = leftHand.y;
        
      //RHS DRAW
      //SHOULDER------------------------------------------------
      buffer.line(px2s, py2s, pendulum2.bob2.x, pendulum2.bob2.y);
      px2s = pendulum2.bob2.x;
      py2s = pendulum2.bob2.y;
      //HAND------------------------------------------------
      buffer.line(px2h, py2h, rightHand.x, rightHand.y);
      px2h = rightHand.x;
      py2h = rightHand.y;
  }
  
  pop();
    
//  video.loadPixels();
  
    
  //Flip and draw webcam element.
  push();
  translate(video.width*3, 0);
  scale(-1, 1);
  image(video, width, 0, width, height);
  pop();
  let box = get(width, 0, width*2, height);
  box.filter(POSTERIZE, 3);
  box.filter(INVERT);
  //tint(0, 0, 255, 255);
  image(box, width, 0, width*2, height);
  
  textSize(12);
  textAlign(CENTER, CENTER);
  fill(0);
  strokeWeight(0);
  if(ready == true && poses.length > 0){
    text("Move your hands and shoulders, click to stop, then run Pix2Pix with ENTER.", width/2, 50);
  } else if (ready == false && paused == false) {
    text("Loading...", width/2, height/2);
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  console.log(poses);
  for (let this_pose of poses) {
    let pose = this_pose.pose;
    
    for (let keypoint of pose.keypoints) {
      // if we are confident of keypoint we draw it
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let this_pose of poses) {
    let skeleton = this_pose.skeleton;
    
    for (let parts of skeleton) {
      let partA = parts[0];
      let partB = parts[1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function updateKeypoints() {
  //this function references this sketch: 
  //https://editor.p5js.org/golan/sketches/HJCtV3zim
  if (poses.length <= 0) {
    return;
  }
  //Update and store the lastKeypoints.
  let pose = poses[0].pose;
  let keypoints = pose.keypoints;
  for (let i = 0; i < keypoints.length; i++) {
    lastKeypoints[i] = keypoints[i].position;
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

function mousePressed(){
  //Stop everything when the mouse is pressed. 
  ready = false;
  paused = true;
  noLoop();
  video.remove();
}

function modelLoaded() {
    console.log('Pix2Pix Model Loaded');
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
        let rec_img = createImg(result.src, "a generated image using pix2pix").hide(); // hide the DOM element
        image(rec_img, 0, 0, SIZE*2, SIZE); // draw the image on the canvas
        rec_img.remove(); // this removes the DOM element, as we don't need it anymore
    });
}