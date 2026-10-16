import cIaGenerativa from '../assets/academy/ia-generativa.webp'
import cAdvogados from '../assets/academy/advogados.webp'
import cImagens from '../assets/academy/imagens.webp'
import cAws from '../assets/academy/aws.webp'
import cNegocios from '../assets/academy/negocios.webp'
import cAutodesenvolvimento from '../assets/academy/autodesenvolvimento.webp'
import cGestao from '../assets/academy/gestao.webp'
import cPratica from '../assets/academy/pratica.webp'
import cMarketing from '../assets/academy/marketing.webp'
import cConhecendo from '../assets/academy/conhecendo.webp'
import lInner from '../assets/academy/speakers/inner-ai.png'
import lMachado from '../assets/academy/speakers/machado-meyer.png'
import lFotografo from '../assets/academy/speakers/fotografo.png'
import lAws from '../assets/academy/speakers/aws.png'
import lExame from '../assets/academy/speakers/exame.png'
import lSebrae from '../assets/academy/speakers/sebrae.png'
import lRecord from '../assets/academy/speakers/record.png'
import lNetflix from '../assets/academy/speakers/netflix.png'
import lUsp from '../assets/academy/speakers/usp.png'
import lMlabs from '../assets/academy/speakers/mlabs.png'

/* Educação (Inner Academy): cursos, instrutores e aulas de exemplo. */

/* logo: marca da empresa ao lado do nome (imagens da Academy) */
export type Instructor = { name: string; org: string; logo?: string }
export type Lesson = { id: string; title: string; dur: string }
export type Module = { title: string; lessons: Lesson[] }
export type Course = {
  id: string
  title: string
  desc: string
  cover: string
  lessons: number
  level: 'Iniciante' | 'Especializado'
  certificate: boolean
  instructors: Instructor[]
  /* selo no canto da capa (ex.: "Comece aqui", "Exame") */
  badge?: string
}

export const COURSES: Course[] = [
  {
    id: 'ia-generativa',
    title: 'Dominando a IA Generativa',
    desc: 'Explore desde os conceitos básicos até as aplicações mais avançadas da Inteligência Artificial e aprenda a usar as melhores ferramentas de forma eficiente e segura.',
    cover: cIaGenerativa,
    lessons: 18,
    level: 'Iniciante',
    certificate: true,
    instructors: [{ name: 'Pedro Salles', org: 'Inner AI', logo: lInner }],
  },
  {
    id: 'advogados',
    title: 'IA para Advogados',
    desc: 'Aprenda a usar IA para organizar casos, analisar documentos, estruturar peças, revisar contratos e pesquisar jurisprudência com mais agilidade, sem abrir mão do julgamento profissional.',
    cover: cAdvogados,
    lessons: 27,
    level: 'Especializado',
    certificate: true,
    instructors: [{ name: 'Savio Andrade', org: 'Machado Meyer', logo: lMachado }],
  },
  {
    id: 'imagens',
    title: 'IA para Imagens',
    desc: 'Aprenda com um fotógrafo como usar IA para criar imagens de alto impacto para iniciativas criativas ou para negócios.',
    cover: cImagens,
    lessons: 15,
    level: 'Especializado',
    certificate: true,
    instructors: [{ name: 'Renan Benedito', org: 'Fotógrafo', logo: lFotografo }],
  },
  {
    id: 'aws',
    title: 'IA para Programadores com a AWS',
    desc: 'Aprenda com especialistas da Amazon Web Services como usar inteligência artificial para transformar seus projetos e se destacar no mercado de tecnologia.',
    cover: cAws,
    lessons: 16,
    level: 'Especializado',
    certificate: true,
    instructors: [
      { name: 'Rodrigo Faria', org: 'AWS', logo: lAws },
      { name: 'Evandro Franco', org: 'AWS', logo: lAws },
    ],
  },
  {
    id: 'negocios',
    title: 'IA para Negócios',
    desc: 'Transforme sua carreira em 3 aulas: domine ferramentas de IA, lidere projetos estratégicos e crie oportunidades.',
    cover: cNegocios,
    lessons: 3,
    level: 'Especializado',
    certificate: false,
    instructors: [
      { name: 'Miguel Lannes', org: 'Exame', logo: lExame },
      { name: 'Izabella Anholett', org: 'Exame', logo: lExame },
    ],
    badge: 'Exame',
  },
  {
    id: 'autodesenvolvimento',
    title: 'Autodesenvolvimento com IA',
    desc: 'Aprenda como aplicar IA para aprimorar habilidades comportamentais e acelerar seu crescimento pessoal e profissional.',
    cover: cAutodesenvolvimento,
    lessons: 12,
    level: 'Especializado',
    certificate: true,
    instructors: [{ name: 'Kauana Yrina', org: 'Sebrae', logo: lSebrae }],
  },
  {
    id: 'gestao',
    title: 'IA para Gestão de Negócios',
    desc: 'Domine técnicas de IA para otimizar processos, tomar decisões estratégicas e impulsionar resultados em um mercado cada vez mais competitivo.',
    cover: cGestao,
    lessons: 20,
    level: 'Especializado',
    certificate: true,
    instructors: [{ name: 'Aline Sordili', org: 'Record', logo: lRecord }],
  },
  {
    id: 'pratica',
    title: 'IA na prática',
    desc: 'Descubra como entender e aplicar a Inteligência Artificial no seu dia a dia para melhorar sua produtividade e tomar decisões informadas.',
    cover: cPratica,
    lessons: 22,
    level: 'Iniciante',
    certificate: true,
    instructors: [
      { name: 'Jotagá Crema', org: 'Netflix', logo: lNetflix },
      { name: 'Luli Radfahrer', org: 'USP', logo: lUsp },
    ],
  },
  {
    id: 'marketing',
    title: 'IA para Marketing',
    desc: 'Aprenda como usar a Inteligência Artificial para revolucionar seus resultados de marketing com criativos profissionais e conteúdos de alta performance para redes sociais.',
    cover: cMarketing,
    lessons: 33,
    level: 'Especializado',
    certificate: true,
    instructors: [{ name: 'Thaís Cardoso', org: 'mLabs', logo: lMlabs }],
  },
  {
    id: 'conhecendo',
    title: 'Conhecendo as IAs',
    desc: 'Descubra como entender os diferentes modelos de Inteligência Artificial e suas aplicações com conceitos fundamentais e casos de sucesso em diversas áreas.',
    cover: cConhecendo,
    lessons: 40,
    level: 'Iniciante',
    certificate: false,
    instructors: [
      { name: 'Marcello Beer', org: 'Inner AI', logo: lInner },
      { name: 'Diogo Bernardelli', org: 'Inner AI', logo: lInner },
    ],
  },
]

/* módulos e aulas de um curso (protótipo): títulos genéricos distribuídos
   pelo número de aulas do curso */
const MODULE_NAMES = ['Primeiros passos', 'Fundamentos', 'Na prática', 'Casos reais', 'Indo além']
const LESSON_NAMES = [
  'Boas-vindas e o que você vai aprender',
  'Como a IA funciona, sem mistério',
  'Escrevendo bons prompts',
  'Escolhendo o modelo certo',
  'Organizando o contexto',
  'Exercício guiado',
  'Erros comuns e como evitar',
  'Automatizando tarefas do dia a dia',
  'Estudo de caso',
  'Medindo resultados',
  'Boas práticas de segurança',
  'Próximos passos',
]
export function modulesOf(c: Course): Module[] {
  const perModule = Math.max(2, Math.ceil(c.lessons / Math.min(5, Math.ceil(c.lessons / 3))))
  const mods: Module[] = []
  for (let i = 0; i < c.lessons; i += perModule) {
    const m = mods.length
    mods.push({
      title: MODULE_NAMES[m % MODULE_NAMES.length],
      lessons: Array.from({ length: Math.min(perModule, c.lessons - i) }, (_, k) => {
        const n = i + k
        return { id: `${c.id}-${n}`, title: n === 0 ? LESSON_NAMES[0] : LESSON_NAMES[1 + ((n - 1) % (LESSON_NAMES.length - 1))], dur: `${6 + ((n * 7) % 13)}:${String((n * 17) % 60).padStart(2, '0')}` }
      }),
    })
  }
  return mods
}

/* aulas concluídas (vale para a sessão toda) */
export const progressMemo: Record<string, Set<string>> = {}
