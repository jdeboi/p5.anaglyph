/*
  p5.js 3D Anaglyph Effect
  (for red / cyan glasses)

  Jenna deBoisblanc
  jdeboi.com
*/

let anaglyph;
let teapot;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  anaglyph = createAnaglyph(this);

  loadModel("teapot.obj", ".obj", true, (model) => {
    teapot = model;
  });
}

function draw() {
  anaglyph.draw(scene);
}

function scene(pg) {
  pg.push();
  pg.background(255);
  if (teapot) {
    pg.scale(2);
    pg.rotateX(frameCount * 0.01);
    pg.rotateY(frameCount * 0.01);
    pg.normalMaterial(); // For effect
    pg.model(teapot);
  }
  pg.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  anaglyph.resize();
}
