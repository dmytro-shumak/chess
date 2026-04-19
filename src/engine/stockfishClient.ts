export type EngineGoOptions = { movetime?: number; depth?: number };

function workerScriptUrl(): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}stockfish/stockfish-18-lite-single.js`;
}

/**
 * Minimal UCI client for Stockfish.js lite single (WASM) loaded from `/stockfish/`.
 */
export class StockfishClient {
  private worker: Worker | null = null;
  private readonly listeners = new Set<(line: string) => void>();
  private initPromise: Promise<void> | null = null;
  private commandChain: Promise<void> = Promise.resolve();

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const w = new Worker(workerScriptUrl(), { type: "classic" });
    w.onmessage = (e: MessageEvent<unknown>) => {
      const line = String(e.data ?? "").trim();
      if (!line) return;
      this.listeners.forEach((fn) => {
        fn(line);
      });
    };
    this.worker = w;
    return w;
  }

  private post(cmd: string): void {
    this.ensureWorker().postMessage(cmd);
  }

  private onLine(fn: (line: string) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.ensureWorker();
    this.initPromise = new Promise((resolve) => {
      let uciOk = false;
      const off = this.onLine((line) => {
        if (line === "uciok") {
          uciOk = true;
          this.post("isready");
          return;
        }
        if (uciOk && line === "readyok") {
          off();
          resolve();
        }
      });
      this.post("uci");
    });
    return this.initPromise;
  }

  stop(): void {
    this.post("stop");
  }

  dispose(): void {
    try {
      this.post("quit");
    } catch {
      /* ignore */
    }
    this.worker?.terminate();
    this.worker = null;
    this.listeners.clear();
    this.initPromise = null;
    this.commandChain = Promise.resolve();
  }

  /**
   * Runs `position fen` + `go` and resolves to the UCI best move (e.g. e2e4).
   */
  goBestMove(fen: string, options: EngineGoOptions): Promise<string> {
    const run = async (): Promise<string> => {
      await this.init();
      return await new Promise<string>((resolve, reject) => {
        const off = this.onLine((line) => {
          if (!line.startsWith("bestmove")) return;
          off();
          const token = line.split(/\s+/)[1];
          if (!token || token === "(none)") {
            reject(new Error(line));
            return;
          }
          resolve(token);
        });
        this.post(`position fen ${fen}`);
        if (options.movetime != null && options.depth != null) {
          this.post(`go movetime ${options.movetime} depth ${options.depth}`);
        } else if (options.movetime != null) {
          this.post(`go movetime ${options.movetime}`);
        } else if (options.depth != null) {
          this.post(`go depth ${options.depth}`);
        } else {
          this.post("go depth 10");
        }
      });
    };

    const next = this.commandChain.then(run, run);
    this.commandChain = next.then(
      () => {},
      () => {},
    );
    return next;
  }
}
