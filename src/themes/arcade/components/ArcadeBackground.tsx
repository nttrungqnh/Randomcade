import type { CSSProperties } from 'react'
import bgShowUrl from '../../../assets/images/bg_show.png'

export function ArcadeBackground() {
  return <div className="arcade-background" style={{ '--arcade-bg-image': `url(${bgShowUrl})` } as CSSProperties} aria-hidden="true">
    <i className="arcade-background__glow arcade-background__glow--cyan" />
    <i className="arcade-background__glow arcade-background__glow--pink" />
    <i className="arcade-background__beam arcade-background__beam--left" />
    <i className="arcade-background__beam arcade-background__beam--right" />
    <i className="arcade-background__stars" />
    <div className="arcade-background__sign arcade-background__sign--left">ネオン</div>
    <div className="arcade-background__sign arcade-background__sign--right">遊ぶ</div>
    <div className="arcade-background__cabinet arcade-background__cabinet--left" />
    <div className="arcade-background__cabinet arcade-background__cabinet--right" />
    <div className="arcade-background__floor" />
  </div>
}
