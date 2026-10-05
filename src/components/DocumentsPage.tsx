import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './documents-page.css'
import searchIcon from '../assets/search-light.svg'
import { FileText } from 'lucide-react'

const CATEGORIES = [
  'Todos',
  'Meus Templates de Texto',
  'Vendas',
  'Arquitetos',
  'Recursos Humanos',
  'Gestão',
  'Advogados',
]

const CATEGORY_COLOR: Record<string, string> = {
  Vendas: '#1F7A4D',
  Arquitetos: '#C15A2B',
  'Recursos Humanos': '#3E63C4',
  Gestão: '#6E62E5',
  Advogados: '#B08968',
}

type DocTemplate = { id: string; name: string; desc: string; category?: string }

const TEMPLATES: DocTemplate[] = [
  {
    id: 'comunicado-imprensa',
    name: 'Comunicado de Imprensa',
    desc: 'Elabore um comunicado de imprensa profissional para anunciar notícias ou eventos importantes, transmitindo eficazmente sua mensagem para a mídia.',
  },
  {
    id: 'pdi',
    name: 'Plano de Desenvolvimento Individual (PDI)',
    desc: 'Crie um PDI personalizado com metas SMART, ações práticas, cronograma de 12 meses, indicadores e marcos para impulsionar o crescimento profissional.',
    category: 'Gestão',
  },
  {
    id: 'analise-reuniao-comercial',
    name: 'Análise de Reunião Comercial',
    desc: 'Receba análise da reunião comercial com base em SPIN, BANT, GPCT e Challenger. Identifique melhorias, gatilhos e próximos passos estratégicos.',
    category: 'Vendas',
  },
  {
    id: 'post-linkedin',
    name: 'Publicação no LinkedIn',
    desc: 'Elabore posts envolventes para LinkedIn a partir de prompts de texto ou arquivos, melhorando o engajamento na sua rede.',
  },
  {
    id: 'faqs',
    name: 'Perguntas Frequentes (FAQs)',
    desc: 'Compile uma lista de perguntas frequentes e respostas para abordar de forma eficaz dúvidas e preocupações comuns.',
  },
  {
    id: 'prospeccao-b2b',
    name: 'Prospecção de Clientes B2B',
    desc: 'Encontre clientes ideais com base em segmento, porte e perfil decisor. Receba nichos promissores, canais, mensagens e critérios de qualificação.',
    category: 'Vendas',
  },
  {
    id: 'landing-page',
    name: 'Esboço de Landing Page',
    desc: 'Estruture uma landing page persuasiva com seções, títulos e chamadas para ação prontos para converter visitantes.',
  },
  {
    id: 'termos-de-uso',
    name: 'Termos de Uso',
    desc: 'Gere um documento de termos de uso claro e completo, cobrindo direitos, deveres e limitações de responsabilidade.',
    category: 'Advogados',
  },
  {
    id: 'roteiro-reuniao-projeto',
    name: 'Roteiro de Reunião para Projeto',
    desc: 'Monte uma pauta objetiva de reunião de projeto, com tópicos, responsáveis, tempo e decisões a tomar.',
    category: 'Gestão',
  },
  {
    id: 'descricao-vaga',
    name: 'Descrição de Vaga',
    desc: 'Escreva um anúncio de vaga atrativo, com responsabilidades, requisitos e cultura, em linguagem inclusiva.',
    category: 'Recursos Humanos',
  },
  {
    id: 'memorial-descritivo',
    name: 'Memorial Descritivo',
    desc: 'Produza o memorial descritivo da obra, detalhando materiais, acabamentos e especificações técnicas do projeto.',
    category: 'Arquitetos',
  },
  {
    id: 'contrato-servicos',
    name: 'Contrato de Prestação de Serviços',
    desc: 'Elabore um contrato de prestação de serviços com escopo, prazos, valores e cláusulas de rescisão.',
    category: 'Advogados',
  },
]

const SKELETON_MS = 850

function catAvatarStyle(category: string): CSSProperties {
  const color = CATEGORY_COLOR[category] ?? '#8A8F98'
  return { background: `linear-gradient(140deg, color-mix(in srgb, ${color} 70%, #ffffff), ${color})` }
}

export default function DocumentsPage() {
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Todos')

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

  const list =
    category === 'Todos'
      ? TEMPLATES
      : category === 'Meus Templates de Texto'
        ? []
        : TEMPLATES.filter((t) => t.category === category)

  return (
    <main className="images-page documents-page">
      <div className="ip-container dp-container">
        <h1 className="ip-title">Templates de Texto</h1>

        <div className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar..." spellCheck={false} />
        </div>

        <div className="ip-categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`ip-pill${category === c ? ' is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="doc-empty">
            <span className="doc-empty-emoji" aria-hidden="true">📄</span>
            <p className="doc-empty-title">Nenhum template salvo ainda</p>
            <p className="doc-empty-sub">Salve um template de texto para vê-lo aqui.</p>
          </div>
        ) : (
          <div className="doc-grid">
            {loading
              ? TEMPLATES.slice(0, 9).map((t, i) => (
                  <div className="doc-card is-skeleton" key={t.id} style={{ '--i': i } as CSSProperties}>
                    <div className="doc-icon sk-base" />
                    <div className="sk-base sk-name" />
                    <div className="doc-desc-sk">
                      <div className="sk-base sk-line" />
                      <div className="sk-base sk-line" />
                      <div className="sk-base sk-line short" />
                    </div>
                  </div>
                ))
              : list.map((t, i) => (
                  <article className="doc-card" key={t.id} style={{ '--i': i } as CSSProperties}>
                    <span className="doc-icon" aria-hidden="true">
                      <FileText size={20} strokeWidth={1.9} />
                    </span>
                    <h3 className="doc-name">{t.name}</h3>
                    {t.category && (
                      <span className="doc-cat">
                        <span className="doc-cat-avatar" style={catAvatarStyle(t.category)} aria-hidden="true" />
                        {t.category}
                      </span>
                    )}
                    <p className="doc-desc">{t.desc}</p>
                  </article>
                ))}
          </div>
        )}
      </div>
    </main>
  )
}
