import { useRef, useState, type DragEvent } from 'react'
import { Camera, LoaderCircle, Trash2 } from 'lucide-react'
import { useParticipantImage } from '../../hooks/useParticipantImage'
import { processParticipantImage } from '../../services/imageProcessor'
import { deleteParticipantImage, saveParticipantImage } from '../../services/localDatabase'
import type { Participant } from '../../types/models'

interface PhotoPickerProps {
  participant: Participant
  onImageChange: (imageId?: string) => void
}

const photoErrorMessages: Record<string, string> = {
  'Choose a JPEG, PNG, or WebP image.': 'Vui lòng chọn ảnh JPEG, PNG hoặc WebP.',
  'This image could not be opened.': 'Không thể mở ảnh này. Vui lòng chọn ảnh khác.',
  'Image processing is unavailable in this browser.': 'Trình duyệt này không hỗ trợ xử lý ảnh.',
  'The processed image could not be saved.': 'Không thể lưu ảnh. Vui lòng thử lại.',
}

export function PhotoPicker({ participant, onImageChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const { imageUrl, loading } = useParticipantImage(
    participant.imageId ? participant.id : undefined,
    revision,
  )

  const handleFile = async (file?: File) => {
    if (!file) return
    setError('')
    setProcessing(true)
    try {
      const blob = await processParticipantImage(file)
      const imageId = await saveParticipantImage(participant.id, blob)
      onImageChange(imageId)
      setRevision((value) => value + 1)
    } catch (reason) {
      setError((reason instanceof Error && photoErrorMessages[reason.message]) || 'Không thể xử lý ảnh. Vui lòng thử lại.')
    } finally {
      setProcessing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDragging(false)
    void handleFile(event.dataTransfer.files[0])
  }

  const removePhoto = async () => {
    await deleteParticipantImage(participant.id)
    onImageChange(undefined)
    setRevision((value) => value + 1)
  }

  return (
    <div className="photo-field">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label={`Chọn ảnh cho ${participant.name || 'người chơi'}`}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button
        className="photo-picker"
        type="button"
        data-dragging={dragging}
        data-has-image={Boolean(imageUrl)}
        aria-label={`${imageUrl ? 'Đổi' : 'Thêm'} ảnh cho ${participant.name || 'người chơi'}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        {imageUrl ? <img src={imageUrl} alt="" /> : (
          <span>
            {processing || loading ? <LoaderCircle className="spin" size={18} /> : <Camera size={18} />}
            <small>{processing ? 'Đang xử lý' : 'Thêm ảnh'}</small>
          </span>
        )}
        {imageUrl && <span className="photo-picker__change">Đổi ảnh</span>}
      </button>
      {participant.imageId && (
        <button className="photo-remove" type="button" onClick={() => void removePhoto()} aria-label={`Xóa ảnh của ${participant.name || 'người chơi'}`}>
          <Trash2 size={13} /> Xóa ảnh
        </button>
      )}
      {error && <small className="field-error" role="alert">{error}</small>}
    </div>
  )
}
