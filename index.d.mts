// ESM-specific type declarations so that TypeScript projects using NodeNext/ESM
// module resolution get proper default/named exports while CJS keeps using index.d.ts
import { EventEmitter } from 'events';

declare class IOHook extends EventEmitter {
  start(enableLogger?: boolean): void;
  stop(): void;
  load(): void;
  unload(): void;
  setDebug(mode: boolean): void;
  useRawcode(using: boolean): void;
  enableClickPropagation(): void;
  disableClickPropagation(): void;
  registerShortcut(
    keys: Array<string | number>,
    callback: Function,
    releaseCallback?: Function
  ): number;
  unregisterShortcut(shortcutId: number): void;
  unregisterShortcut(keys: Array<string | number>): void;
  unregisterAllShortcuts(): void;
}

declare const iohook: IOHook;
export default iohook;
export { iohook };
