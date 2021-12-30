import { join } from 'path';
import { readdir } from 'fs/promises';

export default async function* readdirPAsync(parent, opts, state) {
  const children = await readdir(parent, { withFileTypes: true });
  for (const dirent of children) {
    const child = join(parent, dirent.name);
    const output = { path: child, parent, dirent, depth: state?.depth };
    const input = Object.assign(output, yield output);
    if (input.skip) continue;
    if (!dirent.isDirectory()) continue;
    if ((state?.depth ?? 0) >= (opts?.depth ?? Infinity)) continue;
    yield* readdirPAsync(child, opts, { ...state, depth: (state?.depth ?? 0) + 1 });
  }
}
