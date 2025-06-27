export default function SourceMapsPage() {
  return (
    <div>
      <h1>Source Maps Test</h1>
      <button
        onClick={() => {
          function throwError() {
            throw new Error('Test error with stack')
          }
          try {
            throwError()
          } catch (e) {
            console.error('Caught error:', e)
          }
        }}
      >
        Test Source Maps
      </button>
    </div>
  )
}
