const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const TARGET_RATIO = 4 / 5
const MAX_WIDTH = 600
const WEBP_QUALITY = 0.82

export class ParticipantImageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParticipantImageError'
  }
}

export async function processParticipantImage(file: File): Promise<Blob> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new ParticipantImageError('Choose a JPEG, PNG, or WebP image.')
  }

  let bitmap: ImageBitmap

  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new ParticipantImageError('This image could not be opened.')
  }

  try {
    const sourceRatio = bitmap.width / bitmap.height
    const cropWidth = sourceRatio > TARGET_RATIO
      ? bitmap.height * TARGET_RATIO
      : bitmap.width
    const cropHeight = sourceRatio > TARGET_RATIO
      ? bitmap.height
      : bitmap.width / TARGET_RATIO
    const sourceX = (bitmap.width - cropWidth) / 2
    const sourceY = (bitmap.height - cropHeight) / 2
    const outputWidth = Math.max(1, Math.min(MAX_WIDTH, Math.round(cropWidth)))
    const outputHeight = Math.max(1, Math.round(outputWidth / TARGET_RATIO))
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight

    const context = canvas.getContext('2d')
    if (!context) {
      throw new ParticipantImageError('Image processing is unavailable in this browser.')
    }

    context.drawImage(
      bitmap,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    )

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
    })

    if (!blob) {
      throw new ParticipantImageError('The processed image could not be saved.')
    }

    return blob
  } finally {
    bitmap.close()
  }
}
