import type { FlowConfig } from './flow/Flow'
import type { ImageModel } from './imageModels'
import elevenlabs from '../assets/models/elevenlabs.svg'
import gemini from '../assets/models/gemini-color.svg'
import openai from '../assets/models/openai.svg'

/* Pilar de Áudio: modelos e flows de cada ferramenta (galeria + flows). */

export const AUDIO_MODELS: ImageModel[] = [
  { id: 'elevenlabs', name: 'ElevenLabs', logo: elevenlabs, credits: 40, desc: 'Vozes naturais e expressivas em vários idiomas.' },
  { id: 'elevenlabs-sfx', name: 'ElevenLabs Sound Effects', logo: elevenlabs, credits: 22, desc: 'Efeitos sonoros a partir de uma descrição.' },
  { id: 'lyria-2', name: 'Lyria 2', logo: gemini, credits: 200, desc: 'Do Google DeepMind, músicas originais em alta qualidade.' },
  { id: 'whisper', name: 'Whisper', logo: openai, credits: 0, desc: 'Da OpenAI, transcreve áudio e vídeo em vários idiomas.' },
]
const only = (id: string) => AUDIO_MODELS.filter((m) => m.id === id)

/* vozes da Voz Digital (prévia falada pelo navegador no protótipo) */
const VOICES = [
  'Catarina', 'Antonio', 'Chris', 'Aria', 'Laura', 'Matilda', 'Callum', 'Oliver', 'Alice', 'Davi', 'Amelia', 'João',
  'Mia', 'Brian', 'Eric', 'Liam', 'Victoria', 'Carla', 'Isaac', 'George', 'Ivan', 'Clara', 'Podcast Café com IA',
  'Pessoa 1', 'Demo Qualylife', 'Demo Continental', 'Demo Neoenergia', 'Prio teste', 'Pessoa 2', 'Mark v2', 'Bill v2',
].map((label) => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }))

export const AUDIO_FLOWS: Record<string, FlowConfig> = {
  voice: {
    title: 'Voz Digital',
    desc: 'Crie narrações de áudio sintéticas a partir de texto, trazendo seu conteúdo escrito à vida com som natural.',
    output: 'audio',
    models: only('elevenlabs'),
    credits: null,
    steps: [
      {
        id: 'voice',
        label: 'Escolha uma voz',
        fields: [
          {
            id: 'voice',
            type: 'voices',
            label: 'Voz',
            required: true,
            desc: 'Escolha a voz que vai narrar o seu texto. Toque no play para ouvir uma prévia de cada uma.',
            options: VOICES,
          },
        ],
      },
      {
        id: 'config',
        label: 'Configurações',
        summary: 'speed',
        fields: [
          {
            id: 'text',
            type: 'textarea',
            label: 'Texto',
            required: true,
            desc: 'O que a voz vai falar.',
            placeholder: 'Digite seu texto aqui',
            maxLength: 5000,
          },
          {
            id: 'speed',
            type: 'choice',
            label: 'Velocidade',
            default: 'normal',
            options: [
              { value: 'lenta', label: 'Lenta' },
              { value: 'normal', label: 'Normal' },
              { value: 'rapida', label: 'Rápida' },
            ],
          },
        ],
      },
    ],
  },
  transcribe: {
    title: 'Transcrever Áudio',
    desc: 'Transcreva arquivos de áudio. A partir daí, inicie uma conversa, gere legendas, peça detalhes específicos ou exporte um resumo.',
    output: 'text',
    models: only('whisper'),
    credits: null,
    submitLabel: 'Criar',
    steps: [
      {
        id: 'fields',
        label: 'Preencha os campos',
        fields: [
          {
            id: 'file',
            type: 'upload',
            accept: 'media',
            label: 'Selecione o arquivo para ser transcrito',
            required: true,
            desc: 'Anexe um arquivo de áudio ou vídeo.',
          },
        ],
      },
    ],
  },
  music: {
    title: 'Geração de Música',
    desc: 'Gere músicas originais com base na sua descrição, perfeitas para vídeos, jogos ou projetos criativos.',
    output: 'audio',
    models: only('lyria-2'),
    submitLabel: 'Criar',
    steps: [
      {
        id: 'describe',
        label: 'Descreva sua música',
        fields: [
          {
            id: 'prompt',
            type: 'textarea',
            label: 'Descrição da música',
            required: true,
            desc: 'Insira aqui uma descrição da música que você deseja gerar.',
            example:
              'Performance vocal de jazz efervescente, gravação de estúdio impecável, sofisticada e com alma. Vocais jazz: melodias improvisadas e cheias de sentimento. Uma mistura de instrumentação clássica de jazz com foco na habilidade improvisacional do vocalista, apresentando frases melódicas complexas e brincadeiras rítmicas, evocando uma atmosfera atemporal e íntima de um clube de jazz clássico.',
            placeholder: 'Digite seu texto aqui',
            maxLength: 2000,
          },
        ],
      },
    ],
  },
  sfx: {
    title: 'Efeito Sonoro',
    desc: 'Crie e personalize efeitos sonoros a partir de prompts de texto, ideal para jogos, vídeos e projetos criativos.',
    output: 'audio',
    models: only('elevenlabs-sfx'),
    submitLabel: 'Criar',
    steps: [
      {
        id: 'fields',
        label: 'Preencha os campos',
        fields: [
          {
            id: 'prompt',
            type: 'textarea',
            label: 'O que você quer criar?',
            required: true,
            desc: 'Insira detalhes sobre o que você gostaria de criar.',
            placeholder: 'Digite seu texto aqui',
          },
        ],
      },
    ],
  },
}

/* áudio de um item do histórico (protótipo): o tipo vem do título */
export function audioForTitle(title: string): {
  kind: 'voice' | 'music' | 'sfx' | 'transcribe'
  tool: string
  template: string
  prompt: string
  model: string
  voice?: string
  dur: number
} {
  const t = title.toLowerCase()
  if (/jingle|trilha|música|musica/.test(t))
    return {
      kind: 'music',
      tool: 'music',
      template: 'Geração de Música',
      prompt: `${title}: pop leve e otimista, violão e batida suave, final marcante para a assinatura da marca.`,
      model: 'Lyria 2',
      dur: 32,
    }
  if (/podcast|transcri|entrevista/.test(t))
    return { kind: 'transcribe', tool: 'transcribe', template: 'Transcrever Áudio', prompt: `${title}.mp3`, model: 'Whisper', dur: 26 }
  if (/efeito|som de|sfx/.test(t))
    return { kind: 'sfx', tool: 'sfx', template: 'Efeito Sonoro', prompt: title, model: 'ElevenLabs Sound Effects', dur: 4 }
  return {
    kind: 'voice',
    tool: 'voice',
    template: 'Voz Digital',
    prompt:
      'Olá! Que bom ter você por aqui. Nos próximos minutos, vamos mostrar como tudo funciona e como tirar o máximo proveito desde o primeiro dia.',
    model: 'ElevenLabs',
    voice: 'Catarina',
    dur: 18,
  }
}
