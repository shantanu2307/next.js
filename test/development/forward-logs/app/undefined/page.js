export default function UndefinedPage() {
  return (
    <div>
      <h1>Undefined Values Test</h1>
      <button
        onClick={() => {
          console.log('Undefined value:', undefined)
          console.log('Object with undefined:', { value: undefined })
        }}
      >
        Log Undefined Values
      </button>
    </div>
  )
}
