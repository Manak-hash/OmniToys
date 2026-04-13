/**
 * Console utility that disables debug logs in production
 * Error and warning logs are always shown
 */

const isDev = import.meta.env.DEV

export const logger = {
  log: isDev ? console.log : () => {},
  debug: isDev ? console.debug : () => {},
  info: isDev ? console.info : () => {},
  warn: console.warn, // Always show warnings
  error: console.error, // Always show errors

  // Specialized debug logs that only show in dev
  wasm: isDev ? console.log : () => {},
  pwa: isDev ? console.log : () => {},
  keyboard: isDev ? console.log : () => {},
  performance: isDev ? console.log : () => {},
}

// Disable console.log in production
if (!isDev) {
  console.log = () => {}
  console.debug = () => {}
  console.info = () => {}
}
