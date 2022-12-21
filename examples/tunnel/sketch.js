/*
  p5.js 3D Anaglyph Effect 
  (for red / cyan glasses)

  Jenna deBoisblanc
  jdeboi.com
  12/20/22
*/

let anaglyph;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    anaglyph = createAnaglyph(this);
    anaglyph.setDivergence(-.3);
}

function draw() {
    anaglyph.draw(scene);
}

function scene(pg) {
    const boxW = 300;

    pg.background(0);
  
    pg.rectMode(CENTER);
    pg.noFill();
    pg.strokeWeight(10);
    pg.stroke(255);
    for (let z = 0; z < 30; z++) {
        pg.push();
        let dz = (z * 100 + frameCount) % 2000;
        dz -= 800;
        pg.translate(0, 0, dz);
        pg.rect(0, 0, boxW);
        pg.pop();
    }

    pg.push();
    pg.rotateX(PI / 2);
    // floor
    pg.translate(0, 0, -boxW/2);
    pg.rect(0, 0, boxW, 1800);
    // ceiling
    pg.translate(0, 0, boxW);
    pg.rect(0, 0, boxW, 1800);
    pg.pop();


}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    anaglyph.resize();
}