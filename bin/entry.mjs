// Is this module the script node was asked to run? Compare real paths, never URLs: a file URL escapes a
// space or a non-ASCII letter ("%20"), and a symlink names the same file by another path, and either one
// made a CLI skip its whole body and exit 0 having done nothing (#96).
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** `isEntry(import.meta.url)`: true when node was started on this file, by any path to it. */
export function isEntry(metaUrl) {
  try { return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(metaUrl)); } catch { return false; }
}
