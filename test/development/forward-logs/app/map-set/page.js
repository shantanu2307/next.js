export default function MapSetPage() {
  return (
    <div>
      <h1>Map and Set Test</h1>
      <button
        onClick={() => {
          const map = new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
          ])
          const set = new Set([1, 2, 3])
          console.log('Map:', map)
          console.log('Set:', set)
        }}
      >
        Log Map and Set
      </button>
    </div>
  )
}
