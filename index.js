import util from 'util';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { Dirent } from 'fs';
const debug = util.debug('readdirp-async');

const commonSystemErrors = ['ENOTDIR', 'ENOENT'];

/**
 * readdirp async generator
 * @async
 * @param {string} path
 * @param {object} [opts]
 * @param {number} [opts.depth=Infinity]
 * @param {boolean} [opts.follow=true] Follow links
 * @param {boolean} [opts.halt=false] Halt at errors reading descendant directories
 * @param {boolean} [opts.silent=true] Don't log or warn about errors & successes
 * @yields {output}
 */
export default async function* readdirPAsync(path, opts, { depth = 0, state = { size: 0, errors: 0 } } = {}) {
  const children = await readdir(path, { withFileTypes: true });
  for (const dirent of children) {
    state.size++;
    const child = join(path, dirent.name);
    /** @type {output} */
    const output = { path: child, parent: path, dirent, depth, ...state };
    /** @type {input} */
    const input = Object.assign(output, yield output);
    debug({ path, child, output, input });
    if (input.skip) continue;
    if (depth >= (opts?.depth ?? Infinity)) continue;
    if (!dirent.isDirectory() && (!dirent.isSymbolicLink() || !opts?.follow)) continue;
    try {
      yield* readdirPAsync(child, opts, { depth: depth + 1, state });
    } catch (error) {
      /* Only catch fs/readdir errors, not user's  */
      if (commonSystemErrors.includes(error.code)) {
        if (opts.halt) throw error;
        state.errors++;
        debug({ error });
      } else throw error;
    }
  }

  if (opts.silent === false && depth === 0) {
    if (state.errors) {
      console.warn(`${state.errors}/${state.size} descendants couldn't be read from: ${path}`);
    } else {
      console.log(`${state.size} descendants read from: ${path}`);
    }
  }
}

/**
 * @typedef {object} output
 * @property {string} path
 * @property {string} parent
 * @property {Dirent} dirent
 * @property {number} depth
 * @property {number} size
 * @property {number} errors
 */

/**
 * @typedef {object} input
 * @property {boolean} [skip]
 */
