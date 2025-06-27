// open any page that keeps a WebSocket open (or create your own)
const ws = new WebSocket('wss://echo.websocket.events')
await new Promise((r) => ws.addEventListener('open', r))

function bench(label, payload, n = 1e5) {
  const t0 = performance.now()
  for (let i = 0; i < n; i++) ws.send(payload)
  const t1 = performance.now()
  console.log(label, (((t1 - t0) * 1e3) / n).toFixed(2), 'µs / call')
}

bench('empty string', '')
bench('16-byte string', 'x'.repeat(16))
bench('1 KiB ArrayBuffer', new Uint8Array(1024).buffer)
