export default function DeepObjectsPage() {
  return (
    <div>
      <h1>Deep Objects Test</h1>
      <button
        id="deep-button"
        onClick={() => {
          const deepObj = {
            level1: {
              level2: {
                level3: {
                  level4: {
                    level5: 'cut off',
                  },
                },
              },
            },
          }
          console.log('Deep object:', deepObj)
        }}
      >
        Log Deep Object
      </button>
    </div>
  )
}
