
let anaglyph;


let scale = 100;
let cols, rows;
let w = 1000;
let h = 1000;

let flightPos = 0;
let terrain = [];

let controls = {
    flightSpeed: .0010,
    noiseDelta: .4,
    terrainHeight: 200
}



function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    // set the divergence (try between -1 & 1)
    anaglyph = createAnaglyph(this, -1);

    cols = w / scale;
    rows = h / scale;
    for (let x = 0; x < cols; ++x) {
        terrain[x] = [];
    }
}

function draw() {
    anaglyph.draw(scene);
}

function scene(pg) {
    pg.push();
    pg.background(0);
    pg.stroke(0);
    pg.strokeWeight(5);
    pg.fill(255);
    pg.translate(0, 150, -500);
    pg.rotateY(1);
    drawTerrain(pg);
    pg.pop();
}



function drawTerrain(pg) {
    flightPos -= controls.flightSpeed;
    shiftNoiseSpace();

    // background(51);
    pg.stroke(255);
    pg.fill(255, 80);

    pg.rotateX(PI / 2);
    pg.translate((-w / 2) + 1, (-h / 2) + 30);

    for (let y = 0; y < rows - 1; ++y) {
        pg.beginShape(TRIANGLE_STRIP);
        for (let x = 0; x < cols; ++x) {
            pg.vertex(x * scale, y * scale, terrain[x][y]);
            pg.vertex(x * scale, (y + 1) * scale, terrain[x][y + 1]);
        }
        pg.endShape();
    }
}

function shiftNoiseSpace() {
    let yOffset = flightPos;
    for (let y = 0; y < rows; ++y) {
        let xOffset = 0;
        for (let x = 0; x < cols; ++x) {
            terrain[x][y] = map(noise(xOffset, yOffset), 0, 1, -controls.terrainHeight, controls.terrainHeight);
            xOffset += controls.noiseDelta;
        }
        yOffset += controls.noiseDelta;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    anaglyph.resize();
}
