/*
  p5.js 3D Anaglyph Effect 
  (for red / cyan glasses)

  Jenna deBoisblanc
  jdeboi.com
  12/20/22
*/

let anaglyph;
let imgLeft, imgRight;

async function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    anaglyph = createAnaglyph(this);

    imgLeft = await loadImage("left.jpeg");
    imgRight = await loadImage("right.jpeg");
}

function draw() {
    background(255);
    anaglyph.drawStereoImages(imgLeft, imgRight, mouseX-width/2, 0);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    anaglyph.resize();
}