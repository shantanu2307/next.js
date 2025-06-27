export default function BasicLogsPage() {
  return (
    <div>
      <h1>Basic Logs Test</h1>
      <button
        id="log-button"
        onClick={() => {
          console.log('Hello from browser')
        }}
      >
        Log Message
      </button>
      <button
        id="error-button"
        onClick={() => {
          console.error('Error from browser')
        }}
      >
        Log Error
      </button>
      <button
        id="warn-button"
        onClick={() => {
          console.warn('Warning message')
        }}
      >
        Log Warning
      </button>
    </div>
  )
}
