import { UNDEFINED_MARKER } from '../../shared/forward-logs-shared'
import {
  safeClone,
  PROMISE_MARKER,
  UNAVAILABLE_MARKER,
  logStringify,
} from './forward-logs'

const safeStringify = (data: unknown) => logStringify(safeClone(data))

describe('forward-logs serialization', () => {
  describe('safeClone', () => {
    it('should handle primitive values and null', () => {
      expect(safeClone(42)).toBe(42)
      expect(safeClone('hello')).toBe('hello')
      expect(safeClone(true)).toBe(true)
      expect(safeClone(null)).toBe(null)
      expect(safeClone(undefined)).toBe(UNDEFINED_MARKER)
    })

    it('should handle circular references', () => {
      const obj: any = { a: 1 }
      obj.self = obj
      const cloned = safeClone(obj)
      expect(cloned.a).toBe(1)
      expect(cloned.self).toBe(cloned)
    })

    it('should handle promises', () => {
      const promise = Promise.resolve(42)
      expect(safeClone(promise)).toBe(PROMISE_MARKER)
    })

    it('should handle arrays', () => {
      const arr = [1, 'test', undefined, null]
      const cloned = safeClone(arr)
      expect(cloned).toEqual([1, 'test', UNDEFINED_MARKER, null])
    })

    it('should handle plain objects', () => {
      const obj = { a: 1, b: undefined, c: 'test' }
      const cloned = safeClone(obj)
      expect(cloned).toEqual({ a: 1, b: UNDEFINED_MARKER, c: 'test' })
    })

    it('should handle objects with getters that throw', () => {
      const obj = {
        normalProp: 'works',
        get throwingGetter() {
          throw new Error('Getter throws')
        },
      }

      const cloned = safeClone(obj)
      expect(cloned.normalProp).toBe('works')
      expect(cloned.throwingGetter).toBe(UNAVAILABLE_MARKER)
    })

    it('should handle non-plain objects as toString', () => {
      const date = new Date('2023-01-01')
      const regex = /test/gi
      const error = new Error('Test error')

      expect(safeClone(date)).toBe('[object Date]')
      expect(safeClone(regex)).toBe('[object RegExp]')
      expect(safeClone(error)).toBe('[object Error]')
    })

    it('should handle array items that throw', () => {
      const throwingProxy = new Proxy(
        {},
        {
          get() {
            throw new Error('Proxy throws')
          },
        }
      )

      const arr = [1, throwingProxy, 'normal']
      const cloned = safeClone(arr)
      console.log(
        'what is this equal to',
        cloned,
        cloned[1] === UNAVAILABLE_MARKER
      )

      expect(cloned).toEqual([1, UNAVAILABLE_MARKER, 'normal'])
    })
  })

  describe('logStringify', () => {
    it('should stringify safe cloned data', () => {
      expect(safeStringify(42)).toBe('42')
      expect(safeStringify('hello')).toBe('"hello"')
      expect(safeStringify(null)).toBe('null')
      expect(safeStringify(undefined)).toBe(`"${UNDEFINED_MARKER}"`)
    })

    it('should handle objects with circular references', () => {
      const obj: any = { a: 1 }
      obj.self = obj
      const result = safeStringify(obj)
      expect(typeof result).toBe('string')
      expect(result).toContain('"a":1')
    })

    it('should return UNAVAILABLE_MARKER on stringify failure', () => {
      const problematicData = {
        toJSON() {
          throw new Error('toJSON throws')
        },
      }

      const result = safeStringify(problematicData)
      expect(result).toBe(`"${UNAVAILABLE_MARKER}"`)
    })
  })
})
