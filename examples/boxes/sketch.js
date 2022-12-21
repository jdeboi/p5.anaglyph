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
    pg.background(0);
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            pg.push();
            let dx = map(x, 0, 10, -width / 2, width / 2);
            let dy = map(y, 0, 10, -height / 2, height / 2);
            let dz = map(y, 0, 10, -550, 550);
            dz *= sin(millis()/1000)
            pg.translate(dx, dy, dz);
            pg.fill(x * 25, y * 25, 255);
            pg.box(40);
            pg.pop();
        }
    }

    pg.rectMode(CENTER);
    pg.translate(0, 0,  map(mouseX, 0, width, -width, width));
    pg.noFill();
    pg.stroke(255);
    pg.strokeWeight(140);
    pg.rect(0, 0, 300);
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    anaglyph.resize();
}