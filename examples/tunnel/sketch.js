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
    // for (let x = 0; x < 10; x++) {
    //     for (let y = 0; y < 10; y++) {
    //         pg.push();
    //         let dx = map(x, 0, 10, -width / 2, width / 2);
    //         let dy = map(y, 0, 10, -height / 2, height / 2);
    //         let dz = map(y, 0, 10, -550, 550);
    //         dz *= sin(millis() / 1000)
    //         pg.translate(dx, dy, dz);
    //         pg.fill(x * 25, y * 25, 255);
    //         pg.box(40);
    //         pg.pop();
    //     }
    // }

    pg.rectMode(CENTER);
    pg.noFill();
    pg.strokeWeight(10);
    pg.stroke(255);
    for (let z = 0; z < 30; z++) {
        pg.push();
        let dz = (z * 100 + frameCount) % 2000;
        dz -= 800;
        pg.translate(0, 0, dz);
        pg.rect(0, 0, 300);
        pg.pop();
    }



    pg.push();
    pg.rotateX(PI / 2);
    // floor
    pg.translate(0, 0, -150);
    pg.rect(0, 0, 300, 1800);
    // ceiling
    pg.translate(0, 0, 300);
    pg.rect(0, 0, 300, 1800);
    pg.pop();


}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    anaglyph.resize();
}