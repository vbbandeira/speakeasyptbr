import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** audio-generator/ root */
export const TOOL_ROOT = path.resolve(__dirname, "..", "..", "..");

/** speakeasyptbr-products/ root (2 levels up from tool) */
export const PRODUCTS_ROOT = path.resolve(TOOL_ROOT, "..", "..");

export const MANIFESTS_DIR = path.join(TOOL_ROOT, "manifests");
export const PROMPTS_DIR = path.join(TOOL_ROOT, "prompts");
export const GENERATED_DIR = path.join(TOOL_ROOT, "generated");

export function manifestPath(productSlug: string): string {
  return path.join(MANIFESTS_DIR, `${productSlug}.yaml`);
}

export function stationDir(productSlug: string, stationId: string): string {
  return path.join(GENERATED_DIR, productSlug, `${stationId}`);
}

export const stationPaths = {
  scripts: (product: string, station: string) =>
    path.join(stationDir(product, station), "scripts.md"),
  runLog: (product: string, station: string) =>
    path.join(stationDir(product, station), "run-log.md"),
  audioWavDir: (product: string, station: string) =>
    path.join(stationDir(product, station), "audio"),
  audioMp3Dir: (product: string, station: string) =>
    path.join(stationDir(product, station), "audio-final"),
  recordingGuide: (product: string, station: string) =>
    path.join(stationDir(product, station), "recording-guide.md"),
};
