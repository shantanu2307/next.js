export default function CircularRefsPage() {
  return (
    <div>
      <h1>Circular References Test</h1>
      <button
        id="circular-button"
        onClick={() => {
          const obj = { name: 'test' }
          obj.self = obj
          console.log('Circular object:', obj)
        }}
      >
        Log Circular Object
      </button>
    </div>
  )
}
