import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'e2e-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'
import stripAnsi from 'strip-ansi'
import { retry } from 'next-test-utils'

const bundlerName = process.env.IS_TURBOPACK_TEST ? 'Turbopack' : 'Webpack'

function setupLogCapture() {
  const logs: string[] = []
  const originalStdout = process.stdout.write
  const originalStderr = process.stderr.write

  const capture = (chunk: any) => {
    logs.push(stripAnsi(chunk.toString()))
    return true
  }

  process.stdout.write = function (chunk: any) {
    capture(chunk)
    return originalStdout.call(this, chunk)
  }

  process.stderr.write = function (chunk: any) {
    capture(chunk)
    return originalStderr.call(this, chunk)
  }

  const restore = () => {
    process.stdout.write = originalStdout
    process.stderr.write = originalStderr
  }

  const clearLogs = () => {
    logs.length = 0
  }

  return { logs, restore, clearLogs }
}

describe(`Terminal Logging (${bundlerName})`, () => {
  describe('when enabled', () => {
    let next: NextInstance
    let logs: string[] = []
    let logCapture: ReturnType<typeof setupLogCapture>

    beforeAll(async () => {
      logCapture = setupLogCapture()
      logs = logCapture.logs

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
          'next.config.js': `
            module.exports = {
              experimental: {
                browserDebugInfoInTerminal: true
              }
            }
          `,
        },
      })
    })

    afterAll(async () => {
      logCapture.restore()
      await next.destroy()
    })

    beforeEach(() => {
      logCapture.clearLogs()
    })

    it('should forward console.log to terminal', async () => {
      const browser = await webdriver(next.url, '/basic-logs')
      await browser.waitForElementByCss('#log-button')
      await browser.elementByCss('#log-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Hello from browser')
      })

      await browser.close()
    })

    it('should forward console.error to terminal', async () => {
      const browser = await webdriver(next.url, '/basic-logs')

      await browser.waitForElementByCss('#error-button')
      await browser.elementByCss('#error-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Error from browser')
      })

      await browser.close()
    })

    it('should handle complex objects', async () => {
      const browser = await webdriver(next.url, '/complex-objects')

      await browser.waitForElementByCss('#object-button')
      await browser.elementByCss('#object-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Complex object')
        expect(logOutput).toContain(`\
{
  array: [ 1, 2, 3 ],
  date: '[object Date]',
  name: 'test',
  nested: { value: 42 },
  nullVal: null,
  undef: undefined
}\
`)
      })

      await browser.close()
    })

    it('should respect default depth limit of 5', async () => {
      const browser = await webdriver(next.url, '/deep-objects')

      await browser.waitForElementByCss('#deep-button')
      await browser.elementByCss('#deep-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Deep object')
        expect(logOutput).toContain('level1')
        expect(logOutput).toContain('level2')
        expect(logOutput).toContain('level3')
        expect(logOutput).toContain('level4')
        expect(logOutput).toContain('cut off')
      })

      await browser.close()
    })

    it('should handle circular references safely', async () => {
      const browser = await webdriver(next.url, '/circular-refs')

      await browser.waitForElementByCss('#circular-button')
      await browser.elementByCss('#circular-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain(`{ name: 'test', self: '[Circular]`)
      })

      await browser.close()
    })

    it('should forward console.warn to terminal', async () => {
      const browser = await webdriver(next.url, '/basic-logs')

      await browser.waitForElementByCss('#warn-button')
      await browser.elementByCss('#warn-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Warning message')
      })

      await browser.close()
    })

    it('should handle console format strings', async () => {
      const browser = await webdriver(next.url, '/strict-mode')
      await browser.waitForElementByCss('#format-string-button')
      await browser.elementByCss('#format-string-button').click()

      await retry(() => {
        const logOutput = logs.join('\n')
        const browserLogs = logOutput
          .split('\n')
          .filter((line) => line.includes('[browser]'))

        expect(browserLogs.some((line) => line.includes('Normal log'))).toBe(
          true
        )
        expect(
          browserLogs.some((line) =>
            line.includes('Dimmed log (simulated strict mode)')
          )
        ).toBe(true)
        expect(
          browserLogs.some((line) => line.includes('Multiple 42 formats'))
        ).toBe(true)
        expect(browserLogs.some((line) => line.includes('styled log'))).toBe(
          true
        )

        expect(browserLogs.every((line) => !line.includes('%s'))).toBe(true)
        expect(browserLogs.every((line) => !line.includes('%d'))).toBe(true)
        expect(browserLogs.every((line) => !line.includes('%c'))).toBe(true)
      })

      await browser.close()
    })

    it('should handle mixed console arguments correctly', async () => {
      const browser = await webdriver(next.url, '/strict-mode')

      await browser.waitForElementByCss('#mixed-args-button')
      await browser.elementByCss('#mixed-args-button').click()

      await retry(() => {
        const logOutput = logs.join('\n')
        const browserLogs = logOutput
          .split('\n')
          .filter((line) => line.includes('[browser]'))

        expect(
          browserLogs.some((line) => line.includes('String format extra arg'))
        ).toBe(true)
        expect(
          browserLogs.some((line) =>
            line.includes('No format string but multiple args')
          )
        ).toBe(true)
        expect(
          browserLogs.some((line) => line.includes('5 items processed'))
        ).toBe(true)

        expect(
          browserLogs.every(
            (line) => !line.includes('%s') && !line.includes('%d')
          )
        ).toBe(true)
      })

      await browser.close()
    })

    it('should handle format strings in console.error and console.warn', async () => {
      const browser = await webdriver(next.url, '/strict-mode')

      await browser.waitForElementByCss('#error-format-button')
      await browser.elementByCss('#error-format-button').click()

      await retry(() => {
        const logOutput = logs.join('\n')
        const browserLogs = logOutput
          .split('\n')
          .filter((line) => line.includes('[browser]'))

        expect(
          browserLogs.some((line) => line.includes('Error with format string'))
        ).toBe(true)
        expect(
          browserLogs.some((line) => line.includes('Warning with 123'))
        ).toBe(true)
        expect(
          browserLogs.some((line) =>
            line.includes('Normal error without format')
          )
        ).toBe(true)

        expect(browserLogs.every((line) => !line.includes('%s'))).toBe(true)
        expect(browserLogs.every((line) => !line.includes('%d'))).toBe(true)
      })

      await browser.close()
    })
  })

  describe('when disabled (default)', () => {
    let next: NextInstance
    let logs: string[] = []
    let logCapture: ReturnType<typeof setupLogCapture>

    beforeAll(async () => {
      logCapture = setupLogCapture()
      logs = logCapture.logs

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
        },
      })
    })

    afterAll(async () => {
      logCapture.restore()
      await next.destroy()
    })

    beforeEach(() => {
      logCapture.clearLogs()
    })

    it(`should not forward logs when disabled (${bundlerName})`, async () => {
      const browser = await webdriver(next.url, '/basic-logs')

      await browser.waitForElementByCss('#log-button')
      await browser.elementByCss('#log-button').click()

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).not.toContain('[browser] Hello from browser')

      await browser.close()
    })
  })

  describe('with serialization depth limit', () => {
    let next: NextInstance
    let logs: string[] = []
    let logCapture: ReturnType<typeof setupLogCapture>

    beforeAll(async () => {
      logCapture = setupLogCapture()
      logs = logCapture.logs

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
          'next.config.js': `
            module.exports = {
              experimental: {
                browserDebugInfoInTerminal: {
                  depthLimit: 2
                }
              }
            }
          `,
        },
      })
    })

    afterAll(async () => {
      logCapture.restore()
      await next.destroy()
    })

    beforeEach(() => {
      logCapture.clearLogs()
    })

    it(`should respect serialization depth limit (${bundlerName})`, async () => {
      const browser = await webdriver(next.url, '/deep-objects')

      await browser.waitForElementByCss('#deep-button')
      await browser.elementByCss('#deep-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('level1')
        expect(logOutput).toContain('level2')
        expect(logOutput).not.toContain('level4')
      })

      await browser.close()
    })
  })

  describe('with edge limit configuration', () => {
    let next: NextInstance
    let logs: string[] = []
    let logCapture: ReturnType<typeof setupLogCapture>

    beforeAll(async () => {
      logCapture = setupLogCapture()
      logs = logCapture.logs

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
          'next.config.js': `
            module.exports = {
              experimental: {
                browserDebugInfoInTerminal: {
                  edgeLimit: 10
                }
              }
            }
          `,
        },
      })
    })

    afterAll(async () => {
      logCapture.restore()
      await next.destroy()
    })

    beforeEach(() => {
      logCapture.clearLogs()
    })

    it(`should respect custom edge limit for arrays (${bundlerName})`, async () => {
      const browser = await webdriver(next.url, '/edge-limit')

      await browser.waitForElementByCss('#large-array-button')
      await browser.elementByCss('#large-array-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Large array:')
        expect(logOutput).toContain('... 139 items not stringified')
      })

      await browser.close()
    })

    it(`should respect custom edge limit for objects (${bundlerName})`, async () => {
      const browser = await webdriver(next.url, '/edge-limit')

      await browser.waitForElementByCss('#large-object-button')
      await browser.elementByCss('#large-object-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Large object:')
        expect(logOutput).toContain('140 items not stringified')
      })

      await browser.close()
    })
  })

  describe('with showSourceLocation disabled', () => {
    let next: NextInstance
    let logs: string[] = []
    let logCapture: ReturnType<typeof setupLogCapture>

    beforeAll(async () => {
      logCapture = setupLogCapture()
      logs = logCapture.logs

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
          'next.config.js': `
            module.exports = {
              experimental: {
                browserDebugInfoInTerminal: {
                  showSourceLocation: false
                }
              }
            }
          `,
        },
      })
    })

    afterAll(async () => {
      logCapture.restore()
      await next.destroy()
    })

    beforeEach(() => {
      logCapture.clearLogs()
    })

    it(`should omit source location in logs when disabled (${bundlerName})`, async () => {
      const browser = await webdriver(next.url, '/basic-logs')

      await browser.waitForElementByCss('#log-button')
      await browser.elementByCss('#log-button').click()

      await retry(() => {
        const logOutput = logs.join('')
        expect(logOutput).toContain('[browser]')
        expect(logOutput).toContain('Hello from browser')
        expect(logOutput).not.toMatch(/\([^)]+basic-logs\.js[:)]/)
      })

      await browser.close()
    })
  })
})
