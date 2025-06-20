import { useState, useRef } from 'react'
import { css } from '../../../../utils/css'

const ERROR_DELAY_MS = 180
const SUCCESS_DELAY_MS = 1000

export function ShortcutRecorder({
  value,
  onChange,
}: {
  value: string[] | null
  onChange: (value: string) => void
}) {
  const [show, setShow] = useState(false)
  const [keys, setKeys] = useState<string[]>(value ?? [])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const timeoutRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const modifierKeys = new Set([
    'Meta',
    'Control',
    'Ctrl',
    'Alt',
    'Option',
    'Shift',
  ])

  function validate(keys_: string[]) {
    const modifiers = keys_.filter((key) => modifierKeys.has(key))
    const nonModifiers = keys_.filter((key) => !modifierKeys.has(key))

    let message: string | null = null

    if (keys_.length === 0) {
      message = null
    } else if (modifiers.length > 0 && nonModifiers.length === 0) {
      message = 'Shortcut must include a non-modifier key'
    } else {
      message = null
    }

    return message
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') return
    if (e.key === 'Tab' && e.shiftKey) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    function handleValidation(next: string[]) {
      timeoutRef.current = window.setTimeout(() => {
        const invalid = validate(next)
        setError(invalid)
        if (!invalid && next.length > 0) {
          setSuccess(true)
          onChange(next.join('+'))
          timeoutRef.current = window.setTimeout(() => {
            setShow(false)
          }, SUCCESS_DELAY_MS)
        } else {
          setSuccess(false)
        }
      }, ERROR_DELAY_MS)
    }

    if (keys.length === 3) return

    e.preventDefault()

    setKeys((prev) => {
      // Check if the pressed key is NOT a modifier key
      const isNonModifier = !modifierKeys.has(e.key)

      if (isNonModifier) {
        // Find existing non-modifier key in the array and replace it
        const existingNonModifierIndex = prev.findIndex(
          (key) => !modifierKeys.has(key)
        )
        if (existingNonModifierIndex !== -1) {
          const next = [...prev]
          next[existingNonModifierIndex] = e.key
          handleValidation(next)
          return next
        }
      }

      // If it's a modifier key or no existing non-modifier found, add as normal
      if (prev.includes(e.key)) return prev

      let next: string[]
      if (modifierKeys.has(e.key)) {
        // Reorder modifier keys to be first in the array
        const modifiers = [
          e.key,
          ...prev.filter((key) => modifierKeys.has(key)),
        ]
        const nonModifiers = prev.filter((key) => !modifierKeys.has(key))
        next = [...modifiers, ...nonModifiers]
      } else {
        next = [...prev, e.key]
      }

      handleValidation(next)
      return next
    })
  }

  function clear() {
    inputRef.current?.focus()
    setKeys([])
    setError(null)
    setSuccess(false)
  }

  function onBlur() {
    if (error) setKeys([])
    setSuccess(false)
    setShow(false)
  }

  return (
    <div className="shortcut-recorder">
      <div className="shortcut-recorder-input-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="Record Shortcut"
          data-has-shortcut={Boolean(value) && keys.length > 0}
          data-pristine={keys.length === 0}
          onFocus={() => setShow(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          maxLength={3}
        />
        <div className="shortcut-recorder-keys">
          {keys.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </div>
        {keys.length > 0 && (
          <button
            className="shortcut-recorder-clear-button"
            type="button"
            onClick={clear}
            aria-label="Clear shortcut"
          >
            <IconCross />
          </button>
        )}
      </div>
      <div
        className="shortcut-recorder-tooltip"
        data-show={show}
        data-error={Boolean(error)}
        onTransitionEnd={() => setError(null)}
      >
        <div className="shortcut-recorder-status">
          {!error && (
            <div
              className="shortcut-recorder-status-icon"
              data-success={success}
            />
          )}
          {error ? error : success ? 'Shortcut set' : 'Recording'}
        </div>
        <BottomArrow />
      </div>
    </div>
  )
}

function BottomArrow() {
  return (
    <svg
      fill="none"
      height="6"
      viewBox="0 0 14 6"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.8284 0H0.17157C0.702003 0 1.21071 0.210714 1.58578 0.585787L5.58578 4.58579C6.36683 5.36684 7.63316 5.36683 8.41421 4.58579L12.4142 0.585786C12.7893 0.210714 13.298 0 13.8284 0Z"
        fill="var(--background)"
      />
    </svg>
  )
}

type KbdProps = {
  children: string
}

function Kbd({ children }: KbdProps) {
  // Map event.key to symbol or label
  function renderKey(key: string) {
    switch (key) {
      case 'Meta':
        // Command symbol (⌘)
        return '⌘'
      case 'Alt':
      case 'Option':
        // Option symbol (⌥)
        return '⌥'
      case 'Control':
      case 'Ctrl':
        // Control abbreviation
        return 'Ctrl'
      case 'Shift':
        // Shift symbol (⇧)
        return '⇧'
      case 'Enter':
        // Enter symbol (⏎)
        return '⏎'
      case 'Escape':
      case 'Esc':
        return 'Esc'
      case ' ':
      case 'Space':
      case 'Spacebar':
        return 'Space'
      case 'ArrowUp':
        return '↑'
      case 'ArrowDown':
        return '↓'
      case 'ArrowLeft':
        return '←'
      case 'ArrowRight':
        return '→'
      case 'Tab':
        return 'Tab'
      case 'Backspace':
        return '⌫'
      case 'Delete':
        return '⌦'
      default:
        // Capitalize single letters, otherwise show as-is
        if (children.length === 1) {
          return children.toUpperCase()
        }
        return children
    }
  }
  const key = renderKey(children)
  const isSymbol = key.length === 1
  return <kbd data-symbol={isSymbol}>{key}</kbd>
}

function IconCross() {
  return (
    <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const SHORTCUT_RECORDER_STYLES = css`
  .shortcut-recorder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;

    input {
      width: 125px;
      background: var(--color-background-100);
      border: 1px dashed var(--color-gray-500);
      border-radius: var(--rounded-lg);
      font-weight: 400;
      font-size: var(--size-14);
      color: var(--color-gray-1000);
      padding: 6px 8px;
      transition: border-color 150ms var(--timing-swift);

      &[data-has-shortcut='true'] {
        border: 1px solid var(--color-gray-400);
      }

      &:hover {
        border-color: var(--color-gray-500);
      }

      &::placeholder {
        color: var(--color-gray-900);
      }

      &[data-pristine='false']::placeholder {
        color: transparent;
      }

      &:focus-visible {
        outline: var(--focus-ring);
        outline-offset: -1px;
      }
    }

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-stack-sans);
      background: var(--color-gray-200);
      min-width: 20px;
      font-weight: 500;
      height: 20px;
      font-size: 14px;
      border-radius: 4px;
      color: var(--color-gray-1000);

      &[data-symbol='false'] {
        padding: 0 4px;
      }
    }

    button {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: var(--color-gray-1000);
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 150ms var(--timing-swift);

      &:hover {
        background: var(--color-gray-300);
      }

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  .shortcut-recorder-input-container {
    display: grid;

    > * {
      grid-area: 1 / 1;
    }
  }

  .shortcut-recorder-keys {
    pointer-events: none;
    user-select: none;
    margin: 6px;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .shortcut-recorder-tooltip {
    --gap: 8px;
    --background: var(--color-gray-1000);
    background: var(--background);
    color: var(--color-background-100);
    font-size: var(--size-14);
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 8px;
    position: absolute;
    bottom: calc(100% + var(--gap));
    text-align: center;
    opacity: 0;
    scale: 0.96;
    user-select: none;
    text-wrap: pretty;
    transition:
      opacity 150ms var(--timing-swift),
      scale 150ms var(--timing-swift);

    &[data-show='true'] {
      opacity: 1;
      scale: 1;
    }

    &[data-error='true'] {
      --background: var(--color-red-800);
      color: white;
      width: 180px;
    }

    svg {
      position: absolute;
      transform: translateX(-50%);
      bottom: -6px;
      left: 50%;
    }

    .shortcut-recorder-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .shortcut-recorder-status-icon {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-red-700);

      &[data-success='true'] {
        background: var(--color-green-700);
      }
    }
  }
`
