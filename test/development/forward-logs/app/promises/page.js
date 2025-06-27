export default function PromisesPage() {
  return (
    <div>
      <h1>Promises Test</h1>
      <button
        onClick={() => {
          const promise = Promise.resolve('resolved')
          console.log('Promise:', promise)
        }}
      >
        Log Promise
      </button>
    </div>
  )
}
