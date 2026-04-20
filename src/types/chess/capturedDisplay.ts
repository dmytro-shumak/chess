import type { SvgComponent } from "../svg";

export type CapturedDisplay = { key: string; Logo: SvgComponent; label: string };

export type CapturedDisplayGroup = {
  label: string;
  Logo: SvgComponent;
  keys: string[];
};
