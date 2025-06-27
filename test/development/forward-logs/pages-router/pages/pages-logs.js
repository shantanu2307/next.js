export default function PagesLogsPage() {
  return (
    <div>
      <h1>Pages Router Logs Test</h1>
      <button
        onClick={() => {
          console.log('Pages router log')
          console.error('Pages router error')
        }}
      >
        Trigger Pages Router Logs
      </button>
    </div>
  )
}
