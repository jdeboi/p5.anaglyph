/*
  p5.js 3D Anaglyph Effect 
  (for red / cyan glasses)

  Jenna deBoisblanc
  jdeboi.com
  12/20/22
*/

import AnaglyphEffect from "../../src/AnaglyphEffect";

let anaglyph;
let font;

new p5((p5) => {
    
    p5.preload = () => {
        font = p5.loadFont("assets/AdobeClean-Light.otf");
    }

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
        anaglyph = new AnaglyphEffect(p5);
    }

    p5.draw = () => {
        p5.background('red');
        anaglyph.draw(scene);
        p5.displayFrameRate();
    }

    p5.mousePressed = () => {
    }

    p5.mouseReleased = () => {
    }

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    }

    p5.displayFrameRate = () => {
        p5.textFont(font);
        p5.fill(0);
        p5.noStroke();
        p5.textSize(18);
        p5.text(p5.round(p5.frameRate()), -p5.width / 2 + 50, -p5.height / 2 + 50);
    }
});

function scene(pg) {
    pg.background('blue');

    pg.push();
    pg.translate(0, 0, -200);
    pg.rect(0, 0, 100);
    pg.pop();
}

