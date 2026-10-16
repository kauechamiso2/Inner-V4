import type { FlowConfig, FlowField } from './flow/Flow'
import type { ImageModel } from './imageModels'
import openai from '../assets/models/openai.svg'
import heygen from '../assets/models/heygen.png'

/* Flows das ferramentas de vídeo (cada card da galeria abre um flow). */

const ratio: FlowField = {
  id: 'ratio',
  type: 'choice',
  label: 'Proporção',
  desc: 'Formato do vídeo final.',
  options: [
    { value: '16:9', label: '16:9', hint: 'YouTube' },
    { value: '9:16', label: '9:16', hint: 'Reels e TikTok' },
    { value: '1:1', label: '1:1', hint: 'Feed' },
  ],
}
const duration: FlowField = {
  id: 'duration',
  type: 'choice',
  label: 'Duração',
  options: [
    { value: '5s', label: '5 segundos' },
    { value: '8s', label: '8 segundos' },
    { value: '10s', label: '10 segundos' },
  ],
}
const quality: FlowField = {
  id: 'quality',
  type: 'choice',
  label: 'Qualidade',
  default: '1080p',
  options: [
    { value: '720p', label: '720p', hint: 'HD' },
    { value: '1080p', label: '1080p', hint: 'Full HD' },
  ],
}
const audio: FlowField = { id: 'audio', type: 'toggle', label: 'Gerar áudio', desc: 'Som ambiente e efeitos combinando com a cena.', default: true }
const qty: FlowField = { id: 'qty', type: 'count', label: 'Vídeos por vez', min: 1, max: 4, default: 1 }

const settingsStep = {
  id: 'config',
  label: 'Configurações',
  fields: [
    { ...ratio, default: '16:9' } as FlowField,
    { ...duration, default: '5s' } as FlowField,
    quality,
    audio,
    qty,
  ],
}

/* modelos próprios de alguns templates */
const AVATAR_MODELS: ImageModel[] = [
  { id: 'heygen', name: 'Heygen Avatar', logo: heygen, credits: 0, desc: 'Avatares realistas que falam com sincronia labial.' },
]
const TRANSCRIBE_MODELS: ImageModel[] = [
  { id: 'whisper', name: 'Whisper', logo: openai, credits: 0, desc: 'Da OpenAI, transcreve áudio e vídeo em vários idiomas.' },
]

/* personagens do Avatar (fotos de exemplo) */
const AVATAR_NAMES = [
  'Artur', 'Chloe', 'Georgia', 'Laszek', 'Timothy', 'Amelia', 'Milena', 'Juan', 'Vernon', 'Conrad', 'Gala', 'Blanka',
  'Abigail', 'Oxana', 'Candace', 'Stacy', 'Adrian', 'Bryan', 'Dexter', 'Lina', 'Aubrey', 'Emanuel', 'Fernando', 'Giulia',
  'Kavya', 'Patrizio', 'Ren', 'Miles', 'Masha', 'Darnell', 'Chad', 'Carla', 'Matthew', 'Violante', 'Amanda', 'Papai Noel',
]
const AVATAR_OPTIONS = AVATAR_NAMES.map((name, i) => ({
  value: name.toLowerCase().replace(/\s+/g, '-'),
  label: name,
  img: `https://i.pravatar.cc/200?img=${(i * 7) % 70 + 1}`,
}))

const durationSeconds = (list: number[]) => list.map((n) => ({ value: `${n}s`, label: `${n} segundos` }))
const withSound: FlowField = {
  id: 'audio_on',
  type: 'choice',
  label: 'Áudio no vídeo',
  required: true,
  desc: 'Escolha se o vídeo gerado deve incluir áudio.',
  options: [{ value: 'com-som', label: 'Com som' }],
}

export const VIDEO_FLOWS: Record<string, FlowConfig> = {
  'video-generation': {
    title: 'Geração de Vídeos',
    desc: 'Transforme prompts de texto em vídeos de alta qualidade com rapidez e criatividade.',
    output: 'video',
    initialModel: 'grok-video',
    steps: [
      {
        id: 'instr',
        label: 'Instruções',
        fields: [
          {
            id: 'prompt',
            type: 'textarea',
            label: 'Prompt do vídeo',
            required: true,
            desc: 'Insira detalhes sobre o que você gostaria de criar.',
            placeholder: 'Digite seu texto aqui',
          },
        ],
      },
      settingsStep,
    ],
  },
  'arch-render': {
    title: 'Vídeo de Render Arquitetônico',
    desc: 'Transforme seu render arquitetônico em um vídeo curto e envolvente de 8 segundos, com movimento e som. Ideal para destacar o ambiente de forma mais completa, bonita e atrativa, sem alterar o projeto original. Perfeito para apresentações, portfólios e divulgação em redes sociais.',
    output: 'video',
    initialModel: 'sora-2',
    credits: 700,
    submitLabel: 'Criar',
    steps: [
      {
        id: 'fields',
        label: 'Preencha os campos',
        fields: [
          {
            id: 'render',
            type: 'upload',
            accept: 'image',
            label: 'Selecione a imagem do render',
            required: true,
            desc: 'Anexe uma imagem de render arquitetônico em alta qualidade. Ela será o assunto principal do vídeo.',
          },
          {
            id: 'prompt',
            type: 'textarea',
            label: 'Descreva o vídeo arquitetônico',
            required: true,
            desc: 'Diga como você quer ver o ambiente no vídeo. Por exemplo: o que destacar, se a câmera deve se mover de leve (aproximar/afastar ou uma pequena volta), o clima (calmo ou mais energético), horário/iluminação, estilo de cores, se deseja título ou logotipo na tela, duração (~5 a 10s), formato (quadrado, vertical, horizontal) e se deseja som ambiente sutil. Não mudaremos o projeto; vamos apresentar o seu render original.',
            placeholder: 'Digite seu texto aqui',
          },
          {
            id: 'duration',
            type: 'choice',
            label: 'Duração do vídeo',
            required: true,
            desc: 'Escolha quanto tempo o vídeo deve ter.',
            options: durationSeconds([4, 8, 12]),
          },
          {
            ...withSound,
            desc: 'O Sora 2 só gera vídeos com som. Se quiser um vídeo sem som, especifique no prompt que deseja um vídeo mudo ou sem áudio.',
          } as FlowField,
        ],
      },
    ],
  },
  'video-from-image': {
    title: 'Gerar Vídeo com Base em Imagem',
    desc: 'Gere vídeos com base em uma imagem existente, adaptando estilos e detalhes para corresponder à sua visão.',
    output: 'video',
    initialModel: 'grok-video',
    steps: [
      {
        id: 'config',
        label: 'Configurações',
        fields: [
          {
            id: 'image',
            type: 'upload',
            accept: 'image',
            label: 'Selecione imagem',
            required: true,
            desc: 'Envie um arquivo de imagem para ser usado no vídeo.',
            details: [
              ['Tamanho máximo', '10MB'],
              ['Dimensões mínimas', '300x300px'],
              ['Formatos aceitos', 'JPEG, PNG, GIF, WEBP'],
            ],
          },
          {
            id: 'ratio',
            type: 'choice',
            label: 'Proporção da tela',
            required: true,
            desc: 'Selecione a proporção da tela para seu vídeo.',
            options: [
              { value: 'auto', label: 'Auto' },
              { value: '16:9', label: 'Horizontal' },
              { value: '9:16', label: 'Vertical' },
            ],
          },
          {
            id: 'duration',
            type: 'choice',
            label: 'Duração do vídeo',
            required: true,
            desc: 'Selecione a duração do seu vídeo. Você pode escolher de 2 até 14 segundos.',
            options: durationSeconds([2, 4, 6, 8, 10, 12, 14]),
          },
          withSound,
          {
            id: 'quality',
            type: 'choice',
            label: 'Resolução',
            required: true,
            desc: 'Selecione a resolução para seu vídeo.',
            options: [
              { value: '480p', label: '480p' },
              { value: '720p', label: '720p' },
            ],
          },
        ],
      },
      {
        id: 'instr',
        label: 'Instruções',
        fields: [
          {
            id: 'prompt',
            type: 'textarea',
            label: 'O que acontece no vídeo?',
            required: true,
            desc: 'Descreva o movimento e a câmera.',
            placeholder: 'Digite seu texto aqui',
          },
        ],
      },
    ],
  },
  avatar: {
    title: 'Avatar',
    desc: 'Crie um avatar digital que fala e se move de forma realista em vídeos.',
    output: 'video',
    models: AVATAR_MODELS,
    credits: null,
    steps: [
      {
        id: 'character',
        label: 'Escolha um personagem',
        fields: [
          {
            id: 'avatar',
            type: 'avatars',
            label: 'Personagem',
            required: true,
            desc: 'Escolha um personagem avatar que será usado para gerar seu vídeo com IA. Cada avatar tem seu próprio estilo e personalidade únicos.',
            options: AVATAR_OPTIONS,
          },
        ],
      },
      {
        id: 'audio',
        label: 'Importe seu áudio',
        fields: [
          {
            id: 'voice',
            type: 'upload',
            accept: 'audio',
            label: 'Áudio da fala',
            required: true,
            desc: 'O avatar vai falar exatamente este áudio, com sincronia labial.',
          },
        ],
      },
    ],
  },
  transcribe: {
    title: 'Transcrever Vídeo',
    desc: 'Transcreva arquivos de vídeo. A partir daí, inicie uma conversa, gere legendas, peça detalhes específicos ou exporte um resumo.',
    output: 'text',
    models: TRANSCRIBE_MODELS,
    credits: null,
    submitLabel: 'Criar',
    steps: [
      {
        id: 'fields',
        label: 'Preencha os campos',
        fields: [
          {
            id: 'video',
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
  'viral-cuts': {
    title: 'Cortes Virais',
    desc: 'Recorte os melhores momentos e gere clipes prontos para viralizar.',
    output: 'video',
    steps: [
      {
        id: 'video',
        label: 'Vídeo',
        fields: [{ id: 'video', type: 'upload', accept: 'video', label: 'Vídeo longo', required: true, desc: 'Podcast, live ou aula.' }],
      },
      {
        id: 'config',
        label: 'Configurações',
        fields: [
          {
            id: 'duration',
            type: 'choice',
            label: 'Duração dos cortes',
            options: [
              { value: '15s', label: '15 segundos' },
              { value: '30s', label: '30 segundos' },
              { value: '60s', label: '60 segundos' },
            ],
          },
          { ...ratio, default: '9:16' } as FlowField,
          { id: 'captions', type: 'toggle', label: 'Legendas animadas', desc: 'Texto na tela acompanhando a fala.', default: true },
          { id: 'qty', type: 'count', label: 'Quantidade de cortes', min: 1, max: 4, default: 3 },
        ],
      },
    ],
  },
}
