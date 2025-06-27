export default function ComplexObjectsPage() {
  return (
    <div>
      <h1>Complex Objects Test</h1>
      <button
        id="object-button"
        onClick={() => {
          const complexObj = {
            name: 'test',
            nested: { value: 42 },
            array: [1, 2, 3],
            date: new Date('2023-01-01'),
            undef: undefined,
            nullVal: null,
          }
          console.log('Complex object:', complexObj)
        }}
      >
        Log Complex Object
      </button>
    </div>
  )
}
