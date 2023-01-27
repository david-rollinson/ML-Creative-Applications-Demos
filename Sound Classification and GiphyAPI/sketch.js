/*
  ****!!!!****!!!! CONTAINS SOUND !!!!****!!!!****
  D+ML4CP Week 8. Speech detection via sound recognition.
  
  I have created a simple audio responsive sketch that displays a Gif in response to onomatopoeic buzz words/sounds (listed below). My hope was to create some sort of insane feedback loop where the sounds played feed back into the program & are used as the basis for searching for the next sound. 
  The gif aspect was an attempt to add a dynamic visual element, as well as to experiment with API implementation. 
  
  I used the Coding Train's videos on the Giphy API for help. Link here:
  https://www.youtube.com/watch?v=mj8_w11MvH8
  
  I used the Sophie sample pack from Splice, found here:
  https://splice.com/sounds/splice/sophie-samples
  
  Sound labels: Argh, Background Noise, Bang, Buzz, Clap, Click, Clink, Crash, Pop, Scrape, Tap.
  
*/

/*SOUND CLASSIFICATION*/
let classifier,
    options = { probabilityThreshold: 0.7 },
    label = "",
    prevLabel = "",
    confidence = 0.0,
    soundModel = "https://teachablemachine.withgoogle.com/models/I1HCqNEV5/";

/*API SETUP*/
let api = "https://api.giphy.com/v1/gifs/search?",
    apiKey = "api_key=fF9WeLnNr1zgqptUsevOwVXhJGdg2ogv",
    openQuery = "&q=",
    query = " ",
    limit = 24,
    tags = "&limit=" + limit + "&offset=0&rating=g&lang=en",
    img,
    sounds = [];

let step = 0;

/*DECLARE AUDIO FILE VARIABLES*/
// let argh, bang, buzz, clap, click, clink, crash, pop_, scrape, tap;

function preload() {
  // load in classifier - provide options
  classifier = ml5.soundClassifier(soundModel + 'model.json');
  
  //load in audio files with string tags that match sound detection labels.
  sounds[0] = {tag: "Argh", sound: loadSound("argh.wav")};
  sounds[1] = {tag: "Bang", sound: loadSound("bang.wav")};    
  sounds[2] = {tag: "Buzz", sound: loadSound("buzz.wav")};
  sounds[3] = {tag: "Clap", sound: loadSound("clap.wav")};
  sounds[4] = {tag: "Click", sound: loadSound("click.wav")};
  sounds[5] = {tag: "Clink", sound: loadSound("clink.wav")};
  sounds[6] = {tag: "Crash", sound: loadSound("crash.wav")};
  sounds[7] = {tag: "Pop", sound: loadSound("pop.wav")};
  sounds[8] = {tag: "Scrape", sound: loadSound("scrape.wav")};
  sounds[9] = {tag: "Tap", sound: loadSound("tap.wav")};
  
}

function setup() {
  createCanvas(500,550);
  // start classification, tell ml5.js to call gotResult when we have an idea what this is
  classifier.classify(gotResult);
}

function draw() {
  // background(lerpColor(color(255,0,0), color(0,255,0), confidence));
  background(0);
      
  if(prevLabel != label && label != "Background Noise"){
    //only find a new gif when a new label is used.
    let url = api + apiKey + openQuery + label + tags;
    loadJSON(url, gotData);
    //only find and play a sound when a new label is used.
    findSound(label);
  }
  
  // draw label
  fill(255);
  textSize(40);
  textAlign(CENTER);
  text(label, 0, 510, width, 50);
    
   // draw confidence
   textSize(20);
   textAlign(LEFT);
   text(confidence, 10, 510, width - 10, 50);
  
  prevLabel = label;
}

function gotData(gif){
  print(gif);
  index = floor(random(0, limit));
  print("Image " + index + " of " + limit + ".");
  //create an image from the url, save it inside the img variable.
  img = createImg(gif.data[index].images.original.url, "Gif", "");
  img.position(0,0);
  img.size(500,500);
  // img.hide(); //hide the image inside the DOM element.
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  step++; //use a step function to break up each sound classification so they do not overlap. 
  if (error) {
    // check for error
    return console.log(error);
  } else if (step % 5 < 3) {
      console.log(results);

      // save these values
      label = results[0].label;
      confidence = nf(results[0].confidence, 0, 2); // Round the confidence to 0.01
    }
}

function findSound(_label){
    for(var i = 0; i < sounds.length; i++){
      //iterate through all the sounds. Play the one which has a tag the same as the sound detection label. 
      if(sounds[i].tag == _label){
        sounds[i].sound.play();
        
      }
    }
}
