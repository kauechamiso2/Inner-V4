import './agent-orb.css'
import orbMask1 from '../assets/orb-mask-1.svg'
import orbMask2 from '../assets/orb-mask-2.svg'
import orbEllipse1 from '../assets/orb-ellipse-1.svg'
import orbEllipse2 from '../assets/orb-ellipse-2.svg'

/**
 * Orbe do Agent — réplica das camadas do Figma (base 13px, node 538:5398).
 * `size` escala o conjunto todo mantendo as proporções exatas das camadas.
 */
export default function AgentOrb({ size = 13 }: { size?: number }) {
  const scale = size / 13
  return (
    <span className="agent-orb" style={{ width: size, height: size }} aria-hidden="true">
      <span className="agent-orb-scale" style={{ transform: `scale(${scale})` }}>
        <span className="orb-base">
          <span className="orb-halo">
            <img src={orbMask1} alt="" />
          </span>
        </span>
        <span className="orb-base">
          <img className="orb-fill" src={orbMask2} alt="" />
        </span>
        <span className="orb-glint orb-glint-1">
          <span className="orb-rotate-1">
            <span className="orb-ellipse orb-ellipse-1">
              <img src={orbEllipse1} alt="" />
            </span>
          </span>
        </span>
        <span className="orb-glint orb-glint-2">
          <span className="orb-rotate-2">
            <span className="orb-ellipse orb-ellipse-2">
              <img src={orbEllipse2} alt="" />
            </span>
          </span>
        </span>
      </span>
    </span>
  )
}
