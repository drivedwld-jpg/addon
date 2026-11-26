// esbuild build configuration that reproduces the original bundle
// (single ESM file, Minecraft Bedrock scripting runtime).
import * as esbuild from "esbuild";

const shared = {
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/main.js",
  format: "esm",
  platform: "neutral",
  target: "es2020",
  // Minecraft provides these modules at runtime; keep the import statements.
  external: ["@minecraft/server", "@minecraft/server-ui"],
  logLevel: "info",
};

await esbuild.build(shared);
