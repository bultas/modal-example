import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

export default {
  input: "./src/index.js",
  output: {
    file: "./dist/modal.js",
    format: "iife"
  },
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      presets: ["@babel/preset-env"]
    }),
    terser()
  ]
};
