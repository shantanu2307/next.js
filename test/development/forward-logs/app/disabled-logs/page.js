export default function DisabledLogsPage() {
  return (
    <div>
      <h1>Disabled Logs Test</h1>
      <button
        onClick={() => {
          console.log('This should not appear in terminal')
        }}
      >
        Trigger Log (Should Not Appear)
      </button>
    </div>
  )
}
