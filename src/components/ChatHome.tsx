import './chat-home.css'
import AgentOrb from './AgentOrb'

export default function ChatHome() {
  return (
    <main className="chat-home">
      <div className="chat-greeting">
        <span className="greeting-orb">
          <span className="greeting-orb-glow">
            <AgentOrb size={26} />
          </span>
          <AgentOrb size={26} />
        </span>
        <h1 className="greeting-text">Boa tarde, Kauê</h1>
      </div>
    </main>
  )
}
