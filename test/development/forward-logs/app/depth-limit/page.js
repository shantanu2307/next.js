export default function DepthLimitPage() {
  return (
    <div>
      <h1>Depth Limit Test</h1>
      <button
        onClick={() => {
          const deepObj = {
            level1: {
              level2: {
                level3: {
                  level4: 'too deep',
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
