// Daniel Shiffman https://www.youtube.com/watch?v=IKB1hWWedMk

let anaglyph;

let terrain = {
    scale: 100,
    w: 1000,
    h: 1000,
    flightPos: 0,
    flightSpeed: .0010,
    noiseDelta: .4,
    terrainHeight: 200,
    coords: []
}


function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    anaglyph = createAnaglyph(this);

    initTerrain();
}

function draw() {
    anaglyph.draw(scene);
}

function scene(pg) {
    pg.push();
    pg.background(0);
    pg.stroke(255);
    pg.strokeWeight(5);
    pg.fill(255, 50);
    
    pg.translate(0, 100, -200);
    drawTerrain(pg);
    pg.pop();
}

function initTerrain() {
    terrain.cols = terrain.w / terrain.scale;
    terrain.rows = terrain.h / terrain.scale;
    for (let x = 0; x < terrain.cols; ++x) {
        terrain.coords[x] = [];
    }
}

function drawTerrain(pg) {
    terrain.flightPos -= terrain.flightSpeed;
    shiftNoiseSpace();
    pg.rotateX(PI / 2);
    pg.translate((-terrain.w / 2) + 1, (-terrain.h / 2) + 30);

    for (let y = 0; y < terrain.rows - 1; ++y) {
        pg.beginShape(TRIANGLE_STRIP);
        for (let x = 0; x < terrain.cols; ++x) {
            pg.vertex(x * terrain.scale, y * terrain.scale, terrain.coords[x][y]);
            pg.vertex(x * terrain.scale, (y + 1) * terrain.scale, terrain.coords[x][y + 1]);
        }
        pg.endShape();
    }
}

function shiftNoiseSpace() {
    let yOffset = terrain.flightPos;
    for (let y = 0; y < terrain.rows; ++y) {
        let xOffset = 0;
        for (let x = 0; x < terrain.cols; ++x) {
            terrain.coords[x][y] = map(noise(xOffset, yOffset), 0, 1, -terrain.terrainHeight, terrain.terrainHeight);
            xOffset += terrain.noiseDelta;
        }
        yOffset += terrain.noiseDelta;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    anaglyph.resize();
}
