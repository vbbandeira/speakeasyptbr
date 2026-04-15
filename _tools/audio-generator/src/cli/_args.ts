/** Minimal CLI arg parser. No deps. */

export interface ParsedArgs {
  [key: string]: string | boolean;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;
    if (!token.startsWith("--")) continue;
    const eqIdx = token.indexOf("=");
    if (eqIdx > -1) {
      out[token.slice(2, eqIdx)] = token.slice(eqIdx + 1);
    } else {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

export function requireStr(args: ParsedArgs, key: string, hint?: string): string {
  const v = args[key];
  if (typeof v !== "string" || !v) {
    console.error(`Missing required --${key}${hint ? " " + hint : ""}`);
    process.exit(1);
  }
  return v;
}

export function optionalStr(args: ParsedArgs, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v ? v : undefined;
}

export function boolFlag(args: ParsedArgs, key: string): boolean {
  return Boolean(args[key]);
}
