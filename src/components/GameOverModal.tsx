import * as Dialog from "@radix-ui/react-dialog";
import type { GameOverModalCopy } from "../utils/getGameOverModalCopy";

interface GameOverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: GameOverModalCopy;
  onRematch: () => void;
}

function GameOverModal({ open, onOpenChange, copy, onRematch }: GameOverModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-200 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-201 w-[min(100vw-2rem,380px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl outline-none">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="text-xl font-bold text-slate-900">Game over</Dialog.Title>
            <Dialog.Close
              type="button"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <span aria-hidden className="text-lg leading-none">
                ×
              </span>
            </Dialog.Close>
          </div>

          <Dialog.Description asChild>
            <div className="space-y-3 text-slate-700">
              {copy.winnerLabel && (
                <p className="text-lg font-semibold text-emerald-800">Winner: {copy.winnerLabel}</p>
              )}
              {!copy.winnerLabel && (
                <p className="text-lg font-semibold text-slate-800">Draw</p>
              )}
              <p className="text-base">{copy.resultLine}</p>
              {copy.detailLine && <p className="text-sm text-slate-600">{copy.detailLine}</p>}
            </div>
          </Dialog.Description>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Dialog.Close
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </Dialog.Close>
            <button
              type="button"
              onClick={onRematch}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-amber transition hover:bg-amber-700"
            >
              Rematch
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default GameOverModal;
