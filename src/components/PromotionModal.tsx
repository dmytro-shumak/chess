import * as Dialog from "@radix-ui/react-dialog";
import { BISHOP, KNIGHT, QUEEN, ROOK } from "chess.js";
import { Colors } from "../models/Colors";
import type { SvgComponent } from "../types/svg";
import type { PromotionChoice } from "../chess/promotion";
import bishopDark from "../assets/bishop-dark.svg?react";
import bishopLight from "../assets/bishop-white.svg?react";
import knightDark from "../assets/knight-dark.svg?react";
import knightLight from "../assets/knight-white.svg?react";
import queenDark from "../assets/queen-dark.svg?react";
import queenLight from "../assets/queen-white.svg?react";
import rookDark from "../assets/rook-dark.svg?react";
import rookLight from "../assets/rook-white.svg?react";

export type { PromotionChoice } from "../chess/promotion";

const OPTIONS: { name: PromotionChoice; label: string; dark: SvgComponent; light: SvgComponent }[] = [
  { name: QUEEN, label: "Queen", dark: queenDark, light: queenLight },
  { name: ROOK, label: "Rook", dark: rookDark, light: rookLight },
  { name: BISHOP, label: "Bishop", dark: bishopDark, light: bishopLight },
  { name: KNIGHT, label: "Knight", dark: knightDark, light: knightLight },
];

interface PromotionModalProps {
  open: boolean;
  color: Colors;
  onSelect: (piece: PromotionChoice) => void;
}

function PromotionModal({ open, color, onSelect }: PromotionModalProps) {
  return (
    <Dialog.Root open={open} modal onOpenChange={() => {}}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-200 bg-black/45" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-201 w-[min(100vw-2rem,280px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <Dialog.Title className="mb-3 text-center text-base font-semibold text-slate-800">
            Choose promotion
          </Dialog.Title>
          <div className="grid grid-cols-4 gap-2">
            {OPTIONS.map(({ name, label, dark, light }) => {
              const Logo = color === Colors.BLACK ? dark : light;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSelect(name)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 transition hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <Logo className="h-10 w-10" aria-hidden />
                  <span className="text-[10px] font-medium text-slate-600">{label}</span>
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PromotionModal;
