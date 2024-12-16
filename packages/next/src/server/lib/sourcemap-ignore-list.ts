export function ignoreListAnonymousStackFramesIfSandwiched<Frame>(
  frames: Frame[],
  isAnonymousFrame: (frame: Frame) => boolean,
  isIgnoredFrame: (frame: Frame) => boolean,
  /** only passes frames for which `isAnonymousFrame` or `isIgnoredFrame` return true */
  ignoreFrame: (frame: Frame) => void
): void {
  for (let i = 0; i < frames.length; i++) {
    const currentFrame = frames[i]
    if (!isAnonymousFrame(currentFrame)) {
      continue
    }

    let previousFrameIsIgnored: boolean
    if (i === 0) {
      previousFrameIsIgnored = true
    } else {
      previousFrameIsIgnored = isIgnoredFrame(frames[i - 1])
    }

    if (previousFrameIsIgnored && i < frames.length - 1) {
      let ignoreSandwich = false
      let j = i + 1
      for (j; j < frames.length; j++) {
        const nextFrame = frames[j]
        const nextFrameIsAnonymous = isAnonymousFrame(nextFrame)
        if (nextFrameIsAnonymous) {
          continue
        }

        const nextFrameIsIgnored = isIgnoredFrame(nextFrame)
        if (nextFrameIsIgnored) {
          ignoreSandwich = true
          break
        }
      }

      if (ignoreSandwich) {
        for (i; i <= j; i++) {
          ignoreFrame(frames[i])
        }
      }
    }
  }
}
