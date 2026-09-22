import { ArrowRight, CircleHelp, Dice5, Gamepad2, Gift, Hash, Layers, Sparkles, Users, CircleDot } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../home.css'

const upcoming = [
  { name: 'Pinball Picker', description: 'Thả bóng chọn ngẫu nhiên', icon: Gamepad2 },
  { name: 'Balloon Loop', description: 'Bóng bay may mắn', icon: Gift },
  { name: 'Gacha Machine', description: 'Mở quà bất ngờ', icon: Sparkles },
  { name: 'Random Number', description: 'Chọn một con số', icon: Hash },
  { name: 'Card Picker', description: 'Rút thẻ ngẫu nhiên', icon: Layers },
  { name: 'Surprise Me', description: 'Để bất ngờ lên tiếng', icon: CircleHelp },
]

export function HomePage() {
  return <div className="simple-home">
    <header className="landing-header"><div className="landing-container landing-header-inner">
      <Link to="/" className="landing-brand"><span><Dice5 size={23} /></span>Randomcade</Link>
      <nav aria-label="Điều hướng chính"><a href="#games">Trò chơi</a><a href="#guide">Cách sử dụng</a><span>Tiếng Việt</span></nav>
    </div></header>
    <main className="landing-container">
      <section className="landing-intro"><span className="landing-eyebrow"><Sparkles size={14} /> Miễn phí · Không cần đăng ký</span>
        <h1>Một chút ngẫu nhiên.<br /><span>Thêm nhiều niềm vui.</span></h1>
        <p>Chọn trò chơi, thêm danh sách và bắt đầu ngay.</p>
      </section>
      <section id="games" aria-labelledby="games-title">
        <div className="landing-section-heading"><h2 id="games-title">Bạn muốn chơi gì hôm nay?</h2><span>Cấu hình riêng cho từng trò chơi</span></div>
        <div className="landing-games">
          <Link className="landing-game landing-game--wheel" to="/create?theme=wheel&screen=lucky-wheel">
            <div className="landing-preview landing-preview--wheel" aria-hidden="true"><span className="preview-caption">Mỗi vòng quay, một bất ngờ</span><div className="preview-wheel"><span><Sparkles size={23} /></span></div><span className="preview-chip">Ai sẽ là người may mắn?</span></div>
            <div className="landing-game-body">
            <span className="landing-game-icon"><CircleDot size={29} /></span>
            <div><h3>Lucky Wheel</h3><span className="landing-game-subtitle">Vòng quay may mắn</span><p>Chọn người, chọn quà hay quyết định một điều bất kỳ.</p></div>
            <span className="landing-game-action">Tạo vòng quay <ArrowRight size={17} /></span>
            </div>
          </Link>
          <Link className="landing-game landing-game--teams" to="/create?theme=arcade&screen=team-draw">
            <div className="landing-preview landing-preview--teams" aria-hidden="true"><span className="preview-caption">Sẵn sàng cho những trận đấu hay</span><div className="preview-groups">{['A','B','C'].map((group,index)=><div key={group}><b>Bảng {group}</b>{[0,1].map(row=><span key={row}><i>{['AN','MH','TN','HL','BN','KH'][index*2+row]}</i><i>{['LB','QA','PT','DK','VL','NT'][index*2+row]}</i><em /></span>)}</div>)}</div><span className="preview-chip">Chia bảng ngẫu nhiên, thật dễ dàng</span></div>
            <div className="landing-game-body">
            <span className="landing-game-icon"><Users size={29} /></span>
            <div><h3>Team Draw</h3><span className="landing-game-subtitle">Bốc thăm chia bảng</span><p>Thêm các cặp thi đấu và chia bảng cho giải của bạn.</p></div>
            <span className="landing-game-action">Thiết lập giải <ArrowRight size={17} /></span>
            </div>
          </Link>
        </div>
        <div className="landing-next-heading"><h3>Thêm nhiều cách để chơi</h3><span>Đang được phát triển</span></div>
        <div className="landing-upcoming">{upcoming.map(({name,description,icon:Icon}) => <article key={name}>
          <Icon size={22} /><div><h3>{name}</h3><p>{description}</p></div><span>Sắp có</span>
        </article>)}</div>
      </section>
      <section id="guide" className="landing-guide" aria-labelledby="guide-title"><h2 id="guide-title">Bắt đầu thật đơn giản</h2>
        <div>{[
          ['Chọn trò chơi', 'Vòng quay may mắn hoặc bốc thăm chia bảng.'],
          ['Thêm danh sách', 'Nhập lựa chọn hoặc tên các đội tham gia.'],
          ['Bắt đầu chơi', 'Cấu hình tự lưu trên thiết bị để dùng lại.'],
        ].map(([title,description],index) => <article key={title}><span>{index+1}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
      </section>
    </main>
    <footer className="landing-container landing-footer"><span>Randomcade · Ngẫu nhiên, thật vui.</span><span>Không tài khoản. Không phiền phức.</span></footer>
  </div>
}
