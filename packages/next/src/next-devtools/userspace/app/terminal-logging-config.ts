/**
 * Parse the terminal logging config from environment variables
 * Returns false if disabled, or the config object if enabled
 */
export function getTerminalLoggingConfig():
  | false
  | boolean
  | { serializationDepth?: number } {
  try {
    return JSON.parse(process.env.__NEXT_TERMINAL_LOGGING_CONFIG || 'false')
  } catch {
    return false
  }
}

/**
 * Check if terminal logging is enabled
 */
export function isTerminalLoggingEnabled(): boolean {
  const config = getTerminalLoggingConfig()
  return Boolean(config)
}
