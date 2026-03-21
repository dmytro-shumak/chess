type ClassValue =
  | string
  | false
  | undefined
  | null
  | Record<string, boolean | undefined | null>;

export function classNames(...classes: ClassValue[]): string {
  const out: string[] = [];
  for (const item of classes) {
    if (!item) continue;
    if (typeof item === "string") {
      out.push(item);
      continue;
    }
    for (const [key, value] of Object.entries(item)) {
      if (value) out.push(key);
    }
  }
  return out.join(" ");
}
