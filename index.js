import { join } from 'path';
import { readdir } from 'fs/promises';
import { Dirent } from 'fs';

/**
 * readdirp async generator
 * @async
 * @param {string} path
 * @param {object} [opts]
 * @param {number} [opts.depth]
 * @yields {output}
 */
export default async function* readdirPAsync(path, opts, state) {
  const children = await readdir(path, { withFileTypes: true });
  for (const dirent of children) {
    const child = join(path, dirent.name);
    /** @type {output} */
    const output = { path: child, parent: path, dirent, depth: state?.depth };
    /** @type {input} */
    const input = Object.assign(output, yield output);
    if (input.skip) continue;
    if (!dirent.isDirectory()) continue;
    if ((state?.depth ?? 0) >= (opts?.depth ?? Infinity)) continue;
    yield* readdirPAsync(child, opts, { ...state, depth: (state?.depth ?? 0) + 1 });
  }
}

/**
 * @typedef {object} output
 * @property {string} path
 * @property {string} parent
 * @property {Dirent} dirent
 * @property {number} depth
 */

/**
 * @typedef {object} input
 * @property {boolean} [skip]
 */
