# readdirp-async

Yet [another][1] "readdirp" implementation that's an async generator.

[1]: https://www.npmjs.com/search?q=readdir

## Install

```sh
npm install readdirp-async
```

## API
```js
import r from 'readdirp-async'
```
**`r(path, opts)`**
* **`path`** `<string>` Root path to start reading dir
* **`[opts.depth]`** `[number]` Depth to scan down to

**`for await(const output of r(…))`**
* **`output.path`** `[string]` Path of the descendant
* **`output.dirent`** [`[dirent]`](https://nodejs.org/api/fs.html#class-fsdirent) instance
* **`output.depth`** `[number]` Current depth
* **`output.parent`** `[string]` Parent path

**`r(…).next(input)`**
* **`input.skip`** `[boolean]` Skip current directory (and all its descendants)
* You can also assign these to **`output`**

## Example

```js
const r = require('readdirp-async')

for await(const o of r(__dirname)) {
  if (o.path.includes('node_modules')) {
    // Skip commonly ignored directories and their contents
    o.skip = true
    continue;
  } else {
    // do any operations
    await fs.copy(o.item, …)
  }
}
```
