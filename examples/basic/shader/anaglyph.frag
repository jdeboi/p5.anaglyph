// Logic credit:
// https://github.com/mrdoob/three.js/blob/d091564e0279adb607f9a2867fdd9f6dbfe10b2e/examples/jsm/effects/AnaglyphEffect.js
// https://github.com/hx2A/Camera3D

#ifdef GL_ES
precision mediump float;
#endif

// Receive the texCoord variable from the vertex shader
varying vec2 vTexCoord;

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file

uniform sampler2D mapLeft;
uniform sampler2D mapRight;

 mat3 colorMatrixLeft = mat3(
			0.456100, - 0.0400822, - 0.0152161,
			0.500484, - 0.0378246, - 0.0205971,
			0.176381, - 0.0157589, - 0.00546856
		 );

 mat3 colorMatrixRight = mat3(
			- 0.0434706, 0.378476, - 0.0721527,
			- 0.0879388, 0.73364, - 0.112961,
			- 0.00155529, - 0.0184503, 1.2264
);

// These functions implement sRGB linearization and gamma correction
float lin( float c ) {
  return c <= 0.04045 ? c * 0.0773993808 :
      pow( c * 0.9478672986 + 0.0521327014, 2.4 );
}

vec4 lin( vec4 c ) {
  return vec4( lin( c.r ), lin( c.g ), lin( c.b ), c.a );
}

float dev( float c ) {
  return c <= 0.0031308 ? c * 12.92
      : pow( c, 0.41666 ) * 1.055 - 0.055;
}

void main() {
  // vec2 st = gl_FragCoord.xy/u_resolution.xy; 
  // image uploaded upside down; gotta flip
  // https://itp-xstory.github.io/p5js-shaders/#/./docs/examples/image_effects
  // st.y = 1.0 - st.y;

  // p5.js vTexCoord = uv in three.js? vTexCoord
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  vec4 colorL = lin( texture2D( mapLeft, uv ) );
  vec4 colorR = lin( texture2D( mapRight, uv ) );
  
  vec3 color = clamp(
      colorMatrixLeft * colorL.rgb +
      colorMatrixRight * colorR.rgb, 0., 1. );
  
  gl_FragColor = vec4(
      dev( color.r ), dev( color.g ), dev( color.b ),
    max( colorL.a, colorR.a ) );
}