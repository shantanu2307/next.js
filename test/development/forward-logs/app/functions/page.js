export default function FunctionsPage() {
  return (
    <div>
      <h1>Functions Test</h1>
      <button
        onClick={() => {
          function testFunction() {
            return 'hello'
          }
          console.log('Function:', testFunction)
        }}
      >
        Log Function
      </button>
    </div>
  )
}
