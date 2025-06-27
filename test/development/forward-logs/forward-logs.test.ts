import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'e2e-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'
import stripAnsi from 'strip-ansi'

const bundlerName = process.env.IS_TURBOPACK_TEST ? 'Turbopack' : 'Webpack'

describe(`Terminal Logging (${bundlerName})`, () => {
  describe('when enabled', () => {
    let next: NextInstance
    let logs: string[] = []
    let originalStdout: typeof process.stdout.write
    let originalStderr: typeof process.stderr.write

    beforeAll(async () => {
      originalStdout = process.stdout.write
      originalStderr = process.stderr.write

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

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
          'next.config.js': `
            module.exports = {
              experimental: {
                terminalLogging: true
              }
            }
          `,
        },
      })
    })

    afterAll(async () => {
      process.stdout.write = originalStdout
      process.stderr.write = originalStderr
      await next.destroy()
    })

    beforeEach(() => {
      logs = []
    })

    it('should forward console.log to terminal', async () => {
      const browser = await webdriver(next.url, '/basic-logs')
      await browser.waitForElementByCss('#log-button')
      await browser.elementByCss('#log-button').click()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).toContain('[browser]')
      expect(logOutput).toContain('Hello from browser')

      await browser.close()
    })

    it('should forward console.error to terminal', async () => {
      const browser = await webdriver(next.url, '/basic-logs')

      await browser.waitForElementByCss('#error-button')
      await browser.elementByCss('#error-button').click()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).toContain('[browser]')
      expect(logOutput).toContain('Error from browser')

      await browser.close()
    })

    it('should handle complex objects', async () => {
      const browser = await webdriver(next.url, '/complex-objects')

      await browser.waitForElementByCss('#object-button')
      await browser.elementByCss('#object-button').click()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).toContain('[browser]')
      expect(logOutput).toContain('Complex object')
      expect(logOutput).toContain('nested')

      await browser.close()
    })

    it('should handle circular references safely', async () => {
      const browser = await webdriver(next.url, '/circular-refs')

      await browser.waitForElementByCss('#circular-button')
      await browser.elementByCss('#circular-button').click()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).toContain('[browser]')
      expect(logOutput).toContain('Circular object')
      expect(logOutput).not.toContain('Converting circular structure to JSON')

      await browser.close()
    })

    it('should forward console.warn to terminal', async () => {
      const browser = await webdriver(next.url, '/basic-logs')

      await browser.waitForElementByCss('#warn-button')
      await browser.elementByCss('#warn-button').click()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).toContain('[browser]')
      expect(logOutput).toContain('Warning message')

      await browser.close()
    })

    it(`should use ${bundlerName.toLowerCase()} implementation for log processing`, async () => {
      const browser = await webdriver(next.url, '/basic-logs')

      await browser.waitForElementByCss('#log-button')
      await browser.elementByCss('#log-button').click()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).toContain('[browser]')
      expect(logOutput).toContain('Hello from browser')

      await browser.close()
    })
  })

  describe('when disabled (default)', () => {
    let next: NextInstance
    let logs: string[] = []
    let originalStdout: typeof process.stdout.write
    let originalStderr: typeof process.stderr.write

    beforeAll(async () => {
      originalStdout = process.stdout.write
      originalStderr = process.stderr.write

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

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
        },
      })
    })

    afterAll(async () => {
      process.stdout.write = originalStdout
      process.stderr.write = originalStderr
      await next.destroy()
    })

    beforeEach(() => {
      logs = []
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
    let originalStdout: typeof process.stdout.write
    let originalStderr: typeof process.stderr.write

    beforeAll(async () => {
      originalStdout = process.stdout.write
      originalStderr = process.stderr.write

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

      next = await createNext({
        files: {
          pages: new FileRef(join(__dirname, 'fixtures/pages')),
          'next.config.js': `
            module.exports = {
              experimental: {
                terminalLogging: {
                  serializationDepth: 2
                }
              }
            }
          `,
        },
      })
    })

    afterAll(async () => {
      process.stdout.write = originalStdout
      process.stderr.write = originalStderr
      await next.destroy()
    })

    beforeEach(() => {
      logs = []
    })

    it(`should respect serialization depth limit (${bundlerName})`, async () => {
      const browser = await webdriver(next.url, '/deep-objects')

      await browser.waitForElementByCss('#deep-button')
      await browser.elementByCss('#deep-button').click()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const logOutput = logs.join('')
      expect(logOutput).toContain('[browser]')
      expect(logOutput).toContain('level1')
      expect(logOutput).toContain('level2')
      expect(logOutput).not.toContain('level4')

      await browser.close()
    })
  })
})
