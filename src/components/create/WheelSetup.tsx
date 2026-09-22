import { ArrowRight, List, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MAX_WHEEL_OPTIONS, parseWheelOptions, useWheelConfigStore } from '../../stores/wheelConfigStore'

export function WheelSetup() {
  const navigate = useNavigate()
  const { optionsText, soundOn, selectedSound, setOptionsText, setSoundOn, setSelectedSound } = useWheelConfigStore()
  const options = parseWheelOptions(optionsText)
  const tooMany = options.length > MAX_WHEEL_OPTIONS
  const canStart = options.length >= 2 && !tooMany

  return (
    <div className="config-layout">
      <section className="config-panel" aria-labelledby="wheel-options-heading">
        <div className="config-panel-heading">
          <div><h2 id="wheel-options-heading"><List size={19} /> Danh sách lựa chọn</h2><p>Mỗi dòng là một tên hoặc một lựa chọn trên vòng quay.</p></div>
          <span>{options.length} lựa chọn</span>
        </div>
        <label className="config-field" htmlFor="wheel-options">
          <span>Nhập danh sách</span>
          <textarea id="wheel-options" rows={12} value={optionsText} onChange={(event) => setOptionsText(event.target.value)} placeholder={'Ví dụ:\nMinh\nHà\nTuấn\nLinh'} aria-describedby="wheel-options-help" aria-invalid={tooMany} />
        </label>
        <p className="config-note" id="wheel-options-help" role={tooMany ? 'alert' : undefined}>
          {tooMany ? `Có ${options.length} lựa chọn. Vòng quay hỗ trợ tối đa ${MAX_WHEEL_OPTIONS}; hãy rút gọn danh sách để bắt đầu.` : `Nhập từ 2 đến ${MAX_WHEEL_OPTIONS} lựa chọn. Các dòng trống sẽ được bỏ qua.`}
        </p>
        <button className="config-button" type="button" onClick={() => setOptionsText(`${optionsText}${optionsText && !optionsText.endsWith('\n') ? '\n' : ''}Minh\nHà\nTuấn\nLinh`)} disabled={options.length > MAX_WHEEL_OPTIONS - 4}>Thêm danh sách mẫu</button>
      </section>

      <aside className="config-sidebar">
        <section className="config-panel" aria-labelledby="wheel-sound-heading">
          <div className="config-panel-heading"><div><h2 id="wheel-sound-heading"><Volume2 size={19} /> Âm thanh</h2><p>Thêm chút hào hứng cho mỗi vòng quay.</p></div></div>
          <label className="config-field"><span><input type="checkbox" checked={soundOn} onChange={(event) => setSoundOn(event.target.checked)} /> Bật âm thanh khi quay</span></label>
          <label className="config-field" htmlFor="wheel-sound"><span>Nhạc vòng quay</span><select id="wheel-sound" value={selectedSound} disabled={!soundOn} onChange={(event) => setSelectedSound(event.target.value as 'retro' | 'lottery')}><option value="retro">Nhạc trò chơi</option><option value="lottery">Nhạc xổ số</option></select></label>
        </section>
        <section className="config-panel config-summary">
          <h2>Sẵn sàng quay</h2>
          <p>{options.length} lựa chọn trong danh sách.</p>
          <p className="config-note">Danh sách và âm thanh được tự động lưu riêng cho Lucky Wheel.</p>
          <button className="config-button config-button--primary config-start" type="button" disabled={!canStart} onClick={() => { if (canStart) navigate('/show/wheel') }}>Bắt đầu vòng quay <ArrowRight size={17} /></button>
          {!canStart && <p className="config-note">{tooMany ? 'Rút gọn danh sách xuống tối đa 32 lựa chọn.' : 'Thêm ít nhất 2 lựa chọn để bắt đầu.'}</p>}
        </section>
      </aside>
    </div>
  )
}
