import openai from '../assets/models/openai.svg'
import claude from '../assets/models/claude-color.svg'
import cohere from '../assets/models/cohere-color.svg'
import meta from '../assets/models/meta-color.svg'
import deepseek from '../assets/models/deepseek-color.svg'
import gemini from '../assets/models/gemini-color.svg'
import grok from '../assets/models/grok.svg'
import perplexity from '../assets/models/perplexity-color.svg'
import zhipu from '../assets/models/zhipu-color.svg'
import kimi from '../assets/models/kimi-color.svg'
import nova from '../assets/models/nova-color.svg'
import qwen from '../assets/models/qwen-color.svg'
import maritaca from '../assets/models/maritaca.svg'

/* Modelos do "Chat com modelos" (seletor do input). Logos: LobeHub Icons (MIT)
   e o ícone do site da Maritaca AI (Sabiá). Inner AI Fusion usa o orb próprio. */

export type ModelTier = 'rapido' | 'avancado' | 'raciocinio'

export type ChatModel = {
  id: string
  name: string
  /* sem logo: Inner AI Fusion (orb em CSS) */
  logo?: string
  /* logo preto (OpenAI, Grok): no modo escuro inverte fora do círculo branco */
  mono?: boolean
  tier: ModelTier
  desc: string
}

export const MODEL_TIERS: { id: ModelTier; label: string; desc: string }[] = [
  { id: 'rapido', label: 'Rápido', desc: 'Respostas instantâneas para o dia a dia, com foco em velocidade e eficiência' },
  { id: 'avancado', label: 'Avançado', desc: 'Ideal para a maioria das tarefas profissionais, combinando qualidade superior e velocidade' },
  { id: 'raciocinio', label: 'Raciocínio Profundo', desc: 'Especializados em problemas complexos que exigem análise detalhada e máxima precisão' },
]

export const CHAT_MODELS: ChatModel[] = [
  { id: 'fusion', name: 'Inner AI Fusion', tier: 'avancado', desc: 'Escolhe o melhor modelo para cada pergunta, combinando velocidade e qualidade automaticamente.' },

  { id: 'gpt-oss', name: 'GPT OSS', logo: openai, mono: true, tier: 'rapido', desc: 'Modelo aberto da OpenAI, rápido e leve para tarefas do dia a dia.' },
  { id: 'claude-haiku', name: 'Claude 5.5 Haiku', logo: claude, tier: 'rapido', desc: 'O Claude mais rápido: ótimo para respostas curtas, resumos e classificação.' },
  { id: 'command-r', name: 'Command R', logo: cohere, tier: 'rapido', desc: 'Da Cohere, bom para busca em documentos e respostas com fontes.' },
  { id: 'gpt-6-instant', name: 'GPT 6 Instant', logo: openai, mono: true, tier: 'rapido', desc: 'Versão instantânea do GPT 6, com respostas quase imediatas.' },
  { id: 'llama-scout', name: 'Llama 4 Scout', logo: meta, tier: 'rapido', desc: 'Modelo aberto da Meta com janela de contexto longa.' },
  { id: 'deepseek-flash', name: 'Deepseek 4.1 Flash', logo: deepseek, tier: 'rapido', desc: 'Versão rápida e econômica do Deepseek.' },
  { id: 'gemini-flash-35', name: 'Gemini 3.5 Flash', logo: gemini, tier: 'rapido', desc: 'Rápido e multimodal: entende texto, imagens e documentos.' },
  { id: 'grok-fast', name: 'Grok 4.7 Fast', logo: grok, mono: true, tier: 'rapido', desc: 'Versão rápida do Grok, da xAI, com conhecimento atualizado.' },
  { id: 'gaia', name: 'Google Gaia', logo: gemini, tier: 'rapido', desc: 'Modelo leve do Google para conversas e tarefas simples.' },

  { id: 'gpt-6', name: 'GPT 6', logo: openai, mono: true, tier: 'avancado', desc: 'O modelo principal da OpenAI, equilibrado para quase tudo.' },
  { id: 'claude-sonnet', name: 'Claude Sonnet 5.5', logo: claude, tier: 'avancado', desc: 'Excelente em escrita, análise e código, com respostas cuidadosas.' },
  { id: 'deepseek-pro', name: 'Deepseek 4.0 Pro', logo: deepseek, tier: 'avancado', desc: 'Forte em matemática e programação, com ótimo custo-benefício.' },
  { id: 'llama-maverick', name: 'Llama 4 Maverick', logo: meta, tier: 'avancado', desc: 'O Llama mais capaz, multimodal e aberto.' },
  { id: 'perplexity-sonar', name: 'Perplexity Sonar', logo: perplexity, tier: 'avancado', desc: 'Pesquisa na web em tempo real e responde com as fontes.' },
  { id: 'gemini-flash-38', name: 'Gemini 3.8 Flash', logo: gemini, tier: 'avancado', desc: 'Gemini mais recente da linha Flash, com qualidade superior.' },
  { id: 'sabia', name: 'Sabiá 4', logo: maritaca, tier: 'avancado', desc: 'Da Maritaca AI, treinado com foco em português brasileiro.' },
  { id: 'glm', name: 'GLM 5.3', logo: zhipu, tier: 'avancado', desc: 'Da Zhipu AI, versátil e bom em tarefas com ferramentas.' },
  { id: 'kimi', name: 'Kimi K3', logo: kimi, tier: 'avancado', desc: 'Da Moonshot AI, ótimo com documentos longos.' },
  { id: 'nova-premier', name: 'Amazon Nova Premier', logo: nova, tier: 'avancado', desc: 'O modelo mais capaz da Amazon para tarefas complexas.' },

  { id: 'gpt-61-thinking', name: 'GPT 6.1 Thinking', logo: openai, mono: true, tier: 'raciocinio', desc: 'Pensa antes de responder: ideal para problemas difíceis.' },
  { id: 'claude-sonnet-thinking', name: 'Claude Sonnet 5.5 Thinking', logo: claude, tier: 'raciocinio', desc: 'Claude com raciocínio estendido para análises profundas.' },
  { id: 'gemini-pro', name: 'Gemini 3.1 Pro', logo: gemini, tier: 'raciocinio', desc: 'O Gemini mais avançado, com raciocínio e contexto longo.' },
  { id: 'sabia-thinking', name: 'Sabiá 4 Thinking', logo: maritaca, tier: 'raciocinio', desc: 'Sabiá com raciocínio passo a passo, em português.' },
  { id: 'o3', name: 'o3', logo: openai, mono: true, tier: 'raciocinio', desc: 'Modelo de raciocínio da OpenAI para ciência, matemática e código.' },
  { id: 'qwen-qwq', name: 'Qwen QwQ', logo: qwen, tier: 'raciocinio', desc: 'Modelo de raciocínio aberto da Alibaba.' },
  { id: 'grok-47', name: 'Grok 4.7', logo: grok, mono: true, tier: 'raciocinio', desc: 'O Grok mais capaz, com raciocínio e busca em tempo real.' },
]

export const MODEL_BY_ID = Object.fromEntries(CHAT_MODELS.map((m) => [m.id, m])) as Record<string, ChatModel>

/* escolha e favoritos da sessão (protótipo): valem para todos os inputs */
export const modelPrefs: {
  selected: string
  favorites: string[]
  /* assistente escolhido na aba Assistentes (no lugar do modelo) */
  assistant: { id: string; name: string; color: string; avatar?: string } | null
} = {
  selected: 'fusion',
  favorites: ['fusion', 'gpt-oss'],
  assistant: null,
}
