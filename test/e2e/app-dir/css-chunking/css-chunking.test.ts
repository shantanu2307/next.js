import { nextTestSetup } from 'e2e-utils'

describe('css-chunking', () => {
  const { next } = nextTestSetup({ files: __dirname })

  // this test asserts that all the emitted CSS files for the index page
  // do not contain styles for the `/other` page, which can happen
  // when the CSSChunkingPlugin is enabled and styles are shared across
  // both routes.
  ;(process.env.IS_TURBOPACK_TEST ? it.skip : it)(
    'should be possible to disable the chunking plugin',
    async () => {
      const $ = await next.render$('/')
      const stylesheets = $('link[rel="stylesheet"]')
      const cssResults = await Promise.all(
        stylesheets
          .map(async (_, element) => {
            const href = element.attribs.href
            const result = await next.fetch(href)
            return await result.text()
          })
          .get()
      )

      // eslint-disable-next-line jest/no-standalone-expect
      expect(cssResults).toEqual(
        // eslint-disable-next-line jest/no-standalone-expect
        expect.arrayContaining([expect.not.stringContaining('.otherPage')])
      )
    }
  )
})
