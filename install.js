'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const nugget = require('nugget');
const rc = require('rc');
const pump = require('pump');
const tfs = require('tar-fs');
const zlib = require('zlib');
const pkg = require('./package.json');
const supportedTargets = require('./package.json').supportedTargets;
const { optionsFromPackage } = require('./helpers');
const { spawn } = require('child_process');

function onerror(err) {
  throw err;
}

/**
 * Download and Install prebuild
 * @param runtime
 * @param abi
 * @param platform
 * @param arch
 * @param cb Callback
 */
function install(runtime, abi, platform, arch, cb) {
  const essential = runtime + '-v' + abi + '-' + platform + '-' + arch;
  const pkgVersion = pkg.version;
  const currentPlatform = 'iohook-v' + pkgVersion + '-' + essential;

  console.log('Downloading prebuild for platform:', currentPlatform);
  // GitHub Releases から現在のパッケージバージョン用の事前ビルドを取得
  // アセット名: iohook-v{version}-{runtime}-v{abi}-{platform}-{arch}.tar.gz
  // 例: iohook-v1.1.2-node-v127-linux-x64.tar.gz
  let downloadUrl =
    'https://github.com/tkomde/iohook/releases/download/v' +
    pkgVersion +
    '/' +
    currentPlatform +
    '.tar.gz';

  let nuggetOpts = {
    dir: os.tmpdir(),
    target: 'prebuild.tar.gz',
    strictSSL: true,
  };

  let npmrc = {};

  try {
    rc('npm', npmrc);
  } catch (error) {
    console.warn('Error reading npm configuration: ' + error.message);
  }

  if (npmrc && npmrc.proxy) {
    nuggetOpts.proxy = npmrc.proxy;
  }

  if (npmrc && npmrc['https-proxy']) {
    nuggetOpts.proxy = npmrc['https-proxy'];
  }

  if (npmrc && npmrc['strict-ssl'] === false) {
    nuggetOpts.strictSSL = false;
  }

  nugget(downloadUrl, nuggetOpts, function (errors) {
    if (errors) {
      const error = errors[0];

      if (error.message.indexOf('404') === -1) {
  console.warn('[iohook] Prebuild download error:', error.message);
  console.warn('[iohook] Falling back to local build...');
  return fallbackBuild(runtime, abi, platform, arch, cb);
      } else {
        console.error(
          'Prebuild for current platform (' + currentPlatform + ') not found!'
        );
  console.error('[iohook] Attempting local build as fallback...');
  return fallbackBuild(runtime, abi, platform, arch, cb);
      }
    }

    let options = {
      readable: true,
      writable: true,
      hardlinkAsFilesFallback: true,
    };

    let binaryName;
    let updateName = function (entry) {
      if (/\.node$/i.test(entry.name)) binaryName = entry.name;
    };
    let targetFile = path.join(__dirname, 'builds', essential);
    let extract = tfs.extract(targetFile, options).on('entry', updateName);
    pump(
      fs.createReadStream(path.join(nuggetOpts.dir, nuggetOpts.target)),
      zlib.createGunzip(),
      extract,
      function (err) {
        if (err) {
          console.warn('[iohook] Failed to extract prebuild:', err.message);
          console.warn('[iohook] Falling back to local build...');
          return fallbackBuild(runtime, abi, platform, arch, cb);
        }
        cb();
      }
    );
  });
}

function fallbackBuild(runtime, abi, platform, arch, cb) {
  // Avoid multiple fallback attempts
  if (fallbackBuild._running) return cb && cb();
  fallbackBuild._running = true;

  try {
    // Copy correct gyp templates for platform
    const srcDir = path.join(__dirname, 'build_def', platform === 'darwin' ? 'darwin' : platform === 'win32' ? 'win32' : 'linux');
    const bindingSrc = path.join(srcDir, 'binding.gyp');
    const uiohookSrc = path.join(srcDir, 'uiohook.gyp');
    const bindingDst = path.join(__dirname, 'binding.gyp');
    const uiohookDst = path.join(__dirname, 'uiohook.gyp');
    if (fs.existsSync(bindingDst)) fs.unlinkSync(bindingDst);
    if (fs.existsSync(uiohookDst)) fs.unlinkSync(uiohookDst);
    fs.copyFileSync(bindingSrc, bindingDst);
    fs.copyFileSync(uiohookSrc, uiohookDst);
  } catch (e) {
    console.warn('[iohook] Failed to prepare gyp files:', e.message);
  }

  const gypBin = path.join(
    __dirname,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'node-gyp.cmd' : 'node-gyp'
  );

  const version = runtime === 'electron' ? (process.versions.electron || '') : process.versions.node;

  const args = ['rebuild'];
  if (version) args.unshift('configure', '--target=' + version);
  if (/^electron/i.test(runtime) && version) {
    args.push('--dist-url=https://artifacts.electronjs.org/headers/dist');
  }

  if (platform !== 'win32') {
    process.env.gyp_iohook_runtime = runtime;
    process.env.gyp_iohook_abi = abi;
    process.env.gyp_iohook_platform = platform;
    process.env.gyp_iohook_arch = arch;
  }

  console.log('[iohook] Starting local build fallback using node-gyp...');
  const proc = spawn(gypBin, args, { shell: true, stdio: 'inherit', env: process.env });
  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error('[iohook] Local build failed (exit code ' + code + ').');
      console.error('[iohook] You may try manual build:');
      console.error('  cd node_modules/iohook && npx node-gyp rebuild');
    } else {
      console.log('[iohook] Local build succeeded.');
    }
    cb && cb();
  });
}

const options = optionsFromPackage();

if (process.env.npm_config_targets) {
  options.targets = options.targets.concat(
    process.env.npm_config_targets.split(',')
  );
}
if (process.env.npm_config_targets === 'all') {
  options.targets = supportedTargets.map((arr) => [arr[0], arr[2]]);
  options.platforms = ['win32', 'darwin', 'linux'];
  options.arches = ['x64', 'ia32', 'arm64'];
}
if (process.env.npm_config_platforms) {
  options.platforms = options.platforms.concat(
    process.env.npm_config_platforms.split(',')
  );
}
if (process.env.npm_config_arches) {
  options.arches = options.arches.concat(
    process.env.npm_config_arches.split(',')
  );
}

if (!options.arches.includes('arm64')) {
  options.arches.push('arm64');
}

// Choice prebuilds for install
if (options.targets.length > 0) {
  let chain = Promise.resolve();
  options.targets.forEach(function (target) {
    if (typeof target === 'object') {
      chain = chain.then(function () {
        return new Promise(function (resolve) {
          console.log(target.runtime, target.abi, target.platform, target.arch);
          install(
            target.runtime,
            target.abi,
            target.platform,
            target.arch,
            resolve
          );
        });
      });
      return;
    }
    let parts = target.split('-');
    let runtime = parts[0];
    let abi = parts[1];
    options.platforms.forEach(function (platform) {
      options.arches.forEach(function (arch) {
        if (platform === 'darwin' && arch === 'ia32') {
          return;
        }
        if (platform !== 'darwin' && arch === 'arm64') {
          return;
        }
        chain = chain.then(function () {
          return new Promise(function (resolve) {
            console.log(runtime, abi, platform, arch);
            install(runtime, abi, platform, arch, resolve);
          });
        });
      });
    });
  });
} else {
  const runtime = process.versions['electron'] ? 'electron' : 'node';
  const abi = process.versions.modules;
  const platform = process.platform;
  const arch = process.arch;
  install(runtime, abi, platform, arch, function () {});
}
