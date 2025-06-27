export default function BasicLogsPage() {
  return (
    <div>
      <h1>Basic Logs Test</h1>
      <button
        onClick={() => {
          console.log('Hello from browser')
          console.warn('Warning message')
          console.error('Error message')
        }}
      >
        Trigger Logs
      </button>
    </div>
  )
}
