export default function PromiseRejectionPage() {
  return (
    <div>
      <h1>Promise Rejection Test</h1>
      <button
        onClick={() => {
          Promise.reject(new Error('Unhandled rejection'))
        }}
      >
        Trigger Promise Rejection
      </button>
    </div>
  )
}
