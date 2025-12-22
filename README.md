# This repository is no longer maintained.

While this project supported up to Electron 39, we have found that supporting Electron 40 is technically difficult.
Since this version of iohook relies on the V8 API, you can significantly avoid binary compatibility issues by using the newer N-API-based packages listed below. I strongly recommend migrating to these alternatives.

- https://github.com/SnosMe/uiohook-napi (for Windows / Linux)
- https://github.com/hwanyong/iohook-macos (for macOS)


## About this repository

iohook is a global native keyboard and mouse listener for Node.js. This is a fork of https://github.com/wilix-team/iohook, which is abandoned and unmainntained.

Robolab ([MechaKeys](https://v2.robolab.io), the integrated typing environment) provide a modern CI pipeline for easy, fast, reliable, builds of iohook for modern versions of Node and Electron. 

## Supported Versions

- Versions 1.1.7 support Electron 29-39 and Node 20-24 (Excluding Electron 32 due to c++ error)
- As of right now, i do not build 32-bit versions.
- For older version support, use the wilix-team / robolab-io library
- [electron ABI versions](https://github.com/electron/node-abi/blob/main/abi_registry.json)

## Installation

```sh
# Install iohook via npm
npm install --save @tkomde/iohook
```

By default, prebuilds will be downloaded for your own platform and architecture, but you can download specific ones through your package.json:

```json
"iohook": {
    "targets": [
        "node-137",
        "electron-140"
    ],
    "platforms": [
        "win32",
        "linux"
    ],
    "arches": [
        "x64",
        "arm64"
    ]
}
```

## Usage

### CommonJS

```js
const iohook = require('@tkomde/iohook');

iohook.on('keydown', event => {
    console.log(event);
});
iohook.start();
```

### ES Modules / TypeScript

```js
import { iohook } from '@tkomde/iohook';
# import iohook from '@tkomde/iohook'; # on bundler

iohook.on('mousedown', e => console.log(e));
iohook.start();
```

Both import styles provide the same singleton instance.

