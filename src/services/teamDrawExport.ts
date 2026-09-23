import type { Group, Team } from '../types/models'

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!)
const safeName = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'ket-qua-boc-tham'

export async function downloadTeamDrawImage(name: string, groups: Group[], teams: Team[]) {
  const columns = groups.length <= 2 ? 2 : groups.length <= 6 ? 3 : 4
  const cardWidth = 350
  const gap = 24
  const margin = 44
  const titleHeight = 118
  const cardHeight = 88 + Math.max(1, ...groups.map((group) => group.teamIds.length)) * 68
  const rows = Math.ceil(groups.length / columns)
  const width = margin * 2 + columns * cardWidth + (columns - 1) * gap
  const height = margin * 2 + titleHeight + rows * cardHeight + (rows - 1) * gap
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const cards = groups.map((group, index) => {
    const x = margin + (index % columns) * (cardWidth + gap)
    const y = margin + titleHeight + Math.floor(index / columns) * (cardHeight + gap)
    const teamRows = group.teamIds.map((teamId, teamIndex) => {
      const team = teamById.get(teamId)
      const label = team?.participants.map((person) => person.name.trim()).filter(Boolean).join(' × ') || team?.name || 'Đội'
      const rowY = y + 72 + teamIndex * 68
      return `<rect x="${x + 18}" y="${rowY - 29}" width="${cardWidth - 36}" height="54" rx="12" fill="#f5f7fc"/><text x="${x + 34}" y="${rowY + 5}" font-size="14" font-weight="700" fill="#596780">${String(teamIndex + 1).padStart(2, '0')}</text><text x="${x + 80}" y="${rowY + 5}" font-size="18" font-weight="700" fill="#202a43">${escapeXml(label)}</text>`
    }).join('')
    return `<g><rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="20" fill="white" stroke="#e3e8f1"/><path d="M${x + 20} ${y}h${cardWidth - 40}a20 20 0 0 1 20 20v42h-${cardWidth}V20a20 20 0 0 1 20-20" fill="#eef1ff"/><text x="${x + 24}" y="${y + 43}" font-size="20" font-weight="800" fill="#4758cb">BẢNG ${escapeXml(group.name)}</text><text x="${x + cardWidth - 24}" y="${y + 43}" text-anchor="end" font-size="13" fill="#737f94">${group.teamIds.length} đội</text>${teamRows}</g>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f7f8fb"/><text x="${margin}" y="${margin + 39}" font-family="Arial,sans-serif" font-size="32" font-weight="800" fill="#202a43">${escapeXml(name)}</text><text x="${margin}" y="${margin + 76}" font-family="Arial,sans-serif" font-size="16" fill="#6d7890">KẾT QUẢ BỐC THĂM · ${teams.length} ĐỘI · ${groups.length} BẢNG</text><g font-family="Arial,sans-serif">${cards}</g></svg>`
  const image = new Image()
  image.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Không thể tạo ảnh kết quả.')
    context.scale(2, 2)
    context.drawImage(image, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Không thể xuất ảnh PNG.')), 'image/png'))
    saveBlob(blob, `${safeName(name)}-ket-qua.png`)
  } finally {
    URL.revokeObjectURL(image.src)
  }
}

const encoder = new TextEncoder()
const xmlCell = (text: string) => `<c t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`
const sheetXml = (rows: string[][]) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell) => xmlCell(cell)).join('')}</row>`).join('')}</sheetData></worksheet>`

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function createZip(files: Array<{ path: string; contents: string }>) {
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0
  const write16 = (view: DataView, position: number, value: number) => view.setUint16(position, value, true)
  const write32 = (view: DataView, position: number, value: number) => view.setUint32(position, value, true)
  for (const file of files) {
    const path = encoder.encode(file.path)
    const data = encoder.encode(file.contents)
    const crc = crc32(data)
    const local = new Uint8Array(30 + path.length + data.length)
    const localView = new DataView(local.buffer)
    write32(localView, 0, 0x04034b50); write16(localView, 4, 20); write16(localView, 6, 0x800); write16(localView, 8, 0)
    write32(localView, 14, crc); write32(localView, 18, data.length); write32(localView, 22, data.length); write16(localView, 26, path.length)
    local.set(path, 30); local.set(data, 30 + path.length)
    localParts.push(local)
    const central = new Uint8Array(46 + path.length)
    const centralView = new DataView(central.buffer)
    write32(centralView, 0, 0x02014b50); write16(centralView, 4, 20); write16(centralView, 6, 20); write16(centralView, 8, 0x800); write16(centralView, 10, 0)
    write32(centralView, 16, crc); write32(centralView, 20, data.length); write32(centralView, 24, data.length); write16(centralView, 28, path.length); write32(centralView, 42, offset)
    central.set(path, 46); centralParts.push(central); offset += local.length
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  write32(endView, 0, 0x06054b50); write16(endView, 8, files.length); write16(endView, 10, files.length); write32(endView, 12, centralSize); write32(endView, 16, offset)
  const all = [...localParts, ...centralParts, end]
  const size = all.reduce((sum, part) => sum + part.length, 0)
  const archive = new Uint8Array(size)
  let cursor = 0
  for (const part of all) { archive.set(part, cursor); cursor += part.length }
  return archive
}

export function downloadTeamDrawExcel(name: string, groups: Group[], teams: Team[]) {
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const worksheets = [{ name: 'Tổng quan', rows: [['Nội dung bốc thăm', name], ['Số đội', String(teams.length)], ['Số bảng', String(groups.length)], [], ['Bảng', 'Số đội', 'Danh sách đội'], ...groups.map((group) => [group.name, String(group.teamIds.length), group.teamIds.map((id) => teamById.get(id)?.participants.map((person) => person.name.trim()).filter(Boolean).join(' × ') || teamById.get(id)?.name || 'Đội').join(' | ')])] }, ...groups.map((group) => ({ name: `Bảng ${group.name}`.slice(0, 31), rows: [['STT', 'Tên đội', 'Vận động viên'], ...group.teamIds.map((id, index) => { const team = teamById.get(id); return [String(index + 1), team?.name?.trim() || team?.participants.map((person) => person.name.trim()).filter(Boolean).join(' × ') || 'Đội', team?.participants.map((person) => person.name.trim()).filter(Boolean).join(' × ') || ''] })] }))]
  const relations = worksheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('')
  const contentOverrides = worksheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
  const files = [
    { path: '[Content_Types].xml', contents: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${contentOverrides}</Types>` },
    { path: '_rels/.rels', contents: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { path: 'xl/workbook.xml', contents: `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${worksheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('')}</sheets></workbook>` },
    { path: 'xl/_rels/workbook.xml.rels', contents: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relations}</Relationships>` },
    ...worksheets.map((sheet, index) => ({ path: `xl/worksheets/sheet${index + 1}.xml`, contents: sheetXml(sheet.rows) })),
  ]
  saveBlob(new Blob([createZip(files)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${safeName(name)}-chia-bang.xlsx`)
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = filename; anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
