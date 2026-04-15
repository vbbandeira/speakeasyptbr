import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function readText(p: string): Promise<string> {
  return fs.readFile(p, "utf-8");
}

export async function writeText(p: string, content: string): Promise<void> {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, content, "utf-8");
}

export async function fileSize(p: string): Promise<number> {
  try {
    const stat = await fs.stat(p);
    return stat.size;
  } catch {
    return 0;
  }
}

export async function appendText(p: string, content: string): Promise<void> {
  await ensureDir(path.dirname(p));
  await fs.appendFile(p, content, "utf-8");
}
