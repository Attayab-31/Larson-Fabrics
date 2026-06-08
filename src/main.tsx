import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe sanitization helper against parent-iframe circular JSON.stringify crashes
function sanitizeConsoleArg(arg: any, depth = 0, seen = new WeakSet()): any {
  if (depth > 5) return "[MaxDepth]";
  if (arg === null || arg === undefined) return arg;
  if (typeof arg !== "object") {
    if (typeof arg === "function") {
      return `[Function: ${arg.name || "anonymous"}]`;
    }
    return arg;
  }

  if (seen.has(arg)) {
    return "[Circular]";
  }
  seen.add(arg);

  if (arg instanceof Error) {
    return {
      name: arg.name,
      message: arg.message,
      stack: arg.stack,
    };
  }

  if (arg instanceof Node || (arg.nodeType && arg.nodeName)) {
    return `[DOMElement: ${arg.nodeName}]`;
  }

  if (Array.isArray(arg)) {
    return arg.map((item) => sanitizeConsoleArg(item, depth + 1, seen));
  }

  const safeObj: Record<string, any> = {};
  for (const key of Object.keys(arg)) {
    if (key.startsWith("__reactFiber") || key.startsWith("__reactEvents") || key.startsWith("__reactProps")) {
      safeObj[key] = "[ReactInternal]";
      continue;
    }
    try {
      const val = arg[key];
      safeObj[key] = sanitizeConsoleArg(val, depth + 1, seen);
    } catch {
      safeObj[key] = "[UnsafeProperty]";
    }
  }
  return safeObj;
}

const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;
const originalInfo = console.info;

console.error = (...args: any[]) => {
  const safeArgs = args.map((arg) => sanitizeConsoleArg(arg));
  originalError.apply(console, safeArgs);
};
console.warn = (...args: any[]) => {
  const safeArgs = args.map((arg) => sanitizeConsoleArg(arg));
  originalWarn.apply(console, safeArgs);
};
console.log = (...args: any[]) => {
  const safeArgs = args.map((arg) => sanitizeConsoleArg(arg));
  originalLog.apply(console, safeArgs);
};
console.info = (...args: any[]) => {
  const safeArgs = args.map((arg) => sanitizeConsoleArg(arg));
  originalInfo.apply(console, safeArgs);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

