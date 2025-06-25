// wtf is the point of this file
// not actually shared fire
export type LogLevel = 'log' | 'info' | 'warn'  | 'debug' | 'table'

export type ConsoleEntry = {
  kind: 'console'
  level: LogLevel
  args: Array<
    | {
        kind: 'arg'
        data: any
      }
    | {
        kind: 'formatted-error-arg'
        prefix: string
        stack: string
      }
  >
}

export type ConsoleErrorEntry = {
  kind: 'console-error',
  level: 'error',
  consoleErrorStack: string
  args: Array<
    | {
        kind: 'arg'
        data: any
        isRejectionMessage?: boolean
      }
    | {
        kind: 'formatted-error-arg'
        prefix: string
        stack: string
      }
  >
}



export type FormattedErrorEntry = {
  kind: 'formatted-error'
  prefix: string
  stack: string
  level: 'error'
}

export type LogEntry = ConsoleEntry |ConsoleErrorEntry |FormattedErrorEntry
