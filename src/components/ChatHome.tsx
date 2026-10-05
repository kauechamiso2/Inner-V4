import './chat-home.css'
import AgentOrb from './AgentOrb'
import ChatComposer from './ChatComposer'

type InputMode = 'agente' | 'chat'

export default function ChatHome({
  mode,
  onModeChange,
}: {
  mode: InputMode
  onModeChange: (m: InputMode) => void
}) {
  return (
    <main className="chat-home">
      <div className="chat-column">
        <div className="chat-greeting" key={mode}>
          {mode === 'agente' ? (
            <>
              <span className="greeting-orb">
                <span className="greeting-orb-glow">
                  <AgentOrb size={26} />
                </span>
                <span className="greeting-orb-core">
                  <AgentOrb size={26} />
                </span>
              </span>
              <h1 className="greeting-text">Me dê uma tarefa...</h1>
            </>
          ) : (
            <h1 className="greeting-text">Converse com modelos de IA</h1>
          )}
        </div>

        <ChatComposer mode={mode} onModeChange={onModeChange} />
      </div>
    </main>
  )
}
