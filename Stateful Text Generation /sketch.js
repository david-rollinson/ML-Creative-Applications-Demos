/* DML4CP - Stateful generation CharRNN */

/*THIS SKETCH USES THE WORDNIK API TO GENERATE SEED TEXT FOR THE CHARRNN MODEL,
then outputs the resultant text prediction to a basic particle system adapted from here:
https://p5js.org/examples/simulate-particle-system.html

I used the coding train's video on the wordnik api, found here:
https://www.youtube.com/watch?v=YsgdUaOrFnQ

I referenced a p5 piano from this sketch:
https://editor.p5js.org/monniqian/sketches/TwckaaeGl

The audio increases by 3 semitones after each successive letter drawn to the canvas. If a new
word is begun, the new word is drawn to a different location on the canvas and the base note of
the oscillator is reset. This creates a scale effect that increases in pitch depending upon the 
length of the word. As a result, the words kind of bubble up and fade away into the background.*/

let charRNN,
    textInput,
    tempSlider,
    startBtn,
    resetBtn,
    singleBtn,
    printArrayBtn,
    generating = false,
    generated_text = "";

let system,
    randVec,
    txtSize = 32;

/*API SETUP*/
let api = "https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&", //queries a random word. 
    apiKey = "api_key=" + "z89392jjf3gq0d4qh4t9ehiv1ebz3c93tchw5jb3kew559lo4",
    url,
    word;
/* 
https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=z89392jjf3gq0d4qh4t9ehiv1ebz3c93tchw5jb3kew559lo4
*/

/* OSCILLATOR SETUP*/
let baseNote = 40,
    osc;

function preload() {

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER);
  randVec = createVector(width/2, height/2); //draw the seed text at the centre of the screen.
  system = new WordSystem(randVec); //create a new particle system for letters. 
  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('./models/woolf/', modelReady);
  
  // Grab the DOM elements
  tempSlider = select('#tempSlider');
  startBtn = select('#start');
  resetBtn = select('#reset');
  singleBtn = select('#single');
  printArrayBtn = select('#printArray') //new print array button to check the array at different points to check its working correctly. 

  // DOM element events
  startBtn.mousePressed(generate);
  resetBtn.mousePressed(resetModel);
  singleBtn.mousePressed(predict);
  printArrayBtn.mousePressed(printArray);
  tempSlider.input(updateSliders);
  
  //Load JSON to pull a seed word.
  url = api + apiKey;
  loadJSON(url, gotData);
 
  //Initialise sinewave oscillator.
  osc = new p5.SinOsc();
  osc.freq(midiToFreq(baseNote));
  osc.amp(0.5);
}

function draw() {
  background(0);
  fill(255);
    
  if(system){
    system.run();
  }
}

function gotData(wordnik){
    print(wordnik);
    word = wordnik.word; //take the word from the wordnik api and set it as a global variable to be read as seed text.
    print(word);
    resetModel(); //add the word to the charRNN seed and the particle system array. 
}

// Update the slider values
function updateSliders() {
  select('#temperature').html(tempSlider.value());
}

async function modelReady() {
//  select('#status').html('Model Loaded');
  print("Model Ready.")
  resetModel(); //reset the model again to draw the seed text to the screen. 
}

function resetModel() {
  charRNN.reset();
  randVec = createVector(width/2, height/2); //always draw the seed text at the origin point (centre).
  /*CHANGE SEED HERE*/
  let seed = word;
  charRNN.feed(seed);
  generated_text = seed;
  if(system){
    system.addWord(seed); /*THIS IS WHERE THE WORD IS LOADED INTO THE PARTICLE SYSTEM*/
  }
}

function generate() {
  if (generating) {
    generating = false;
    startBtn.html('Start');
    osc.stop(); //when the model stops predicting, stop the oscillator.
  } else {
    generating = true;
    startBtn.html('Pause');
    loopRNN(); //loop predictions. 
    osc.start(); //when the model begins predicting, begin the oscillator. 
  }
}

function printArray() {
    print(system.words);
}

async function loopRNN() {
  while (generating) {
    await predict();
  }
}

async function predict() {
  let temperature = tempSlider.value();
  let next = await charRNN.predict(temperature);
  await charRNN.feed(next.sample);
  generated_text += next.sample;
  baseNote += 3; //increase oscillator by 3 semitones with each letter added to generated text sample.
  osc.freq(midiToFreq(baseNote)); //set the oscillator frequency.
    if(system){
        system.addWord(next.sample); //add the letter to the particle sytem.
        system.run(); //display and update it. 
    }
  
}

let WordCloud = function(word, position){
    this.lifespan = 255;
    this.position = position.copy(); //copy in the position of the last letter so we can iterate it to create scrolling text.
    this.word = word;
}

WordCloud.prototype.run = function(){
    this.update();
    this.display();
}

WordCloud.prototype.update = function(){
    this.lifespan -=5; //decrease alpha value of text by 5 each frame. 
}

WordCloud.prototype.display = function(){
    stroke(255, this.lifespan);
    strokeWeight(2);
    fill(255 ,this.lifespan);
    textSize(txtSize);
    text(this.word, this.position.x, this.position.y);
}

WordCloud.prototype.isDead = function(){
    return this.lifespan < 0; //return true if dead. 
}

let WordSystem = function(position){
    this.origin = position.copy();
    this.words = [];
}

WordSystem.prototype.addWord = function(word){
    if(word != " "){
        this.words.push(new WordCloud(word, randVec)); 
        randVec.x = randVec.x + txtSize/1.5;
    } else {
        randVec = createVector(random(10,width - 100), random(txtSize,height - txtSize)); //if theres a space between words, begin at a new position on the screen. 
        baseNote = 40; //set the oscillator frequency back to its original pitch.
        osc.freq(midiToFreq(baseNote));
    }
}

WordSystem.prototype.run = function(){
    for(let i = this.words.length - 1; i > 0; i--){ //make sure the seed word is not spliced. 
        let w = this.words[i];
//        print(this.words[i]);
        w.run();
        if(w.isDead()){ 
            this.words.splice(i, 1); //remove the word from the particle array once it's no longer shown on the screen. 
        }
    }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}