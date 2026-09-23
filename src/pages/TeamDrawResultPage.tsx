import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowLeft, Check, FileSpreadsheet, ImageDown, Layers3, Trophy, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTeamDrawContentStore } from '../stores/teamDrawContentStore'
import { downloadTeamDrawExcel, downloadTeamDrawImage } from '../services/teamDrawExport'
import '../team-draw-result.css'

export function TeamDrawResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { contents, hydrated, hydrate } = useTeamDrawContentStore()
  const content = contents.find((item) => item.id === id)
  const [exportingImage, setExportingImage] = useState(false)
  const [exportError, setExportError] = useState('')
  useEffect(() => { void hydrate() }, [hydrate])
  useEffect(() => {
    if (hydrated && content && content.status !== 'completed') navigate(`/team-draw/${content.id}/play`, { replace: true })
  }, [content, hydrated, navigate])
  const teamById = useMemo(() => new Map(content?.teams.map((team) => [team.id, team]) ?? []), [content?.teams])

  if (!hydrated) return <main className="team-draw-result-page"><p>Đang tải kết quả…</p></main>
  if (!content) return <main className="team-draw-result-page"><p>Không tìm thấy nội dung bốc thăm.</p><Link to="/team-draw">Về danh sách</Link></main>
  if (content.status !== 'completed') return <main className="team-draw-result-page"><p>Đang mở màn hình bốc thăm…</p></main>

  const exportImage = async () => {
    setExportingImage(true); setExportError('')
    try { await downloadTeamDrawImage(content.name, content.groups, content.teams) }
    catch { setExportError('Không tạo được ảnh trên trình duyệt này. Vui lòng thử lại.') }
    finally { setExportingImage(false) }
  }

  return <main className="team-draw-result-page">
    <div className="team-draw-result-glow team-draw-result-glow--one" /><div className="team-draw-result-glow team-draw-result-glow--two" />
    <header className="team-draw-result-header"><Link to="/team-draw" className="team-draw-result-brand"><span className="team-draw-result-brand-mark">R</span><span>RANDOMCADE<small>TOURNAMENT TOOLS</small></span></Link><span className="team-draw-result-top-label"><i /> DRAW COMPLETE</span></header>
    <section className="team-draw-result-container">
      <Link className="team-draw-result-back" to="/team-draw"><ArrowLeft size={16} /> Tất cả nội dung</Link>
      <div className="team-draw-result-hero">
        <div className="team-draw-result-hero-copy"><div className="team-draw-result-kicker"><Trophy size={15} /> KẾT QUẢ BỐC THĂM</div><h1>{content.name}</h1><p>Tất cả đội đã được phân vào các bảng. Chúc giải đấu diễn ra thật bùng nổ!</p>
          <div className="team-draw-result-stats"><div><Users /><strong>{content.teams.length}</strong><span>ĐỘI</span></div><div><Layers3 /><strong>{content.groups.length}</strong><span>BẢNG</span></div><div><Check /><strong>100%</strong><span>HOÀN TẤT</span></div></div>
        </div>
        <div className="team-draw-result-export"><span className="team-draw-export-caption">LƯU VÀ CHIA SẺ KẾT QUẢ</span><button className="team-draw-export-image" type="button" onClick={() => void exportImage()} disabled={exportingImage}><ImageDown size={19} /><span><strong>{exportingImage ? 'Đang tạo ảnh…' : 'Tải ảnh kết quả'}</strong><small>PNG · Dễ dàng chia sẻ</small></span><ArrowLeft className="team-draw-export-arrow" size={17} /></button><button className="team-draw-export-excel" type="button" onClick={() => downloadTeamDrawExcel(content.name, content.groups, content.teams)}><FileSpreadsheet size={18} /><span><strong>Tải file Excel</strong><small>.xlsx · Tổng quan và từng bảng</small></span></button>{exportError && <p className="team-draw-export-error" role="alert">{exportError}</p>}</div>
      </div>
      <div className="team-draw-result-section-title"><div><span>CHIA BẢNG</span><h2>Danh sách các bảng</h2></div><small>{content.groups.length} bảng <i /> {content.teams.length} đội</small></div>
      <div className="team-draw-result-grid">
        {content.groups.map((group, groupIndex) => <article className="team-draw-result-group" key={group.id} style={{ '--group-accent': ['#8574ff', '#28b9a4', '#f39b50', '#ed6b98', '#5297ec'][groupIndex % 5], animationDelay: `${groupIndex * 35}ms` } as CSSProperties}>
          <header><div className="team-draw-result-group-emblem"><span>{String(groupIndex + 1).padStart(2, '0')}</span></div><div className="team-draw-result-group-name"><span>GROUP {String(groupIndex + 1).padStart(2, '0')}</span><h3>Bảng {group.name}</h3></div><small>{String(group.teamIds.length).padStart(2, '0')} ĐỘI</small></header>
          <ol>{group.teamIds.map((teamId, index) => {
            const team = teamById.get(teamId)
            const players = team?.participants.map((person) => person.name.trim()).filter(Boolean).join(' × ') || team?.name || 'Đội'
            return <li key={teamId}><span className="team-draw-result-number">{String(index + 1).padStart(2, '0')}</span><span className="team-draw-result-team">{players}</span><Check className="team-draw-result-check" size={16} /></li>
          })}</ol>
        </article>)}
      </div>
      <footer className="team-draw-result-footer"><span><Trophy size={16} /> Bốc thăm minh bạch · Kết quả đã được lưu</span><Link to="/team-draw">Quản lý nội dung <ArrowLeft size={15} /></Link></footer>
    </section>
  </main>
}
