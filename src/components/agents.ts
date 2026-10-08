import rock from '../assets/agents/rock.webp'
import octopus from '../assets/agents/octopus.webp'
import orangeImg from '../assets/agents/orange.webp'
import purple from '../assets/agents/purple.webp'
import rockBust from '../assets/agents/rock-bust.webp'
import octopusBust from '../assets/agents/octopus-bust.webp'
import orangeBust from '../assets/agents/orange-bust.webp'
import purpleBust from '../assets/agents/purple-bust.webp'
import worldRock from '../assets/world-rock.webp'
import worldOctopus from '../assets/world-octopus.webp'
import worldOrange from '../assets/world-orange.webp'
import worldPurple from '../assets/world-purple.webp'

/* Fonte única dos personagens (Agentes). Usada no onboarding (escolha) e na
   plataforma, que herda a foto/nome/cor do escolhido.
   'orb' é o agente padrão (a esfera), sem personagem/foto. */
export type AgentId = 'orb' | 'rock' | 'octopus' | 'orange' | 'purple'

export type Agent = {
  id: AgentId
  img: string
  /* fundo colorido do "mundo" do personagem (onboarding) */
  world: string
  /* nome padrão (editável no onboarding) */
  name: string
  /* cor sólida de identidade — tinge o botão "Nova tarefa", halos, etc. */
  accent: string
  /* cor final do gradiente do card de batizar (tint sutil) */
  tileTo: string
  /* 3 tons do outline/glow animado do botão de continuar */
  glow: string[]
  /* recorte de corpo inteiro (fundo transparente) p/ a faixa de boas-vindas */
  banner?: string
}

/* O que a plataforma recebe após a escolha (nome já pode estar editado). */
export type ChosenAgent = {
  id: AgentId
  /* ausente para o orb (agente padrão, sem foto) */
  img?: string
  name: string
  accent: string
  banner?: string
  /* agente padrão (esfera): a plataforma renderiza o orb no lugar da foto */
  orb?: boolean
}

/* Agente padrão (esfera) — identidade neutra herdada quando o orb é escolhido. */
export const ORB_NAME = 'Agente'
export const ORB_ACCENT = '#6366f1'
/* tint do card de batizar + 3 tons do glow do botão (onboarding) */
export const ORB_TILE = '236,233,255'
export const ORB_GLOW = ['#8b9bff', '#6366f1', '#b48bff']

/* Ordem: cima-esq, cima-dir, baixo-esq, baixo-dir. */
export const AGENTS: Agent[] = [
  { id: 'rock', img: rock, world: worldRock, name: 'Bento', accent: '#4fb050', tileTo: '249,255,233', glow: ['#7bd14a', '#4fb050', '#b4e26b'], banner: rockBust },
  { id: 'octopus', img: octopus, world: worldOctopus, name: 'Otto', accent: '#3b82f6', tileTo: '231,239,255', glow: ['#5b9bff', '#3b82f6', '#4cc2f0'], banner: octopusBust },
  { id: 'orange', img: orangeImg, world: worldOrange, name: 'Zuzu', accent: '#fb8c3c', tileTo: '255,241,238', glow: ['#ffb060', '#fb8c3c', '#ffcf72'], banner: orangeBust },
  { id: 'purple', img: purple, world: worldPurple, name: 'Lila', accent: '#8b5cf6', tileTo: '236,230,255', glow: ['#b393ff', '#8b5cf6', '#c98dff'], banner: purpleBust },
]

export const AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<AgentId, Agent>
