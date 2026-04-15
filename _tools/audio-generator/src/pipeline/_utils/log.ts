type Level = "debug" | "info" | "warn" | "error";

const PRIORITY: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const ICON: Record<Level, string> = {
  debug: "🐛 DEBUG",
  info: "ℹ️  INFO",
  warn: "⚠️  WARN",
  error: "❌ ERROR",
};

function minLevel(): Level {
  const env = (process.env.LOG_LEVEL ?? "info").toLowerCase() as Level;
  return env in PRIORITY ? env : "info";
}

function format(scope: string, level: Level, msg: string, meta?: object): string {
  const ts = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? " " + JSON.stringify(meta) : "";
  return `[${ts}] ${ICON[level]} (${scope}) ${msg}${metaStr}`;
}

export interface Logger {
  debug(msg: string, meta?: object): void;
  info(msg: string, meta?: object): void;
  warn(msg: string, meta?: object): void;
  error(msg: string, meta?: object): void;
}

export function createLogger(scope: string): Logger {
  const min = PRIORITY[minLevel()];
  const emit = (level: Level, msg: string, meta?: object) => {
    if (PRIORITY[level] < min) return;
    process.stderr.write(format(scope, level, msg, meta) + "\n");
  };
  return {
    debug: (m, meta) => emit("debug", m, meta),
    info: (m, meta) => emit("info", m, meta),
    warn: (m, meta) => emit("warn", m, meta),
    error: (m, meta) => emit("error", m, meta),
  };
}
