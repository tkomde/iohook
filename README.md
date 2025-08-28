<p align="center">
  <img width="100%" src="https://github.com/robolab-io/iohook/assets/52982404/edec7f92-70bc-43bf-9ec8-19a0a1be7921"/>
</p>

iohook is a global native keyboard and mouse listener for Node.js. This is a fork of https://github.com/wilix-team/iohook, which is abandoned and unmainntained.

Robolab ([MechaKeys](https://v2.robolab.io), the integrated typing environment) provide a modern CI pipeline for easy, fast, reliable, builds of iohook for modern versions of Node and Electron. 

**Notice!! This repository is WIP**
This fork aim to support newer versions of Node.js and Electron. Windows works, MacOS doesn't work properly(mouse OK, keyboard NG), Linux is unconfirmed. [hwanyong/iohook-macos](https://github.com/hwanyong/iohook-macos) is recommended for macOS.

## Supported Versions

- Versions >= 1.1.2 support Electron 29 and Node 20 (Excluding Electron 32 due to c++ error)
- For older version support, use the wilix-team / robolab-io library
- [electron ABI versions](https://github.com/electron/node-abi/blob/main/abi_registry.json)

## Installation

```sh
# Install iohook via github
npm install --save tkomde/iohook
```

By default, prebuilds will be downloaded for your own platform and architecture, but you can download specific ones through your package.json:
```json
"iohook": {
    "targets": [
        "node-108",
        "electron-116"
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

As of right now, we do not build 32-bit versions.
