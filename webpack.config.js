const path = require("path")

module.exports = {
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "p5.anaglyph.min.js",
    library: "p5.anaglyph",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      // Require .vert and .frag as raw text.
      {
        test: /\.(vert|frag)$/i,
        use: 'raw-loader',
      }
    ],
  },

  mode: "production"
}