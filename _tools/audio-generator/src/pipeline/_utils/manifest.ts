/**
 * Manifest loader and saver. Reads YAML, validates against Zod schema,
 * lets you mutate a station, writes back preserving comments not supported
 * (we use a simple dump — humans may keep manifests idiomatic, but the
 * tool's rewrites will normalize formatting).
 */

import yaml from "js-yaml";
import { ManifestSchema, type Manifest, type Station } from "@/types/index.js";
import { manifestPath } from "./paths.js";
import { readText, writeText } from "./fs.js";

export async function loadManifest(productSlug: string): Promise<Manifest> {
  const p = manifestPath(productSlug);
  const raw = await readText(p);
  const parsed = yaml.load(raw);
  const result = ManifestSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Manifest validation failed for ${p}:\n${result.error.toString()}`);
  }
  return result.data;
}

export async function saveManifest(productSlug: string, manifest: Manifest): Promise<void> {
  ManifestSchema.parse(manifest); // throw early if invalid
  const yamlStr = yaml.dump(manifest, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
  await writeText(manifestPath(productSlug), yamlStr);
}

export function findStation(manifest: Manifest, stationId: string): Station {
  const s = manifest.stations.find((st) => st.id === stationId);
  if (!s) throw new Error(`Station ${stationId} not found in manifest ${manifest.product}`);
  return s;
}

export function updateStation(
  manifest: Manifest,
  stationId: string,
  update: Partial<Station>,
): Manifest {
  return {
    ...manifest,
    stations: manifest.stations.map((s) => (s.id === stationId ? { ...s, ...update } : s)),
  };
}

/** Resolve a `$ENV_VAR` reference to the actual env value. */
export function resolveEnvRef(ref: string): string {
  if (!ref.startsWith("$")) return ref;
  const varName = ref.slice(1);
  const v = process.env[varName];
  if (!v) throw new Error(`Env var ${varName} not set (referenced in manifest)`);
  return v;
}
