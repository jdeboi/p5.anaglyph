# p5.anaglyph

p5.anaglyph is a [p5.js](https://p5js.org/) library for creating 3D (anaglyph) scenes using red/cyan glasses. Uses [Dubois anaglyph algorithm](https://www.site.uottawa.ca/~edubois/anaglyph/) & color matrices.   
  
Created by [Jenna deBoisblanc](https://jdeboi.com/). 



## Example

[editor.p5js.org example](https://editor.p5js.org/jdeboi/sketches/vTjpXtNOL)  

---

In the `index.html`:   
  
```html
<script src="https://cdn.jsdelivr.net/gh/jdeboi/p5.anaglyph/dist/p5.anaglyph.min.js"></script>
```

In the `sketch.js`:
```javascript
let anaglyph;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // set the divergence (try between -1 & 1)
  anaglyph = createAnaglyph(.5);  
}

function draw() {
  anaglyph.draw(scene);
}

// this is the logic of the scene
// all usual methods from draw(), but call on the 
// pGraphics parameter pg
function scene(pg) {
  pg.background(0);
  pg.fill(255);
  pg.rotateY(frameCount / 200);
  pg.box(200);
}
```


## Code adapted from:
* [Camera 3D Processing Library](https://github.com/hx2A/Camera3D)
* [three.js anaglyph effect](https://github.com/mrdoob/three.js/blob/d091564e0279adb607f9a2867fdd9f6dbfe10b2e/examples/jsm/effects/AnaglyphEffect.js)