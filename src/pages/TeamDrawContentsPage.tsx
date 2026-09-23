import { useEffect, useState } from 'react'
import { Clapperboard, Copy, MoreHorizontal, Pencil, Play, Plus, RotateCcw, Trash2, Trophy, Users, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmModal } from '../components/create/ConfirmModal'
import { useTeamDrawContentStore } from '../stores/teamDrawContentStore'
import type { TeamDrawContentStatus } from '../types/models'
import '../team-draw.css'
import '../team-draw-mode.css'

const statusLabel: Record<TeamDrawContentStatus, string> = { draft: 'Chưa hoàn thiện', ready: 'Sẵn sàng', drawing: 'Đang bốc thăm', completed: 'Đã hoàn thành' }

export function TeamDrawContentsPage() {
  const navigate = useNavigate()
  const { contents, hydrated, hydrate, duplicateContent, deleteContent, resetDraw, startDraw } = useTeamDrawContentStore()
  const [removeId, setRemoveId] = useState<string>()
  const [resetId, setResetId] = useState<string>()
  useEffect(() => { void hydrate() }, [hydrate])
  const open = (id: string) => {
    const content = useTeamDrawContentStore.getState().getContent(id)
    if (!content) return
    if (content.status === 'completed') navigate(`/team-draw/${id}/result`)
    else { startDraw(id); navigate(`/team-draw/${id}/play`) }
  }
  if (!hydrated) return <main className="team-draw-page"><p>Đang tải nội dung bốc thăm…</p></main>
  return <main className="team-draw-page">
    <header className="team-draw-header"><Link to="/" className="team-draw-brand">RANDOMCADE</Link><span>NỘI DUNG BỐC THĂM</span></header>
    <section className="team-draw-container">
      <div className="team-draw-title"><div><p>TEAM DRAW</p><h1>Nội dung bốc thăm</h1><span>Chuẩn bị trước các nội dung và bắt đầu khi bạn sẵn sàng.</span></div><Link className="team-draw-primary" to="/team-draw/new"><Plus size={18} /> Tạo nội dung bốc thăm</Link></div>
      <div className="content-list">
        {contents.map((content) => <article className="draw-content-card" key={content.id}>
          <div className="draw-content-card__icon"><Trophy size={23} /></div>
          <div className="draw-content-card__main"><h2>{content.name || 'Chưa đặt tên nội dung'}</h2><p><Users size={15} /> {content.teams.length} đội · {content.groupCount} bảng · {content.teamsPerGroup ?? '—'} đội/bảng</p><div className="draw-content-card__meta"><small>{content.templateId === 'arcade' ? 'Pixel Arcade' : content.templateId}</small><small>{content.drawMode === 'instant' ? <Zap size={13} /> : <Clapperboard size={13} />}{content.drawMode === 'instant' ? 'Bốc tất cả' : 'Bốc từng đội'}</small></div></div>
          <span className={`draw-status draw-status--${content.status}`}>{statusLabel[content.status]}</span>
          <div className="draw-content-card__actions">
            {content.status === 'completed' ? <><button onClick={() => open(content.id)}><Play size={15} /> Xem kết quả</button><button onClick={() => setResetId(content.id)}><RotateCcw size={15} /> Bốc lại</button></> : <><Link to={`/team-draw/${content.id}/edit`}><Pencil size={15} /> Sửa</Link><button disabled={content.status === 'draft'} onClick={() => open(content.id)}><Play size={15} /> Bốc thăm</button></>}
            <button title="Nhân bản" onClick={() => void duplicateContent(content.id)}><Copy size={16} /></button><button className="draw-delete" title="Xóa" onClick={() => setRemoveId(content.id)}><Trash2 size={16} /></button>
          </div>
        </article>)}
        {!contents.length && <div className="draw-content-empty"><MoreHorizontal size={28} /><h2>Chưa có nội dung nào</h2><p>Tạo nội dung đầu tiên để chuẩn bị bốc thăm cho giải.</p><Link className="team-draw-primary" to="/team-draw/new"><Plus size={18} /> Tạo nội dung bốc thăm</Link></div>}
      </div>
    </section>
    {removeId && <ConfirmModal title="Xóa nội dung này?" description="Danh sách đội và toàn bộ kết quả của nội dung này sẽ bị xóa." confirmLabel="Xóa nội dung" danger onCancel={() => setRemoveId(undefined)} onConfirm={() => { void deleteContent(removeId); setRemoveId(undefined) }} />}
    {resetId && <ConfirmModal title="Bốc lại nội dung này?" description="Bốc lại sẽ xóa toàn bộ kết quả hiện tại của nội dung này. Danh sách đội và cấu hình được giữ nguyên." confirmLabel="Bốc lại" onCancel={() => setResetId(undefined)} onConfirm={() => { resetDraw(resetId); setResetId(undefined) }} />}
  </main>
}
