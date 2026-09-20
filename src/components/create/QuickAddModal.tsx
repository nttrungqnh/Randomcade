import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface ParsedLine {
  lineNumber: number
  raw: string
  names?: [string, string]
}

interface QuickAddModalProps {
  onClose: () => void
  onAdd: (teams: Array<[string, string]>) => void
}

const parseLines = (input: string): ParsedLine[] => input
  .split(/\r?\n/)
  .map((raw, index) => ({ raw, lineNumber: index + 1 }))
  .filter(({ raw }) => raw.trim().length > 0)
  .map(({ raw, lineNumber }) => {
    const values = raw.split(/\t|\||,/).map((value) => value.trim())
    return {
      raw,
      lineNumber,
      names: values.length === 2 && values.every(Boolean)
        ? [values[0], values[1]] as [string, string]
        : undefined,
    }
  })

export function QuickAddModal({ onClose, onAdd }: QuickAddModalProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const parsed = useMemo(() => parseLines(input), [input])
  const validTeams = parsed.flatMap((line) => line.names ? [line.names] : [])
  const invalidLines = parsed.filter((line) => !line.names)

  useEffect(() => {
    textareaRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="quick-modal" role="dialog" aria-modal="true" aria-labelledby="quick-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p>Paste your lineup</p>
            <h2 id="quick-title">Quick add</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close quick add"><X size={20} /></button>
        </header>
        <label htmlFor="quick-input">One team per line</label>
        <textarea
          ref={textareaRef}
          id="quick-input"
          value={input}
          placeholder={'Trung | Hùng\nNam | Minh\nTuấn | Long'}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className="quick-modal__hint">
          <span>Separators: | comma or tab</span>
          <strong>{validTeams.length} team{validTeams.length === 1 ? '' : 's'} detected</strong>
        </div>
        {invalidLines.length > 0 && (
          <div className="quick-modal__errors" role="alert">
            <strong>Check {invalidLines.length} line{invalidLines.length === 1 ? '' : 's'}:</strong>
            {invalidLines.slice(0, 4).map((line) => (
              <span key={line.lineNumber}>Line {line.lineNumber}: {line.raw}</span>
            ))}
          </div>
        )}
        <button
          className="quick-modal__submit"
          type="button"
          disabled={validTeams.length === 0}
          onClick={() => { onAdd(validTeams); onClose() }}
        >
          Add {validTeams.length} team{validTeams.length === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  )
}
