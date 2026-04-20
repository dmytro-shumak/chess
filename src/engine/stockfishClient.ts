export type EngineGoOptions = { movetime?: number; depth?: number };

// Worker script path; BASE_URL matters when the app is not served from /.
function workerScriptUrl(): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;

  return `${normalized}stockfish/stockfish-18-lite-single.js`;
}

// Thin UCI client: post lines to Stockfish in a Web Worker, read lines back.
export class StockfishClient {
  private worker: Worker | null = null;
  private readonly listeners = new Set<(line: string) => void>();
  private initPromise: Promise<void> | null = null;

  // One go at a time — queue the next search after the current one finishes.
  private commandChain: Promise<void> = Promise.resolve();

  // Spin up the worker on first use; reuse it after that.
  private ensureWorker(): Worker {
    if (this.worker) {
      return this.worker;
    }

    const stockfishWorker = new Worker(workerScriptUrl(), { type: "classic" });

    stockfishWorker.onmessage = (event: MessageEvent<unknown>) => {
      const line = String(event.data ?? "").trim();

      if (!line) {
        return;
      }

      this.listeners.forEach((listener) => {
        listener(line);
      });
    };

    this.worker = stockfishWorker;

    return stockfishWorker;
  }

  // One UCI command, as text.
  private post(command: string): void {
    this.ensureWorker().postMessage(command);
  }

  // Listen for engine lines until you call the returned function.
  private onLine(handler: (line: string) => void): () => void {
    this.listeners.add(handler);

    return () => {
      this.listeners.delete(handler);
    };
  }

  init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.ensureWorker();

    this.initPromise = new Promise((resolve) => {
      let sawUciOk = false;

      const unsubscribe = this.onLine((line) => {
        if (line === "uciok") {
          sawUciOk = true;
          this.post("isready");

          return;
        }

        if (sawUciOk && line === "readyok") {
          unsubscribe();
          resolve();
        }
      });

      this.post("uci");
    });

    return this.initPromise;
  }

  // Stop thinking
  stop(): void {
    this.post("stop");
  }

  // Quit + kill the worker
  dispose(): void {
    try {
      this.post("quit");
    } catch {
      console.error("Error quitting stockfish worker");
      // quit may throw if worker already dead
    }

    this.worker?.terminate();
    this.worker = null;
    this.listeners.clear();
    this.initPromise = null;
    this.commandChain = Promise.resolve();
  }

  // position + go, then resolve with the move string from the bestmove line.
  goBestMove(fen: string, options: EngineGoOptions): Promise<string> {
    const searchOnce = async (): Promise<string> => {
      await this.init();

      return await new Promise<string>((resolve, reject) => {
        const unsubscribe = this.onLine((line) => {
          if (!line.startsWith("bestmove")) {
            return;
          }

          unsubscribe();

          const bestMoveToken = line.split(/\s+/)[1];

          if (!bestMoveToken || bestMoveToken === "(none)") {
            reject(new Error(line));

            return;
          }

          resolve(bestMoveToken);
        });

        this.post(`position fen ${fen}`);

        const goParts: string[] = [];
        if (options.movetime !== undefined) {
          goParts.push("movetime", String(options.movetime));
        }
        if (options.depth !== undefined) {
          goParts.push("depth", String(options.depth));
        }
        const goCommand = goParts.length > 0 ? `go ${goParts.join(" ")}` : "go depth 10";
        this.post(goCommand);
      });
    };

    const pendingSearch = this.commandChain.then(searchOnce, searchOnce);

    this.commandChain = pendingSearch.then(
      () => undefined,
      () => undefined,
    );

    return pendingSearch;
  }
}
