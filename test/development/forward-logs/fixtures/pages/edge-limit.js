export default function EdgeLimitPage() {
  return (
    <div>
      <h1>Edge Limit Test (Pages Router)</h1>
      <button
        id="large-array-button"
        onClick={() => {
          const largeArray = Array.from({ length: 150 }, (_, i) => `item${i}`)
          console.log('Large array:', largeArray)
        }}
      >
        Log Large Array
      </button>
      <button
        id="large-object-button"
        onClick={() => {
          const largeObject = {}
          for (let i = 0; i < 150; i++) {
            largeObject[`prop${i}`] = `value${i}`
          }
          console.log('Large object:', largeObject)
        }}
      >
        Log Large Object
      </button>
    </div>
  )
}
