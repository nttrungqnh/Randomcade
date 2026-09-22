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
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  const parsed = useMemo(() => parseLines(input), [input])
  const validTeams = parsed.flatMap((line) => line.names ? [line.names] : [])
  const invalidLines = parsed.filter((line) => !line.names)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    textareaRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
      }
      if (event.key !== 'Tab') return
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, input, [tabindex="0"]')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div ref={dialogRef} className="quick-modal" role="dialog" aria-modal="true" aria-labelledby="quick-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p>Nhập danh sách đội</p>
            <h2 id="quick-title">Thêm nhanh</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng thêm nhanh"><X size={20} /></button>
        </header>
        <label htmlFor="quick-input">Mỗi dòng là một đội gồm hai người</label>
        <textarea
          ref={textareaRef}
          id="quick-input"
          value={input}
          aria-invalid={invalidLines.length > 0}
          aria-describedby={invalidLines.length > 0 ? 'quick-hint quick-errors' : 'quick-hint'}
          placeholder={'Trung | Hùng\nNam | Minh\nTuấn | Long'}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className="quick-modal__hint" id="quick-hint">
          <span>Ngăn cách hai tên bằng dấu |, dấu phẩy hoặc tab.</span>
          <strong>{validTeams.length} đội hợp lệ</strong>
        </div>
        {invalidLines.length > 0 && (
          <div className="quick-modal__errors" id="quick-errors" role="alert">
            <strong>Cần sửa {invalidLines.length} dòng: mỗi dòng phải có đủ hai tên.</strong>
            {invalidLines.slice(0, 4).map((line) => (
              <span key={line.lineNumber}>Dòng {line.lineNumber}: {line.raw}</span>
            ))}
          </div>
        )}
        <button
          className="quick-modal__submit"
          type="button"
          disabled={validTeams.length === 0 || invalidLines.length > 0}
          onClick={() => {
            if (validTeams.length === 0 || invalidLines.length > 0) return
            onAdd(validTeams)
            onClose()
          }}
        >
          Thêm {validTeams.length} đội
        </button>
      </div>
    </div>
  )
}
