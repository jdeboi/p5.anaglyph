const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "p5.anaglyph.min.js",
    library: "p5.anaglyph",
    libraryTarget: "umd",
    globalObject: "this", // safe for node + browser UMD
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(vert|frag)$/i,
        use: "raw-loader",
      },
    ],
  },

  // 👇 tell webpack "don't bundle p5; it's provided by the host page"
  externals: {
    p5: {
      root: "p5", // script tag global
      commonjs: "p5",
      commonjs2: "p5",
      amd: "p5",
    },
  },

  mode: "production",

  // optional: silence performance hints if you still hit limits
  // performance: {
  //   hints: false,
  // },
};
