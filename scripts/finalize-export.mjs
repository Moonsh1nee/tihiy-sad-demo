import { readdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
// Next 16 on Windows can emit segment payloads as nested directories while
// its static client requests dotted filenames. Materialize those exact files
// in the artifact itself, rather than hiding the difference in a dev server.
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(directory, entry.name);
    if (entry.name.startsWith('__next.')) await flatten(full, directory, entry.name);
    else await walk(full);
  }
}
async function flatten(directory, target, prefix) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name),
      name = prefix + '.' + entry.name;
    if (entry.isDirectory()) await flatten(full, target, name);
    else if (entry.name.endsWith('.txt')) {
      const dest = path.join(target, name);
      try {
        await stat(dest);
      } catch {
        await copyFile(full, dest);
      }
    }
  }
}
await walk(path.resolve('out'));
