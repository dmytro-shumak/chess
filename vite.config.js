import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STOCKFISH_BIN_FILES = new Set([
  "stockfish-18-lite-single.js",
  "stockfish-18-lite-single.wasm",
]);

function copyStockfishLite() {
  return {
    name: "copy-stockfish-lite",
    buildStart() {
      const destDir = path.resolve(__dirname, "public/stockfish");
      const binDir = path.resolve(__dirname, "node_modules/stockfish/bin");
      fs.mkdirSync(destDir, { recursive: true });
      for (const file of STOCKFISH_BIN_FILES) {
        fs.copyFileSync(path.join(binDir, file), path.join(destDir, file));
      }
    },
  };
}

/** Serves Stockfish from node_modules so /stockfish/* works even if public/stockfish is missing. */
function stockfishDevMiddleware() {
  return {
    name: "stockfish-dev-middleware",
    enforce: "pre",
    configureServer(server) {
      stockfishStaticMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      stockfishStaticMiddleware(server.middlewares);
    },
  };
}

function stockfishStaticMiddleware(middlewares) {
  middlewares.use((req, res, next) => {
    const pathname = req.url?.split("?")[0] ?? "";
    if (!pathname.startsWith("/stockfish/")) {
      next();
      return;
    }
    const base = path.basename(pathname);
    if (!STOCKFISH_BIN_FILES.has(base)) {
      next();
      return;
    }
    const filePath = path.resolve(__dirname, "node_modules/stockfish/bin", base);
    if (!fs.existsSync(filePath)) {
      next();
      return;
    }
    if (base.endsWith(".wasm")) {
      res.setHeader("Content-Type", "application/wasm");
    } else {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    }
    fs.createReadStream(filePath).pipe(res);
  });
}

export default defineConfig({
  plugins: [stockfishDevMiddleware(), copyStockfishLite(), react(), svgr()],
  build: {
    outDir: "build",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
