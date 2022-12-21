/*
  p5.js 3D Anaglyph Effect 
  (for red / cyan glasses)

  Jenna deBoisblanc
  jdeboi.com
  12/20/22
*/

let anaglyph;

// TODO - having some issue with the library and preload()...

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    anaglyph = createAnaglyph(this);
    font = loadFont("AdobeClean-Light.otf");
}

function draw() {
    anaglyph.draw(scene);
}

function scene(pg) {
    if (font) {
        pg.background(255);
        pg.fill(0);
        pg.textFont(font, 100);
        pg.rotateY(-frameCount / 200);
        pg.text("p5.anaglyph", 0, 0);
    }

}

