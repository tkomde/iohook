// ESM wrapper for the CommonJS implementation to provide dual (CJS + ESM) package support.
// Keep all implementation logic in index.js so we don't duplicate code.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load CommonJS singleton instance
const iohook = require('./index.js');

export default iohook;
export { iohook };
