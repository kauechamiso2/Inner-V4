import { useState } from 'react'
import './chat-home.css'
import AgentOrb from './AgentOrb'
import { CaretDownIcon, PlusIcon, VoiceWaveIcon } from './SidebarIcons'
import sliders from '../assets/sliders.svg'
import microphone from '../assets/microphone.svg'
import arrowUp from '../assets/arrow-up.svg'

type InputMode = 'agente' | 'chat'

const PLACEHOLDERS: Record<InputMode, string> = {
  agente: 'Diga o que devo fazer',
  chat: 'Pergunte qualquer coisa...',
}

export default function ChatHome() {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<InputMode>('agente')
  const canSend = value.trim().length > 0

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
          <div className="chat-controls" key={mode}>
            <div className="chat-controls-left">
              {mode === 'chat' && (
                <button className="ch-model" type="button" aria-haspopup="listbox">
                  <span className="ch-model-dot" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M4.5 0.6 5.3 3.7 8.4 4.5 5.3 5.3 4.5 8.4 3.7 5.3 0.6 4.5 3.7 3.7 Z"
                        fill="#ffffff"
                      />
                    </svg>
                  </span>
                  <span className="ch-model-name">Claude 6 Sonnet Thinking</span>
                  <CaretDownIcon />
                </button>
              )}
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
              {mode === 'chat' && !canSend ? (
                <button className="ch-voice" type="button" aria-label="Modo de voz avançado">
                  <VoiceWaveIcon />
                </button>
              ) : (
                <button
                  className={`chat-send${canSend ? ' is-ready' : ''}`}
                  type="button"
                  aria-label="Enviar"
                  disabled={!canSend}
                >
                  <img src={arrowUp} alt="" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}
