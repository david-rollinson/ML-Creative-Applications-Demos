/* D+ML4CP Week 6 --- Style transfer on a webcam */

/* I have attempted a slit-scanning effect with aid from the
Coding Train challenge here: https://www.youtube.com/watch?v=hckvHFDGiJk&t=797s
and the Coding Train p5js sketch here: https://editor.p5js.org/codingtrain/sketches/B1L5j8uk4 */

/*SKETCH DOESNT WORK THROUGH THE EDITOR SINCE THE MODELS ARE NOT COMPATIBLE AND CANNOT BE UPLOADED*/

/*SEE SUBMITTED ZIP FILE FOR MORE DETAILED COMMENTS*/

let style1,
    video,
    img,
    graphics;

let scanGraphics,
    slitHeight = 20,
    slitWidth = 5,
    slitLocX = 0,
    slitLocY = 0,
    slice,
    slices = [],
    wSlices = [],
    sliceIndex = 0,
    wSliceIndex = 0,
    offset = 0,
    mode = 0;

let _width = 640;
let _height = 480;

function setup() {
    createCanvas(_width, _height);

    //load webcam feed.
    video = createCapture(VIDEO, videoLoaded);
    video.size(_width, _height);
    video.hide();

    //create graphics canvases. 
    graphics = createGraphics(_width, _height);
    scanGraphics = createGraphics(_width, _height);

    //setup vertical slitscanning array.    
    for (var i = 0; i < height / slitHeight; i++) {
        slices[i] = createImage(width, height);
    }
    
    //setup horizontal slitscanning array.
    for (var y = 0; y < width / slitWidth; y++) {
        wSlices[y] = createImage(width, height);
    }

    background(220);
}

function videoLoaded(stream) {
    //load the model.
    style1 = ml5.styleTransfer("models/udnie", modelLoaded); // try out mathura too!
}

function modelLoaded() {
    console.log("Model loaded");
    //begin style transfer. 
    transferStyle();
}

function transferStyle() {
    // we transfer based on graphics, graphics contains a scaled down video feed
    style1.transfer(graphics, function (err, result) {
        let tempDOMImage = createImg(result.src).hide();
        img = tempDOMImage;
        tempDOMImage.remove(); // remove the temporary DOM image
        scanGraphics.image(img, 0, 0, width, height);
        // recursively call function so we get live updates
        transferStyle();
    });
}

function draw() {
    push();
    translate(_width, 0);
    scale(-1, 1);
    // Switch between showing the raw camera or the style
    if (img) {
        image(img, 0, 0, _width, _height);
    }

    // this puts the video feed into the invisible graphics canvas
    graphics.image(video, 0, 0, _width, _height);

    switch (mode) {
        case 0:
            /*SLITSCAN TIME BEND*/
        if (scanGraphics) {
            scanGraphics.loadPixels();

            slices[sliceIndex].copy(scanGraphics, 0, 0, width, height, 0, 0, width, height);
            sliceIndex = (sliceIndex + 1) % slices.length;

            for (var j = 0; j < slices.length; j++) {
                var slitLocY = j * slitHeight;
                var curIndex = (j + offset) % slices.length;
                copy(slices[curIndex], 0, slitLocY, width, slitHeight, 0, slitLocY, width, slitHeight);
            }
            offset++;
        }
        break;
        
        case 1:
            /*SLITSCAN STRETCH*/
        if (scanGraphics) {
            scanGraphics.loadPixels();

            slices[sliceIndex].copy(scanGraphics, 0, height / 2, width, slitHeight, 0, 0, width, slitHeight);
            for (var k = 0; k < slices.length; k++) {
                var curIndex1 = (k + offset) % slices.length;
                image(slices[curIndex1], 0, slitHeight * k);
            }
            offset++;
            sliceIndex = (sliceIndex + 1) % slices.length;
        }
        break;
            
        case 2:
            /*SLITSCAN HORIZONTAL (not yet working)*/
        if (scanGraphics) {
            scanGraphics.loadPixels();

            slices[wSliceIndex].copy(scanGraphics, width / 2, 0, slitWidth, height, 0, 0, slitWidth, height);
            for (var l = 0; l < wSlices.length; l++) {
                var wCurIndex = (l + offset) % wSlices.length;
                image(wSlices[wCurIndex], slitWidth * l, 0);
            }
            offset++;
            wSliceIndex = (wSliceIndex + 1) % wSlices.length;
        }
        break; 
    }
    pop();
}

function keyPressed() {
    if (keyCode == 32) {
        mode++;
        if (mode > 2) {
            mode = 0;
        }
        print("Mode: " + mode);
    } 
    
    if (keyCode == 67) {
        // press c to capture canvas.
        saveCanvas("myCanvas", "jpg");
    }
}
