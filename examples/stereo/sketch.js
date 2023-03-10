/*
  p5.js 3D Anaglyph Effect 
  (for red / cyan glasses)

  Jenna deBoisblanc
  jdeboi.com
  12/20/22
*/

let anaglyph;
let imgLeft, imgRight;

// TODO 
// for some reason calling preload() creates extra WEBGL contexts
// and the browser complains?? There can apparently be 8 max
// There's the original canvas, 2 in the library (left / right buffers)
// and then two images => 1 + 2 + 2 = 5, so not sure what the deal
// is... but it works when the preload is taken out. Confused.

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    anaglyph = createAnaglyph(this);

    imgLeft = loadImage("left.jpeg");
    imgRight = loadImage("right.jpeg");
}

function draw() {
    background(255);
    anaglyph.drawStereoImages(imgLeft, imgRight, mouseX-width/2, 0);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    anaglyph.resize();
}