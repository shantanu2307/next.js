import { findSourceMap } from 'module'
import { inspect } from 'util'

/**
 * https://tc39.es/source-map/#index-map
 */
interface IndexSourceMapSection {
  offset: {
    line: number
    column: number
  }
  map: BasicSourceMapPayload
}

// TODO(veil): Upstream types
/** https://tc39.es/ecma426/#sec-index-source-map */
interface IndexSourceMap {
  version: number
  file: string
  sections: IndexSourceMapSection[]
}

/** https://tc39.es/ecma426/#sec-source-map-format */
export interface BasicSourceMapPayload {
  version: number
  // TODO: Move to https://github.com/jridgewell/sourcemaps which is actively maintained
  /** WARNING: `file` is optional. */
  file: string
  sourceRoot?: string
  // TODO: Move to https://github.com/jridgewell/sourcemaps which is actively maintained
  /** WARNING: `sources[number]` can be `null`. */
  sources: Array<string>
  names: Array<string>
  mappings: string
  ignoreList?: number[]
}

export type ModernSourceMapPayload = BasicSourceMapPayload | IndexSourceMap

export function sourceMapIgnoreListsEverything(
  sourceMap: BasicSourceMapPayload
): boolean {
  return (
    sourceMap.ignoreList !== undefined &&
    sourceMap.sources.length === sourceMap.ignoreList.length
  )
}

/**
 * Finds the sourcemap payload applicable to a given frame.
 * Equal to the input unless an Index Source Map is used.
 */
export function findApplicableSourceMapPayload(
  line: number,
  column: number,
  payload: ModernSourceMapPayload
): BasicSourceMapPayload | undefined {
  if ('sections' in payload) {
    if (payload.sections.length === 0) {
      return undefined
    }

    // Sections must not overlap and must be sorted: https://tc39.es/source-map/#section-object
    // Therefore the last section that has an offset less than or equal to the frame is the applicable one.
    const sections = payload.sections
    let left = 0
    let right = sections.length - 1
    let result: IndexSourceMapSection | null = null

    while (left <= right) {
      // fast Math.floor
      const middle = ~~((left + right) / 2)
      const section = sections[middle]
      const offset = section.offset

      if (
        offset.line < line ||
        (offset.line === line && offset.column <= column)
      ) {
        result = section
        left = middle + 1
      } else {
        right = middle - 1
      }
    }

    return result === null ? undefined : result.map
  } else {
    return payload
  }
}

export function filterStackFrameDEV(
  sourceURL: string,
  functionName: string
): boolean {
  if (sourceURL === '') {
    // The default implementation filters out <anonymous> stack frames
    // but we want to retain them because current Server Components and
    // built-in Components in parent stacks don't have source location.
    // Filter out frames that show up in Promises to get good names in React's
    // Server Request track until we come up with a better heuristic.
    return (
      functionName !== 'new Promise' &&
      functionName !== 'Function.withResolvers'
    )
  }
  if (sourceURL.startsWith('node:') || sourceURL.includes('node_modules')) {
    return false
  }
  try {
    // Node.js loads source maps eagerly so this call is cheap.
    // TODO: ESM sourcemaps are O(1) but CommonJS sourcemaps are O(Number of CJS modules).
    // Make sure this doesn't adversely affect performance when CJS is used by Next.js.
    const sourceMap = findSourceMap(sourceURL)
    if (sourceMap === undefined) {
      // No source map assoicated.
      // TODO: Node.js types should reflect that `findSourceMap` can return `undefined`.
      // TODO: Revisit once https://github.com/facebook/react/pull/33706 lands.
      return true
    }
    const sourceMapPayload = sourceMap.payload
    if ('sections' in sourceMapPayload) {
      // TODO: Include line/column in call so that we can find the relevant section.
      return true
    }
    return !sourceMapIgnoreListsEverything(sourceMapPayload)
  } catch (cause) {
    // We must log a plain string here in case React is trying to serialize this error.
    console.error(
      inspect(
        new Error(
          `Failed to filter stack frame '${sourceURL}'. The associated source map is invalid. Make sure to produce a valid source map for this file.`,
          { cause }
        )
      )
    )
    return true
  }
}
