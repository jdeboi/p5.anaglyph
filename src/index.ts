// AnaglyphEffect.ts
// Logic credit:
// https://github.com/mrdoob/three.js/blob/d091564e0279adb607f9a2867fdd9f6dbfe10b2e/examples/jsm/effects/AnaglyphEffect.js
// https://github.com/hx2A/Camera3D

import p5 from "p5";

// --- GLSL shaders hoisted out of the class so they're created once ---

const ANAGLYPH_VERT = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

// u_resolution was unused; removed for less uniform traffic
const ANAGLYPH_FRAG = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D mapLeft;
uniform sampler2D mapRight;

mat3 colorMatrixLeft = mat3(
  0.456100, -0.0400822, -0.0152161,
  0.500484, -0.0378246, -0.0205971,
  0.176381, -0.0157589, -0.00546856
);

mat3 colorMatrixRight = mat3(
 -0.0434706,  0.378476, -0.0721527,
 -0.0879388,  0.733640, -0.112961,
 -0.00155529, -0.0184503,  1.226400
);

float lin1(float c) {
  return c <= 0.04045
    ? c * 0.0773993808
    : pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

vec4 lin4(vec4 c) {
  return vec4(lin1(c.r), lin1(c.g), lin1(c.b), c.a);
}

float dev(float c) {
  return c <= 0.0031308
    ? c * 12.92
    : pow(c, 0.41666) * 1.055 - 0.055;
}

void main() {
  vec2 uv = vTexCoord;
  vec4 colorL = lin4(texture2D(mapLeft, uv));
  vec4 colorR = lin4(texture2D(mapRight, uv));

  vec3 color = clamp(
    colorMatrixLeft * colorL.rgb +
    colorMatrixRight * colorR.rgb,
    0.0, 1.0
  );

  gl_FragColor = vec4(
    dev(color.r),
    dev(color.g),
    dev(color.b),
    max(colorL.a, colorR.a)
  );
}
`;

// ---------------------------------
// Types
// ---------------------------------

interface CameraConfig {
  cameraPositionX: number;
  cameraPositionY: number;
  cameraPositionZ: number;
  cameraTargetX: number;
  cameraTargetY: number;
  cameraTargetZ: number;
  cameraUpX: number;
  cameraUpY: number;
  cameraUpZ: number;
  frustumLeft: number;
  frustumRight: number;
  frustumBottom: number;
  frustumTop: number;
  frustumNear: number;
  frustumFar: number;
  fovy: number;
}

export type AnaglyphSceneFn = (pg: p5.Graphics) => void;

export class AnaglyphEffect {
  // camera / stereo params
  divergence = 1;
  swapLeftRight = -1;
  adjustTargetFactor = 1;
  useAsymmetricFrustum = true;

  cameraDivergenceX = 0;
  cameraDivergenceY = 0;
  cameraDivergenceZ = 0;
  frustrumSkew = 0; // keeping your spelling

  readonly RAD_TO_DEG = 57.29577951308232;
  readonly LEFT_IMG = 0;
  readonly RIGHT_IMG = 1;

  shaderLoaded = false;
  initialized = false;

  pInst: p5 | null = null;

  imgLeft: p5.Graphics | null = null;
  imgRight: p5.Graphics | null = null;
  output: p5.Graphics | null = null;
  theShader: p5.Shader | null = null;

  config: CameraConfig | null = null;

  // cache size so resize() can detect changes
  private _width = 0;
  private _height = 0;

  constructor() {}

  init(): void {
    if (!this.pInst) return;
    if (this.initialized) return; // safe to call multiple times

    const p = this.pInst;
    this._width = p.width;
    this._height = p.height;

    this.config = {
      cameraPositionX: 0,
      cameraPositionY: 0,
      cameraPositionZ: p.height / 2 / p.tan(p.PI / 6),
      cameraTargetX: 0,
      cameraTargetY: 0,
      cameraTargetZ: 0,
      cameraUpX: 0,
      cameraUpY: 1,
      cameraUpZ: 0,
      frustumLeft: -p.width / 2,
      frustumRight: p.width / 2,
      frustumBottom: -p.height / 2,
      frustumTop: p.height / 2,
      frustumNear: 0.1,
      frustumFar: p.max(p.width, p.height),
      fovy: p.PI / 3,
    };

    this.recalculateCameraSettings();
    this._createGraphics();

    this.initialized = true;
  }

  // factor out graphics allocation so we can reuse it in resize(). Each
  // p.createGraphics() call makes a new WEBGL context, so the shader (which
  // is tied to whichever context created it) must be recreated against the
  // new `output` buffer every time this runs, not just on init().
  private _createGraphics(): void {
    if (!this.pInst) return;
    const p = this.pInst;

    // p.WEBGL is typed as any-ish in @types/p5, but we keep cast just in case
    this.imgLeft = p.createGraphics(
      this._width,
      this._height,
      p.WEBGL as unknown as any
    );
    this.imgRight = p.createGraphics(
      this._width,
      this._height,
      p.WEBGL as unknown as any
    );
    this.output = p.createGraphics(
      this._width,
      this._height,
      p.WEBGL as unknown as any
    );

    this.theShader = this.output.createShader(ANAGLYPH_VERT, ANAGLYPH_FRAG);
    this.shaderLoaded = true;
  }

  draw(scene: AnaglyphSceneFn): void {
    if (!this.initialized) this.init();
    if (!this.pInst || !this.imgLeft || !this.imgRight) return;

    if (this.theShader && this.shaderLoaded && this.output) {
      this.drawScene(this.LEFT_IMG, this.imgLeft, scene);
      this.drawScene(this.RIGHT_IMG, this.imgRight, scene);
      this.updateShader();
    } else {
      // fallback: just draw the left eye
      this.drawScene(this.LEFT_IMG, this.imgLeft, scene);

      const p = this.pInst;
      p.push();
      p.image(this.imgLeft, -p.width / 2, -p.height / 2);
      p.pop();
    }
  }

  setDivergence(divergence = 1): void {
    if (this.divergence !== divergence) {
      this.divergence = divergence;
      this.recalculateCameraSettings();
    }
  }

  updateShader(): void {
    if (
      !this.theShader ||
      !this.imgLeft ||
      !this.imgRight ||
      !this.output ||
      !this.pInst
    )
      return;

    this.theShader.setUniform("mapLeft", this.imgLeft);
    this.theShader.setUniform("mapRight", this.imgRight);

    this.output.clear();
    this.output.shader(this.theShader);
    this.output.rect(0, 0, this._width, this._height);

    // p5 WEBGL flips Y
    const p = this.pInst;
    p.push();
    p.scale(1, -1);
    p.image(this.output, -p.width / 2, -p.height / 2);
    p.pop();
  }

  drawStereoImages(
    left: p5.Image | p5.Graphics | null,
    right: p5.Image | p5.Graphics | null,
    x = 0,
    y = 0
  ): void {
    if (!this.initialized) this.init();
    if (!this.pInst || !this.imgLeft || !this.imgRight) return;

    if (this.theShader && this.shaderLoaded) {
      this.drawImage(left, this.imgLeft, x, y);
      this.drawImage(right, this.imgRight, x, y);
      this.updateShader();
    } else {
      this.drawImage(left, this.imgLeft);
    }
  }

  drawImage(
    img: p5.Image | p5.Graphics | null,
    pg: p5.Graphics,
    x = 0,
    y = 0
  ): void {
    if (!img) return;

    pg.push();
    pg.clear();
    pg.translate(x, y);
    pg.image(img, 0, 0);
    pg.pop();
  }

  drawScene(side: number, pg: p5.Graphics, scene: AnaglyphSceneFn): void {
    pg.push();
    pg.clear();

    this.getCamera(side, pg);
    scene(pg);

    pg.pop();
  }

  recalculateCameraSettings(): void {
    if (!this.pInst || !this.config) return;

    this.perspective(); // updates frustum + fovy

    const c = this.config;

    const dx = this.adjustTargetFactor * (c.cameraPositionX - c.cameraTargetX);
    const dy = this.adjustTargetFactor * (c.cameraPositionY - c.cameraTargetY);
    const dz = this.adjustTargetFactor * (c.cameraPositionZ - c.cameraTargetZ);

    const diverge =
      -(this.swapLeftRight * this.divergence) / (c.fovy * this.RAD_TO_DEG);

    this.cameraDivergenceX = (dy * c.cameraUpZ - c.cameraUpY * dz) * diverge;
    this.cameraDivergenceY = (dz * c.cameraUpX - c.cameraUpZ * dx) * diverge;
    this.cameraDivergenceZ = (dx * c.cameraUpY - c.cameraUpX * dy) * diverge;

    const distanceToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const cameraDivergenceDistance =
      Math.sign(this.swapLeftRight * this.divergence) *
      Math.sqrt(
        this.cameraDivergenceX * this.cameraDivergenceX +
          this.cameraDivergenceY * this.cameraDivergenceY +
          this.cameraDivergenceZ * this.cameraDivergenceZ
      );

    this.frustrumSkew =
      (cameraDivergenceDistance * c.frustumNear) / distanceToTarget;
  }

  getCamera(side: number, pg: p5.Graphics): void {
    if (this.useAsymmetricFrustum) {
      this.drawAsymmetricFrustrum(side, pg);
    } else {
      this.drawSymmetricFrustrum(side, pg);
    }
  }

  drawAsymmetricFrustrum(side: number, pg: p5.Graphics): void {
    const c = this.config;
    if (!c) return;

    if (side === this.LEFT_IMG) {
      pg.camera(
        c.cameraPositionX + this.cameraDivergenceX,
        c.cameraPositionY + this.cameraDivergenceY,
        c.cameraPositionZ + this.cameraDivergenceZ,
        c.cameraTargetX + this.cameraDivergenceX,
        c.cameraTargetY + this.cameraDivergenceY,
        c.cameraTargetZ + this.cameraDivergenceZ,
        c.cameraUpX,
        c.cameraUpY,
        c.cameraUpZ
      );

      pg.frustum(
        c.frustumLeft - this.frustrumSkew,
        c.frustumRight - this.frustrumSkew,
        c.frustumBottom,
        c.frustumTop,
        c.frustumNear,
        c.frustumFar
      );
    } else if (side === this.RIGHT_IMG) {
      pg.camera(
        c.cameraPositionX - this.cameraDivergenceX,
        c.cameraPositionY - this.cameraDivergenceY,
        c.cameraPositionZ - this.cameraDivergenceZ,
        c.cameraTargetX - this.cameraDivergenceX,
        c.cameraTargetY - this.cameraDivergenceY,
        c.cameraTargetZ - this.cameraDivergenceZ,
        c.cameraUpX,
        c.cameraUpY,
        c.cameraUpZ
      );

      pg.frustum(
        c.frustumLeft + this.frustrumSkew,
        c.frustumRight + this.frustrumSkew,
        c.frustumBottom,
        c.frustumTop,
        c.frustumNear,
        c.frustumFar
      );
    }
  }

  drawSymmetricFrustrum(side: number, pg: p5.Graphics): void {
    const c = this.config;
    if (!c) return;

    if (side === this.LEFT_IMG) {
      pg.camera(
        c.cameraPositionX + this.cameraDivergenceX,
        c.cameraPositionY + this.cameraDivergenceY,
        c.cameraPositionZ + this.cameraDivergenceZ,
        c.cameraTargetX,
        c.cameraTargetY,
        c.cameraTargetZ,
        c.cameraUpX,
        c.cameraUpY,
        c.cameraUpZ
      );
    } else if (side === this.RIGHT_IMG) {
      pg.camera(
        c.cameraPositionX - this.cameraDivergenceX,
        c.cameraPositionY - this.cameraDivergenceY,
        c.cameraPositionZ - this.cameraDivergenceZ,
        c.cameraTargetX,
        c.cameraTargetY,
        c.cameraTargetZ,
        c.cameraUpX,
        c.cameraUpY,
        c.cameraUpZ
      );
    }
  }

  perspective(): void {
    if (!this.pInst) return;
    const p = this.pInst;
    const cameraZ = p.height / 2 / Math.tan((p.PI * 60.0) / 360.0);
    const fovy = p.PI / 3;
    const aspect = p.width / p.height;
    const zNear = cameraZ / 10;
    const zFar = cameraZ * 10;
    const ymax = zNear * Math.tan(fovy / 2);
    const ymin = -ymax;
    const xmin = ymin * aspect;
    const xmax = ymax * aspect;
    this.frustum(xmin, xmax, ymin, ymax, zNear, zFar);
  }

  frustum(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ): void {
    const c = this.config;
    if (!c) return;

    c.frustumLeft = left;
    c.frustumRight = right;
    c.frustumBottom = bottom;
    c.frustumTop = top;
    c.frustumNear = near;
    c.frustumFar = far;
    c.fovy = 2 * Math.atan(top / near);
  }

  resize(): void {
    if (!this.pInst) return;
    const p = this.pInst;

    if (p.width === this._width && p.height === this._height) {
      // size didn't change; just update camera math
      this.recalculateCameraSettings();
      return;
    }

    this._width = p.width;
    this._height = p.height;

    this._createGraphics();
    this.recalculateCameraSettings();
  }
}

// ---------------------------------
// p5.js v2 compatibility patch
// ---------------------------------
// As of p5.js v2, camera()/perspective()/ortho()/frustum()/model() are only
// attached to the main p5 instance's prototype, not to p5.Graphics.prototype
// (see p5's webgl/p5.Camera.js and webgl/loading.js). AnaglyphEffect renders
// each eye into an off-screen WEBGL p5.Graphics buffer and positions its
// camera / draws models directly on that buffer, so we restore the same
// delegating methods p5 core uses internally
// (`this._renderer.<method>(...args)`) if they're missing.
function patchGraphicsCameraMethods(P5: typeof p5): void {
  const GraphicsProto = (P5 as any).Graphics?.prototype;
  if (!GraphicsProto) return;

  (
    ["camera", "perspective", "ortho", "frustum", "model"] as const
  ).forEach((name) => {
    if (typeof GraphicsProto[name] === "function") return;
    GraphicsProto[name] = function (this: any, ...args: any[]) {
      this._renderer[name](...args);
      return this;
    };
  });
}
patchGraphicsCameraMethods(p5);

// ---------------------------------
// Singleton + p5 prototype helper
// ---------------------------------

const pAnaglyph = new AnaglyphEffect();

(p5.prototype as any).createAnaglyph = function (this: p5, pInst: p5) {
  pAnaglyph.pInst = pInst;
  pAnaglyph.init();
  return pAnaglyph;
};

// TypeScript augmentation so `createAnaglyph` is recognized on p5
declare global {
  interface p5 {
    createAnaglyph(pInst: p5): AnaglyphEffect;
  }
}

export default pAnaglyph;
