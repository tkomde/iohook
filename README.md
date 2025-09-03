<p align="center">
  <img width="100%" src="https://github.com/robolab-io/iohook/assets/52982404/edec7f92-70bc-43bf-9ec8-19a0a1be7921"/>
</p>

iohook is a global native keyboard and mouse listener for Node.js. This is a fork of https://github.com/wilix-team/iohook, which is abandoned and unmainntained.

Robolab ([MechaKeys](https://v2.robolab.io), the integrated typing environment) provide a modern CI pipeline for easy, fast, reliable, builds of iohook for modern versions of Node and Electron. 

**Notice!**
This fork aim to support newer versions of Node.js / Electron and ES Module. Windows and Linux works, macOS doesn't work properly(mouse OK, keyboard NG). Therefore, I do not provide prebuilt versions for macOS. [hwanyong/iohook-macos](https://github.com/hwanyong/iohook-macos) is recommended for macOS.

## Supported Versions

- Versions 1.1.5 support Electron 29-38 and Node 20-24 (Excluding Electron 32 due to c++ error)
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
        "electron-136"
    ],
    "platforms": [
        "win32",
        "darwin",
        "linux"
    ],
    "arches": [
        "x64",
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

