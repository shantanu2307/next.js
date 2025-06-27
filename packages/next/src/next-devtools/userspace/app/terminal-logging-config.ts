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

export function isTerminalLoggingEnabled(): boolean {
  const config = getTerminalLoggingConfig()
  return Boolean(config)
}
