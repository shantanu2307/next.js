import { ignoreListAnonymousStackFramesIfSandwiched } from './sourcemap-ignore-list'

type StackFrame = null | {
  file: string
  ignored: boolean
}

// Reference implementation with nullable frames.
function ignoreList(frames: StackFrame[]) {
  ignoreListAnonymousStackFramesIfSandwiched(
    frames,
    (frame) => frame !== null && frame.file === '<anonymous>',
    (frame) => frame !== null && frame.ignored,
    (frame) => {
      frame!.ignored = true
    }
  )
}

test('hides small sandwiches', () => {
  const frames: StackFrame[] = [
    {
      file: 'file1.js',
      ignored: true,
    },
    {
      file: '<anonymous>',
      ignored: false,
    },
    {
      file: 'file2.js',
      ignored: true,
    },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: 'file1.js', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: 'file2.js', ignored: true },
  ])
})

test('hides big sandwiches', () => {
  const frames: StackFrame[] = [
    { file: 'file1.js', ignored: true },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: true },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: 'file1.js', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: 'file2.js', ignored: true },
  ])
})

test('hides sandwiches without a lid', () => {
  const frames: StackFrame[] = [
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: true },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: 'file2.js', ignored: true },
  ])
})

test('does not ignore list anonymous frames where the bottom is shown', () => {
  const frames: StackFrame[] = [
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: false },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: '<anonymous>', ignored: true },
    { file: 'file2.js', ignored: false },
  ])
})

test('does not ignore list anonymous frames by default', () => {
  const frames: StackFrame[] = [
    { file: 'file1.js', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: false },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: 'file1.js', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: false },
  ])
})

test('does not ignore list if bottom is not ignore-listed', () => {
  const frames: StackFrame[] = [
    { file: 'file1.js', ignored: true },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: false },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: 'file1.js', ignored: true },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: false },
  ])
})

test('does not ignore list if top is not ignore-listed', () => {
  const frames: StackFrame[] = [
    { file: 'file1.js', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: true },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: 'file1.js', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: true },
  ])
})

test('does not ignore list if top is unknown', () => {
  const frames: StackFrame[] = [
    null,
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: true },
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    null,
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    { file: 'file2.js', ignored: true },
  ])
})

test('does not ignore list if bottom is unknown', () => {
  const frames: StackFrame[] = [
    { file: 'file1.js', ignored: true },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    null,
  ]

  ignoreList(frames)

  expect(frames).toEqual([
    { file: 'file1.js', ignored: true },
    { file: '<anonymous>', ignored: false },
    { file: '<anonymous>', ignored: false },
    null,
  ])
})
