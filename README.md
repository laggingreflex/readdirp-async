# readdirp-async

Yet [another][1] "readdirp" implementation.

With a much simpler async callback API.

[1]: https://www.npmjs.com/search?q=readdir

## Install

```sh
npm install readdirp-async
```

## Usage

### API

```js
readdirpAsync(path, callback)
```

* **`path`** Root path to start reading dir
* **`callback`** Function called on discovering each child item, whether file or directory

  ```js
  async function callback(error, item, stat, lstat) {...}
  ```

  **Accepts** 4 arguments:

  * **`error`** Any error that may have ocurred, otherwise null
  * **`item`** An item, file or directory
  * **`stat`** Result of `fs.stat(item)`
  * **`lstat`** Result of `fs.lstat(item)`

  **Returns** a **`boolean`** (or a promise that resolves to one), indicating whether or not to recursively read down the current directory (if it's a directory) path.

### Example

```js
const readdirpAsync = require('readdirp-async')

readdirpAsync(__dirname, callback)

async function callback(error, item, stat, lstat){
  // do something with item
  // check if isDirectory() etc from stat or lstat
  if (stat.isDirectory()) {
    if (/* you want to recurse into this directory */) {
      return true
    }
  } else {
    // do any async operations, it'll await
    await fs.copyFile(item, someDestination)
  }
}
```

### Recipes

#### Concurrency

Implement your own concurrency.


The following implements two separate concurrencies - one for "discovering" all of the paths, and another for a heavy (copy) "operation".

```js
const readdirpAsync = require('readdirp-async')
const delay = require('promise-delay')

readdirpAsync(__dirname, callback)

let counterForDiscovery = 0
let counterForCopyOperation = 0

async function callback (error, item) {

  // 1000 concurrent "discovery"
  while(counterForDiscovery >= 1000) {
    await delay(1000)
  }
  counterForDiscovery++

  // 10 concurrent "operation"
  while(counterForCopyOperation >= 10) {
    await delay(1000)
  }
  counterForCopyOperation++

  // "operation"
  await fs.copy(item, someDestination)

  counterForCopyOperation--
  counterForDiscovery--
}

```