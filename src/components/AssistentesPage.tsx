import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './assistentes-page.css'
import searchIcon from '../assets/search-light.svg'
import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

const SEGMENTS = [
  'Todos',
  'Marketing',
  'Vendas',
  'Atendimento',
  'RH',
  'Jurídico',
  'Financeiro',
  'Conteúdo',
  'Produto',
]

const SEGMENT_COLOR: Record<string, string> = {
  Marketing: '#F0603A',
  Vendas: '#1F7A4D',
  Atendimento: '#8B5CF6',
  RH: '#3E63C4',
  Jurídico: '#4B5563',
  Financeiro: '#0E7490',
  Conteúdo: '#C15A2B',
  Produto: '#6E62E5',
}

type Assistant = { id: string; name: string; desc: string; segment: string }

const ASSISTANTS: Assistant[] = [
  { id: 'a1', name: 'Estrategista de Marketing', desc: 'Monta estratégias e planos de marketing completos.', segment: 'Marketing' },
  { id: 'a2', name: 'Gerador de Campanhas', desc: 'Cria campanhas multicanal do briefing ao criativo.', segment: 'Marketing' },
  { id: 'a3', name: 'Analista de SEO', desc: 'Audita páginas e sugere melhorias de ranqueamento.', segment: 'Marketing' },
  { id: 'a4', name: 'Social Media Manager', desc: 'Planeja o calendário e escreve posts para redes.', segment: 'Marketing' },
  { id: 'a5', name: 'SDR Virtual', desc: 'Prospecta e faz o primeiro contato com os leads.', segment: 'Vendas' },
  { id: 'a6', name: 'Qualificador de Leads', desc: 'Pontua e prioriza leads pelo perfil ideal.', segment: 'Vendas' },
  { id: 'a7', name: 'Redator de Propostas', desc: 'Gera propostas comerciais personalizadas.', segment: 'Vendas' },
  { id: 'a8', name: 'Coach de Vendas', desc: 'Analisa calls e dá feedback para o time comercial.', segment: 'Vendas' },
  { id: 'a9', name: 'Agente de Suporte', desc: 'Responde dúvidas e abre chamados automaticamente.', segment: 'Atendimento' },
  { id: 'a10', name: 'Assistente de FAQ', desc: 'Encontra respostas na base de conhecimento.', segment: 'Atendimento' },
  { id: 'a11', name: 'Gestor de Reclamações', desc: 'Faz triagem e responde reclamações de clientes.', segment: 'Atendimento' },
  { id: 'a12', name: 'Recrutador IA', desc: 'Tria currículos e agenda entrevistas.', segment: 'RH' },
  { id: 'a13', name: 'Guia de Onboarding', desc: 'Acompanha novos funcionários nos primeiros dias.', segment: 'RH' },
  { id: 'a14', name: 'Analista de Clima', desc: 'Resume pesquisas e mede o clima do time.', segment: 'RH' },
  { id: 'a15', name: 'Revisor de Contratos', desc: 'Revisa cláusulas e aponta riscos nos contratos.', segment: 'Jurídico' },
  { id: 'a16', name: 'Assistente Jurídico', desc: 'Pesquisa jurisprudência e redige pareceres.', segment: 'Jurídico' },
  { id: 'a17', name: 'Analista Financeiro', desc: 'Monta relatórios e projeções financeiras.', segment: 'Financeiro' },
  { id: 'a18', name: 'Gestor de Cobranças', desc: 'Acompanha inadimplência e envia lembretes.', segment: 'Financeiro' },
  { id: 'a19', name: 'Redator de Blog', desc: 'Escreve artigos otimizados para o blog.', segment: 'Conteúdo' },
  { id: 'a20', name: 'Roteirista de Vídeo', desc: 'Cria roteiros para vídeos e reels.', segment: 'Conteúdo' },
  { id: 'a21', name: 'Editor de Copy', desc: 'Revisa e melhora textos no tom da marca.', segment: 'Conteúdo' },
  { id: 'a22', name: 'Product Manager IA', desc: 'Organiza o roadmap e escreve specs de produto.', segment: 'Produto' },
  { id: 'a23', name: 'Pesquisador de UX', desc: 'Resume entrevistas e gera insights de UX.', segment: 'Produto' },
  { id: 'a24', name: 'Priorizador de Backlog', desc: 'Prioriza tarefas pelo impacto e esforço.', segment: 'Produto' },
]

/* alguns assistentes foram criados por alguém de uma organização */
const pravatar = (n: number) => `https://i.pravatar.cc/80?img=${n}`
type CreatorInfo = { name: string; avatar: string; org: string }
const CREATED: Record<string, CreatorInfo> = {
  a1: { name: 'Marina Costa', avatar: pravatar(12), org: 'Inner AI' },
  a3: { name: 'Rafael Lima', avatar: pravatar(33), org: 'Inner AI' },
  a5: { name: 'Juliana Alves', avatar: pravatar(45), org: 'Squad' },
  a7: { name: 'Pedro Santos', avatar: pravatar(15), org: 'Inner AI' },
  a9: { name: 'Camila Rocha', avatar: pravatar(47), org: 'Acme' },
  a11: { name: 'Lucas Ferreira', avatar: pravatar(8), org: 'Inner AI' },
  a13: { name: 'Beatriz Souza', avatar: pravatar(49), org: 'Squad' },
  a16: { name: 'Thiago Mendes', avatar: pravatar(60), org: 'Inner AI' },
  a18: { name: 'Ana Martins', avatar: pravatar(31), org: 'Acme' },
  a20: { name: 'Bruno Carvalho', avatar: pravatar(52), org: 'Inner AI' },
  a22: { name: 'Letícia Dias', avatar: pravatar(24), org: 'Squad' },
  a24: { name: 'Gustavo Nunes', avatar: pravatar(68), org: 'Inner AI' },
}

const SKELETON_MS = 850

function avatarStyle(segment: string): CSSProperties {
  const color = SEGMENT_COLOR[segment] ?? '#8A8F98'
  return {
    background: `linear-gradient(140deg, color-mix(in srgb, ${color} 72%, #ffffff), ${color})`,
  }
}

export default function AssistentesPage() {
  const [loading, setLoading] = useState(true)
  const [segment, setSegment] = useState('Todos')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!openMenu) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.assist-menu') && !t.closest('.assist-more')) setOpenMenu(null)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [openMenu])

  const list = segment === 'Todos' ? ASSISTANTS : ASSISTANTS.filter((a) => a.segment === segment)

  return (
    <main className="images-page assist-page">
      <button className="ap-cta" type="button">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Novo assistente
      </button>
      <div className="ip-container ap-container">
        <h1 className="ip-title">Assistentes</h1>

        <div className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar assistentes" spellCheck={false} />
        </div>

        <div className="ip-categories">
          {SEGMENTS.map((s) => (
            <button
              key={s}
              type="button"
              className={`ip-pill${segment === s ? ' is-active' : ''}`}
              onClick={() => setSegment(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="ap-grid">
          {loading
            ? ASSISTANTS.slice(0, 12).map((a, i) => (
                <div className="assist-card is-skeleton" key={a.id} style={{ '--i': i } as CSSProperties}>
                  <div className="assist-avatar sk-base" />
                  <div className="assist-text">
                    <div className="sk-base sk-name" />
                    <div className="sk-base sk-sub" />
                  </div>
                </div>
              ))
            : list.map((a, i) => {
              const created = CREATED[a.id]
              return (
                <article
                  className={`assist-card${openMenu === a.id ? ' is-menu-open' : ''}`}
                  key={a.id}
                  style={{ '--i': i } as CSSProperties}
                >
                  <span className="assist-avatar-wrap">
                    <span className="assist-avatar" style={avatarStyle(a.segment)} aria-hidden="true" />
                    {created && (
                      <span
                        className="assist-creator"
                        tabIndex={0}
                        aria-label={`Criado por ${created.name}`}
                      >
                        <img src={created.avatar} alt="" loading="lazy" />
                        <span className="pill-tooltip assist-creator-tip" role="tooltip" aria-hidden="true">
                          Criado por {created.name}
                        </span>
                      </span>
                    )}
                  </span>
                  <div className="assist-text">
                    <div className="assist-name-row">
                      <h3 className="assist-name">{a.name}</h3>
                      {created && <span className="assist-org">{created.org}</span>}
                    </div>
                    <p className="assist-desc">{a.desc}</p>
                  </div>
                  <button
                    type="button"
                    className={`assist-more${openMenu === a.id ? ' is-open' : ''}`}
                    aria-label="Ações do assistente"
                    aria-haspopup="menu"
                    aria-expanded={openMenu === a.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenu((cur) => (cur === a.id ? null : a.id))
                    }}
                  >
                    <MoreHorizontal size={18} strokeWidth={2} />
                  </button>
                  {openMenu === a.id && (
                    <div className="assist-menu" role="menu" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="assist-menu-item" role="menuitem">
                        <Pencil size={15} strokeWidth={1.9} />
                        Editar
                      </button>
                      <button type="button" className="assist-menu-item" role="menuitem">
                        <Copy size={15} strokeWidth={1.9} />
                        Duplicar
                      </button>
                      <div className="assist-menu-sep" />
                      <button type="button" className="assist-menu-item is-danger" role="menuitem">
                        <Trash2 size={15} strokeWidth={1.9} />
                        Excluir
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
        </div>
      </div>
    </main>
  )
}
