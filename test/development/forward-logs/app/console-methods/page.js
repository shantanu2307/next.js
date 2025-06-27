export default function ConsoleMethodsPage() {
  return (
    <div>
      <h1>Console Methods Test</h1>
      <button
        onClick={() => {
          console.log('log message')
          console.info('info message')
          console.warn('warn message')
          console.debug('debug message')
          console.table([{ a: 1, b: 2 }])
          console.group('group')
          console.log('inside group')
          console.groupEnd()
        }}
      >
        Test Console Methods
      </button>
    </div>
  )
}
