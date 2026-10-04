import { useState } from 'react'
import './chat-home.css'
import AgentOrb from './AgentOrb'
import { PlusIcon } from './SidebarIcons'
import sliders from '../assets/sliders.svg'
import microphone from '../assets/microphone.svg'
import arrowUp from '../assets/arrow-up.svg'

type InputMode = 'agente' | 'chat'

const PLACEHOLDERS: Record<InputMode, string> = {
  agente: 'Pergunte ou crie qualquer coisa',
  chat: 'Pergunte-me qualquer coisa',
}

export default function ChatHome() {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<InputMode>('agente')
  const canSend = value.trim().length > 0

  return (
    <main className="chat-home">
      <div className="chat-column">
        <div className="chat-greeting">
          <span className="greeting-orb">
            <span className="greeting-orb-glow">
              <AgentOrb size={26} />
            </span>
            <span className="greeting-orb-core">
              <AgentOrb size={26} />
            </span>
          </span>
          <h1 className="greeting-text">Me dê uma tarefa...</h1>
        </div>

        <div className="chat-input-wrap">
          <div className="chat-tabs" role="tablist" aria-label="Modo do input">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'agente'}
              className={`chat-tab${mode === 'agente' ? ' is-active' : ''}`}
              onClick={() => setMode('agente')}
            >
              <AgentOrb size={14} />
              Agente
              {mode === 'agente' && (
                <>
                  <span className="tab-foot tab-foot-l" aria-hidden="true" />
                  <span className="tab-foot tab-foot-r" aria-hidden="true" />
                </>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'chat'}
              className={`chat-tab${mode === 'chat' ? ' is-active' : ''}`}
              onClick={() => setMode('chat')}
            >
              Chat
              {mode === 'chat' && (
                <>
                  <span className="tab-foot tab-foot-l" aria-hidden="true" />
                  <span className="tab-foot tab-foot-r" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          <div className="chat-input-card">
          <textarea
            className="chat-input-field"
            placeholder={PLACEHOLDERS[mode]}
            rows={1}
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="chat-controls">
            <div className="chat-controls-left">
              <button className="ch-attach" type="button" aria-label="Anexar">
                <PlusIcon />
              </button>
              <button className="ch-chip" type="button">
                <img className="is-rotated" src={sliders} alt="" aria-hidden="true" />
                <span>Ferramentas</span>
              </button>
            </div>
            <div className="chat-controls-right">
              <button className="chat-mic" type="button" aria-label="Falar">
                <img src={microphone} alt="" aria-hidden="true" />
              </button>
              <button
                className={`chat-send${canSend ? ' is-ready' : ''}`}
                type="button"
                aria-label="Enviar"
                disabled={!canSend}
              >
                <img src={arrowUp} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}
