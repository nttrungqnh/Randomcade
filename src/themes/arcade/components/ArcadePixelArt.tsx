type PixelArtProps = { className?: string }

/** Small decorative sprites keep their hard, square pixels at every size. */
export function PixelBall({ className }: PixelArtProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" d="M11 1h10v2h5v3h3v5h2v10h-2v5h-3v3h-5v2H11v-2H6v-3H3v-5H1V11h2V6h3V3h5z" />
      <path fill="#120c2e" d="M12 5h4v2h2v4h-2v2h-4v-2h-2V7h2zm10 6h4v2h2v4h-2v2h-4v-2h-2v-4h2zM5 16h4v2h2v4H9v2H5v-2H3v-4h2zm10 6h4v2h2v4h-2v2h-4v-2h-2v-4h2z" />
      <path fill="#fff" opacity=".35" d="M11 3h8v2h-8zM6 6h4v2H6zM3 10h2v5H3z" />
    </svg>
  )
}

export function PixelCrown({ className }: PixelArtProps) {
  return (
    <svg className={className} viewBox="0 0 40 32" fill="none" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" d="M18 1h4v4h3v4h3v4h3V9h3V5h5v8h-3v8h-3v6H7v-6H4v-8H1V5h5v4h3v4h3V9h3V5h3zM7 29h26v3H7z" />
      <path fill="#110c2b" d="M18 12h4v4h-4zM10 20h20v3H10z" />
    </svg>
  )
}

export function PixelPeople({ className }: PixelArtProps) {
  return (
    <svg className={className} viewBox="0 0 44 34" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M9 2h7v2h3v9h-3v3H9v-3H6V4h3zm-3 16h13v3h3v5h2v8H1v-8h2v-5h3z" />
      <path opacity=".8" d="M29 3h7v2h3v8h-3v3h-7v-3h-3V5h3zm-2 15h12v3h3v5h2v8H26v-9h-2v-4h3z" />
    </svg>
  )
}

const towers = [
  { x: 36, y: 82, w: 20, h: 28, tone: '#321582', light: '#e638e6', cols: 2 },
  { x: 62, y: 65, w: 18, h: 45, tone: '#261367', light: '#8239f0', cols: 2 },
  { x: 83, y: 76, w: 25, h: 34, tone: '#30147e', light: '#ed38d0', cols: 3 },
  { x: 113, y: 58, w: 19, h: 52, tone: '#281369', light: '#9144f3', cols: 2 },
  { x: 135, y: 81, w: 30, h: 29, tone: '#291158', light: '#d922c2', cols: 4 },
  { x: 169, y: 72, w: 20, h: 38, tone: '#381778', light: '#5648f4', cols: 2 },
  { x: 193, y: 87, w: 23, h: 23, tone: '#351063', light: '#d032cf', cols: 3 },
  { x: 222, y: 56, w: 20, h: 54, tone: '#351674', light: '#a02fea', cols: 2 },
  { x: 246, y: 39, w: 22, h: 71, tone: '#2c1379', light: '#663eff', cols: 3 },
  { x: 272, y: 23, w: 20, h: 87, tone: '#321b75', light: '#b73cff', cols: 2 },
  { x: 298, y: 51, w: 29, h: 59, tone: '#241774', light: '#5d47fa', cols: 4 },
  { x: 332, y: 33, w: 24, h: 77, tone: '#351571', light: '#8141f8', cols: 3 },
  { x: 360, y: 53, w: 18, h: 57, tone: '#451879', light: '#ed4198', cols: 2 },
  { x: 382, y: 71, w: 30, h: 39, tone: '#251667', light: '#4f51f7', cols: 4 },
  { x: 416, y: 86, w: 22, h: 24, tone: '#31155e', light: '#d234d2', cols: 2 },
]

function Palm({ x, y, scale = 1, color = '#9627dc' }: { x: number; y: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={color}>
      <path d="M27 22h4v12h-2v14h-2v17h-2v15h-5V63h2V47h2V33h3z" />
      <path d="M27 22h-5v-4h-7v-3H7v-3H1V9h12v3h8v4h6zm3-4v-5h4V9h5V6h9v3h-8v4h-5v5zm-1 3h6v-3h10v2h7v3h6v5h-4v-3h-8v-2H35v3h-6zm-6 2h-8v3H9v4H5v8H2V26h4v-4h7v-3h10zm7 3h7v5h5v6h3v11h-3v-8h-4v-6h-4v-4h-4zm-5-3h-5v8h-4v7h-2v10h3v-9h4v-7h5z" />
      <path fill="#e045e9" opacity=".7" d="M7 12h8v2H7zm13 7h5v2h-5zm14-9h5v2h-5zm5 11h8v2h-8zm-16 32h2v8h-2z" />
    </g>
  )
}

/** A transparent 600 × 112 skyline, hand-built from a tiny pixel grid. */
export function PixelCity({ className }: PixelArtProps) {
  return (
    <svg className={className} viewBox="0 0 600 112" fill="none" shapeRendering="crispEdges" aria-hidden="true">
      <g opacity=".9">
        <path fill="#502095" d="M0 110v-3h13v-4h10v-4h17v-5h25v-6h20v5h17v-8h17v11h20v-4h17v8h19v-12h24v6h17v-8h18v10h22v-7h17v10h20v-5h30v8h19v-11h19v8h23v-5h22v9h24v-10h27v8h15v-4h22v10h20v-8h25v4h33v-7h26v8h19v-6h26v8h19v6z" />
        <path fill="#b632f5" opacity=".25" d="M42 108h383v4H42z" />
      </g>
      {/* The striped setting sun is deliberately made of square pixels. */}
      <g>
        <path fill="#ffe29a" d="M491 16h28v3h7v4h-42v-4h7z" />
        <path fill="#ffba83" d="M479 26h52v7h-52z" />
        <path fill="#ff887c" d="M475 36h60v8h-60z" />
        <path fill="#fc5c9e" d="M473 47h64v8h-64z" />
        <path fill="#ed39c4" d="M476 59h58v7h-58z" />
        <path fill="#c927e2" d="M481 71h48v6h-48z" />
        <path fill="#9520d9" d="M490 82h31v5h-31z" />
      </g>
      {/* Roofs, broadcast masts, and scattered beacons. */}
      <g fill="#722deb">
        <path d="M68 55h2v10h-2zm51-7h2v10h-2zm109-8h2v16h-2zm26-9h6v8h-6zm25-22h3v14h-3zm58 15h14v9h-14zm30 15h3v14h-3z" />
      </g>
      <g fill="#f25cbe">
        <path d="M67 54h4v3h-4zm51-7h4v3h-4zm109-8h4v3h-4zm51-32h5v3h-5zm88 30h4v3h-4z" />
      </g>
      {towers.map((tower, index) => (
        <g key={tower.x}>
          <path fill="#0d0b34" d={`M${tower.x - 2} ${tower.y - 2}h${tower.w + 4}v${tower.h + 2}h-${tower.w + 4}z`} />
          <rect x={tower.x} y={tower.y} width={tower.w} height={tower.h} fill={tower.tone} />
          <path stroke={tower.light} strokeWidth="1" opacity=".8" d={`M${tower.x} 110V${tower.y}h${tower.w}`} />
          <rect x={tower.x + tower.w - 3} y={tower.y + 2} width="3" height={tower.h - 2} fill="#110c39" opacity=".6" />
          {Array.from({ length: Math.floor((tower.h - 9) / 8) }, (_, row) =>
            Array.from({ length: tower.cols }, (_, col) => {
              if ((row * 7 + col * 3 + index) % 5 === 0) return null
              const bright = (row + col + index) % 6 === 0
              return <rect key={`${row}-${col}`} x={tower.x + 4 + col * 5} y={tower.y + 5 + row * 8} width="2" height={bright ? 4 : 2} fill={bright ? '#fa70d0' : tower.light} opacity={bright ? 1 : .65} />
            }),
          )}
          {index % 3 === 0 && <rect x={tower.x + 4} y={tower.y + tower.h - 12} width="6" height="2" fill="#ff47d9" />}
        </g>
      ))}
      {/* Layered silhouettes give the town depth without a solid backdrop. */}
      <path fill="#100b36" d="M0 112v-5h28v-5h11v6h27v-4h21v6h26v-8h17v8h35v-4h12v6h34v-7h21v7h35v-4h19v4h29v-9h13v9h42v-6h22v6h41v-8h22v8h44v-6h36v6h21v-8h32v8h35v-4h26v4z" />
      <Palm x={423} y={46} scale={.8} />
      <Palm x={545} y={47} scale={.8} color="#9b22d9" />
      <Palm x={457} y={69} scale={.48} color="#401663" />
      <g fill="#e43dec">
        <path d="M18 82h2v7h-2zm-3 3h8v2h-8zm141-48h2v7h-2zm-3 3h8v2h-8zm286-20h2v9h-2zm-3 3h8v2h-8zm132-1h2v8h-2zm-3 3h8v2h-8z" />
        <path fill="#744fff" d="M103 43h2v2h-2zm96 24h2v2h-2zm118-54h2v2h-2zm93 29h2v2h-2zm124-40h2v2h-2zm46 52h2v2h-2z" />
      </g>
      <path fill="#bc31ed" d="M0 110h600v2H0z" opacity=".7" />
    </svg>
  )
}
