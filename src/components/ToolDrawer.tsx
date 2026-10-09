import { useEffect, useState } from 'react'
import { ChevronRight, ImagePlus, X } from 'lucide-react'
import creditsCoin from '../assets/credits.svg'
import type { Tool } from './ImagesPage'

/* ---------- Campos dinâmicos por template ---------- */
type Field =
  | { type: 'file'; label: string; required: boolean; sub: string }
  | { type: 'textarea'; label: string; required: boolean; sub: string; placeholder: string }
  | { type: 'pills'; label: string; required: boolean; sub: string; options: string[] }

const TOOL_FIELDS: Record<string, Field[]> = {
  'remove-background': [
    { type: 'file', label: 'Imagem', required: true, sub: 'Envie a imagem para remover o fundo. Apenas imagens.' },
  ],
  'generate-cartoon': [
    { type: 'file', label: 'Imagem', required: true, sub: 'Envie a foto que vira cartoon. Apenas imagens.' },
  ],
  'clothing-shoot': [
    { type: 'file', label: 'Imagem do modelo', required: true, sub: 'Foto da pessoa que vai "vestir" a peça.' },
    { type: 'file', label: 'Imagem da roupa', required: true, sub: 'Imagem da peça de roupa a aplicar.' },
    {
      type: 'pills',
      label: 'Tipo da roupa',
      required: true,
      sub: 'Escolha a categoria da peça.',
      options: ['Parte de cima', 'Parte de baixo', 'Peça única'],
    },
  ],
  'image-editing': [
    { type: 'file', label: 'Imagem', required: true, sub: 'Envie a imagem que deseja editar. Apenas imagens.' },
    {
      type: 'textarea',
      label: 'O que você quer editar?',
      required: true,
      sub: 'Descreva o ajuste: remover objeto, trocar fundo, adicionar texto...',
      placeholder: 'Digite aqui...',
    },
  ],
  'photo-restoration': [
    { type: 'file', label: 'Foto antiga', required: true, sub: 'Envie a foto danificada ou desbotada. Apenas imagens.' },
  ],
  'linkedin-photo': [
    { type: 'file', label: 'Sua foto', required: true, sub: 'Envie uma selfie ou retrato. Apenas imagens.' },
    {
      type: 'pills',
      label: 'Estilo',
      required: true,
      sub: 'Escolha o visual do retrato.',
      options: ['Corporativo', 'Casual', 'Criativo'],
    },
  ],
  'image-from-image': [
    { type: 'file', label: 'Imagem de referência', required: true, sub: 'A imagem base que guia a geração. Apenas imagens.' },
    {
      type: 'textarea',
      label: 'Descrição',
      required: true,
      sub: 'Descreva a nova imagem que você quer gerar.',
      placeholder: 'Digite aqui...',
    },
  ],
  'change-background': [
    { type: 'file', label: 'Imagem', required: true, sub: 'Envie a imagem para trocar o fundo. Apenas imagens.' },
    {
      type: 'textarea',
      label: 'Novo fundo',
      required: false,
      sub: 'Descreva o fundo desejado (opcional).',
      placeholder: 'Ex: praia ao pôr do sol...',
    },
  ],
}

const DEFAULT_FIELDS: Field[] = [
  { type: 'file', label: 'Imagem', required: true, sub: 'Envie uma imagem. Apenas imagens.' },
]

/* modelo pré-populado aleatoriamente (último campo, presente em todos) */
const MODELS = ['Nano Banana 2', 'Nano Banana Pro', 'Flux Schnell 1.0', 'GPT Image 2', 'Playground 2.5', 'Magnific']

const CREDITS = 40

type UploadedFile = { name: string; url: string }

export default function ToolDrawer({ tool, onGenerate }: { tool: Tool; onGenerate: () => void }) {
  const fields = TOOL_FIELDS[tool.id] ?? DEFAULT_FIELDS
  const [files, setFiles] = useState<Record<number, UploadedFile>>({})
  const [texts, setTexts] = useState<Record<number, string>>({})
  const [pills, setPills] = useState<Record<number, string>>({})
  const [model] = useState(() => MODELS[Math.floor(Math.random() * MODELS.length)])

  /* libera os object URLs ao desmontar */
  useEffect(() => {
    return () => {
      Object.values(files).forEach((f) => URL.revokeObjectURL(f.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pickFile = (i: number, f?: File | null) => {
    if (!f) return
    setFiles((prev) => {
      if (prev[i]) URL.revokeObjectURL(prev[i].url)
      return { ...prev, [i]: { name: f.name, url: URL.createObjectURL(f) } }
    })
  }
  const removeFile = (i: number) =>
    setFiles((prev) => {
      const next = { ...prev }
      if (next[i]) URL.revokeObjectURL(next[i].url)
      delete next[i]
      return next
    })

  /* protótipo: botão Gerar sempre ativo (com glow), só para demonstrar */
  const ready = true

  return (
    <>
      <div className="ip-tool-scroll">
      <div className="ip-tool-intro">
        <h2 className="ip-tool-intro-title">{tool.title}</h2>
        <p className="ip-tool-intro-desc">{tool.desc}</p>
      </div>

      {fields.map((f, i) => (
        <div className="ip-tf" key={i}>
          {f.type === 'file' &&
            (files[i] ? (
              <div className="ip-tf-file">
                <img src={files[i].url} alt="" />
                <span className="ip-tf-file-name">{files[i].name}</span>
                <button
                  type="button"
                  className="ip-tf-file-x"
                  aria-label="Remover arquivo"
                  onClick={() => removeFile(i)}
                >
                  <X size={14} strokeWidth={2.2} />
                </button>
              </div>
            ) : (
              <label className="ip-tf-upload">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => pickFile(i, e.target.files?.[0])}
                />
                <span className="ip-tf-upload-ic" aria-hidden="true">
                  <ImagePlus size={22} strokeWidth={1.8} />
                </span>
                <span className="ip-tf-upload-label">{f.label}</span>
                <span className="ip-tf-upload-hint">Apenas imagens</span>
              </label>
            ))}

          {f.type === 'textarea' && (
            <textarea
              className="ip-tf-textarea"
              placeholder={f.label}
              value={texts[i] ?? ''}
              onChange={(e) => setTexts((p) => ({ ...p, [i]: e.target.value }))}
              spellCheck={false}
            />
          )}

          {f.type === 'pills' && (
            <>
              <span className="ip-tf-label">{f.label}</span>
              <div className="ip-tf-pills">
                {f.options.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={`ip-tf-pill${pills[i] === opt ? ' is-active' : ''}`}
                    onClick={() => setPills((p) => ({ ...p, [i]: opt }))}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Modelo — presente em todos, pré-populado (sem ícone) */}
      <div className="ip-tf">
        <span className="ip-tf-label">Modelo</span>
        <button type="button" className="ip-tf-model">
          <span className="ip-tf-model-name">{model}</span>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
      </div>

      <div className="ip-tool-foot">
        <button
          type="button"
          className={`ip-tool-gen${ready ? ' is-ready' : ''}`}
          disabled={!ready}
          onClick={ready ? onGenerate : undefined}
        >
          Gerar
          <span className="ip-tool-gen-cost">
            <img src={creditsCoin} alt="" aria-hidden="true" />
            {CREDITS}
          </span>
        </button>
      </div>
    </>
  )
}
