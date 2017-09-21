const fs = require('fs');
const Path = require('path');
const { promisify: p } = require('util');

module.exports = async function main(item, cb) {
  item = Path.normalize(item);
  try {
    const [stat, lstat] = await Promise.all([
      p(fs.stat)(item),
      p(fs.lstat)(item),
    ]);
    if (await cb(null, item, stat, lstat) === false) return;
    if (stat.isDirectory()) {
      const dir = item;
      const children = await p(fs.readdir)(dir);
      return Promise.all(children.map(item => main(Path.join(dir, item), cb)));
    }
  } catch (error) {
    return cb(error, item);
  }
};
