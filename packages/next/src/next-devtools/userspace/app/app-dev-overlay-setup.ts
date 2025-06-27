import { patchConsoleError } from './errors/intercept-console-error'
import { handleGlobalErrors } from './errors/use-error-handler'
import { patchLogs } from './forward-logs'
import { isTerminalLoggingEnabled } from './terminal-logging-config'
console.log('patching')

handleGlobalErrors()
patchConsoleError()

// Only initialize browser logs forwarding if enabled
if (isTerminalLoggingEnabled()) {
  patchLogs('app')
}
