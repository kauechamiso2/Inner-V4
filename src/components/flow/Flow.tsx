import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowLeft, AudioLines, Check, ChevronDown, Download, FileText, Film, ImagePlus, Pause, Play, Presentation, RotateCcw, X } from 'lucide-react'
import creditsCoin from '../../assets/credits.svg'
import { ImageModelLogo, ImageModelMenu } from '../ImageModelPicker'
import type { ImageModel } from '../imageModels'
import './flow.css'
import SlideView from '../SlideView'
import type { Deck } from '../slideFlows'
import { fitDeck } from '../slideFlows'
import pCyber from '../../assets/masonry/char-cyber.webp'
import pDesert from '../../assets/masonry/landscape-desert.webp'
import pInterior from '../../assets/masonry/interior-minimal.webp'
import pLake from '../../assets/masonry/landscape-lake.webp'

/* ===================================================================
   Flow (design system): experiência em etapas para gerar algo com uma
   ferramenta. Coluna à esquerda com a ferramenta, o modelo e as etapas
   ("Especificações"); à direita o formulário da etapa atual e, no rodapé,
   os créditos com "Próximo passo" (ou "Gerar" na última etapa).
   Tudo é configurado por dados: etapas -> campos.
   =================================================================== */

export type FlowOption = { value: string; label: string; hint?: string; img?: string }

/* tópicos extras abaixo da descrição (ex.: "Tamanho máximo: 10MB") e um
   exemplo em itálico ("Exemplo: ...") */
type FieldExtras = { details?: [string, string][]; example?: string }

export type FlowField = (
  | { id: string; type: 'textarea'; label: string; desc?: string; required?: boolean; placeholder?: string; maxLength?: number }
  | { id: string; type: 'upload'; label: string; desc?: string; required?: boolean; accept: 'image' | 'video' | 'audio' | 'media' }
  | { id: string; type: 'choice'; label: string; desc?: string; required?: boolean; options: FlowOption[]; default?: string }
  | { id: string; type: 'cards'; label: string; desc?: string; required?: boolean; options: FlowOption[] }
  | { id: string; type: 'toggle'; label: string; desc?: string; default?: boolean }
  | { id: string; type: 'count'; label: string; desc?: string; min: number; max: number; default?: number }
  /* personagens: card horizontal com nome e foto (com play de prévia) */
  | { id: string; type: 'avatars'; label: string; desc?: string; required?: boolean; options: FlowOption[] }
  /* vozes: pill com o nome e um play que toca a prévia */
  | { id: string; type: 'voices'; label: string; desc?: string; required?: boolean; options: FlowOption[] }
) &
  FieldExtras

/* summary: campo cujo valor escolhido aparece embaixo do nome da etapa (ex.: "Normal") */
export type FlowStep = { id: string; label: string; fields: FlowField[]; summary?: string }

export type FlowConfig = {
  title: string
  desc: string
  steps: FlowStep[]
  /* o que vem pronto ao final (ex.: "vídeo", "transcrição") */
  output: 'video' | 'text' | 'audio' | 'doc' | 'slides'
  /* resultado em documento: título e blocos (linhas com "## " viram subtítulo) */
  doc?: { title: string; blocks: string[] }
  /* resultado em slides: deck de exemplo do template */
  deck?: Deck
  /* modelos do template (quando diferente da lista do pilar) e o inicial */
  models?: ImageModel[]
  initialModel?: string
  /* créditos fixos por execução; null esconde (sem custo mostrado) */
  credits?: number | null
  /* rótulo do botão da última etapa (padrão: "Gerar") */
  submitLabel?: string
}

type Values = Record<string, string | boolean | number | undefined>
type Upload = { name: string; url: string }

const FIELD_FILLED = (f: FlowField, v: Values, uploads: Record<string, Upload>) => {
  if (f.type === 'upload') return !!uploads[f.id]
  if (f.type === 'toggle' || f.type === 'count') return true
  const val = v[f.id]
  return typeof val === 'string' ? val.trim().length > 0 : val !== undefined
}

export default function Flow({
  config,
  models,
  initialModel,
  autoName,
  onClose,
  onDone,
  initialValues,
  onOpenDoc,
  onOpenAudio,
  onOpenSlides,
}: {
  /* slides prontos: abre no modal de apresentação */
  onOpenSlides?: (r: { title: string; prompt: string; model: string; template: string; deck: Deck; index?: number }) => void
  /* áudio/transcrição pronto: abre no modal de áudio (i = qual resultado) */
  onOpenAudio?: (r: { i: number; title: string; prompt: string; model: string; template: string; voice?: string; dur: number }) => void
  /* documento pronto: abre no modal de documento (Documentos) */
  onOpenDoc?: (doc: { title: string; blocks: string[]; prompt: string; model: string; template: string }) => void
  /* campos já preenchidos (ex.: "Regerar" a partir do histórico) */
  initialValues?: Record<string, string>
  config: FlowConfig
  models: ImageModel[]
  initialModel: string
  /* modelo que o "Automático" está usando */
  autoName?: string
  onClose: () => void
  /* geração concluída (ex.: entra no histórico) */
  onDone?: (summary: { title: string; model: string }) => void
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [values, setValues] = useState<Values>(() => {
    const v: Values = {}
    config.steps.forEach((s) =>
      s.fields.forEach((f) => {
        if (f.type === 'choice' && f.default) v[f.id] = f.default
        if (f.type === 'toggle') v[f.id] = f.default ?? false
        if (f.type === 'count') v[f.id] = f.default ?? f.min
      }),
    )
    return { ...v, ...initialValues }
  })
  const [uploads, setUploads] = useState<Record<string, Upload>>({})
  const flowModels = config.models ?? models
  const [modelId, setModelId] = useState(config.initialModel ?? initialModel)
  const [modelAnchor, setModelAnchor] = useState<HTMLElement | null>(null)
  /* depois do "Gerar": gerando -> pronto */
  const [phase, setPhase] = useState<'form' | 'running' | 'done'>('form')
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const model = flowModels.find((m) => m.id === modelId) ?? flowModels[0]
  const modelName = model.name === 'Automático' && autoName ? autoName : model.name
  const step = config.steps[stepIdx]
  const isLast = stepIdx === config.steps.length - 1
  const stepDone = (s: FlowStep) => s.fields.every((f) => !('required' in f && f.required) || FIELD_FILLED(f, values, uploads))
  const canNext = stepDone(step)
  const qty = Number(values.qty ?? 1)
  /* null: o template não mostra custo */
  const credits = config.credits === null ? null : (config.credits ?? model.credits) * qty

  const set = (id: string, v: string | boolean | number) => setValues((p) => ({ ...p, [id]: v }))
  /* rótulo da opção escolhida num campo (resumo da etapa na coluna) */
  const summaryOf = (fieldId: string) => {
    const f = config.steps.flatMap((x) => x.fields).find((x) => x.id === fieldId)
    const v = values[fieldId]
    if (!f || v === undefined) return null
    if ('options' in f) return f.options.find((o) => o.value === v)?.label ?? null
    return String(v)
  }
  const next = () => {
    if (!canNext) return
    if (!isLast) {
      setStepIdx((i) => i + 1)
      return
    }
    setPhase('running')
    timers.current.push(
      window.setTimeout(() => {
        setPhase('done')
        onDone?.({ title: String(values.prompt ?? values.script ?? config.title).slice(0, 60), model: modelName })
      }, 3600),
    )
    /* documento: o resultado abre direto no modal */
    if (config.output === 'doc' && onOpenDoc) timers.current.push(window.setTimeout(openDoc, 3600 + 450))
    if (config.output === 'slides' && onOpenSlides) timers.current.push(window.setTimeout(() => openSlides(0), 3600 + 450))
    if ((config.output === 'audio' || config.output === 'text') && onOpenAudio)
      timers.current.push(window.setTimeout(() => openAudio(0), 3600 + 450))
  }
  const openSlides = (index: number) => {
    if (!config.deck || !onOpenSlides) return
    onOpenSlides({
      title: String(values.prompt ?? '').trim().slice(0, 60) || config.title,
      prompt: String(values.prompt ?? '').trim() || config.title,
      model: modelName,
      template: config.title,
      deck: fitDeck(config.deck, Number(values.pages ?? 0)),
      index,
    })
  }
  const openAudio = (i: number) => {
    if (!onOpenAudio) return
    const voiceField = config.steps.flatMap((x) => x.fields).find((f) => f.type === 'voices')
    const voice = voiceField && 'options' in voiceField ? voiceField.options.find((o) => o.value === values.voice)?.label : undefined
    const file = Object.values(uploads)[0]?.name
    onOpenAudio({
      i,
      title: config.output === 'text' ? `Transcrição: ${file ?? 'arquivo'}` : RESULT_TITLE(values, config.title),
      prompt: config.output === 'text' ? (file ?? 'arquivo.mp3') : String(values.text ?? values.prompt ?? config.title),
      model: modelName,
      template: config.title,
      voice,
      dur: config.output === 'text' ? 26 : 12 + i * 7,
    })
  }
  const openDoc = () => {
    if (!config.doc || !onOpenDoc) return
    onOpenDoc({
      ...config.doc,
      prompt: String(values.prompt ?? '').trim() || config.title,
      model: modelName,
      template: config.title,
    })
  }
  const restart = () => {
    setPhase('form')
    setStepIdx(0)
  }

  /* proporção escolhida (para o quadro do resultado) */
  const ratio = String(values.ratio ?? '16:9')
  const [rw, rh] = ratio.split(':').map(Number)

  return (
    <div className="flow" role="region" aria-label={config.title}>
      {/* ---------- coluna da ferramenta ---------- */}
      <aside className="flow-side">
        <button type="button" className="flow-close" aria-label="Fechar" onClick={onClose}>
          <X size={18} strokeWidth={2} />
        </button>

        <section className="flow-tool">
          <h2 className="flow-tool-title">{config.title}</h2>
          <p className="flow-tool-desc">{config.desc}</p>
          <span className="flow-label">Modelo</span>
          <button
            type="button"
            className={`flow-model${modelAnchor ? ' is-open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={!!modelAnchor}
            disabled={phase !== 'form'}
            onClick={(e) => {
              const el = e.currentTarget
              setModelAnchor((a) => (a ? null : el))
            }}
          >
            <ImageModelLogo model={model} size={22} />
            <span className="flow-model-name">
              {model.name}
              {model.name === 'Automático' && autoName && <span className="flow-model-auto">{autoName}</span>}
            </span>
            <ChevronDown className="flow-model-caret" size={15} strokeWidth={2} />
          </button>
          {modelAnchor && (
            <ImageModelMenu
              anchor={modelAnchor}
              selected={modelId}
              models={flowModels}
              autoName={autoName}
              onSelect={setModelId}
              onClose={() => setModelAnchor(null)}
            />
          )}
        </section>

        <span className="flow-label flow-steps-label">Especificações</span>
        <ol className="flow-steps">
          {config.steps.map((s, i) => {
            const done = i < stepIdx || phase !== 'form'
            const current = i === stepIdx && phase === 'form'
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`flow-step${current ? ' is-current' : ''}${done ? ' is-done' : ''}`}
                  disabled={phase !== 'form' || (i > stepIdx && !config.steps.slice(0, i).every(stepDone))}
                  onClick={() => setStepIdx(i)}
                  aria-current={current ? 'step' : undefined}
                >
                  <span className="flow-step-dot" aria-hidden="true">
                    {done && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="flow-step-text">
                    {s.label}
                    {s.summary && summaryOf(s.summary) && <span className="flow-step-sum">{summaryOf(s.summary)}</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </aside>

      {/* ---------- etapa atual / geração / resultado ---------- */}
      <section className="flow-main">
        {phase === 'form' ? (
          <div className="flow-body" key={step.id}>
            {step.fields.map((f) => (
              <FieldView
                key={f.id}
                field={f}
                value={values[f.id]}
                upload={uploads[f.id]}
                onChange={(v) => set(f.id, v)}
                onUpload={(u) => setUploads((p) => ({ ...p, [f.id]: u }))}
                onRemoveUpload={() =>
                  setUploads((p) => {
                    const n = { ...p }
                    delete n[f.id]
                    return n
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flow-result" key={phase}>
            <h2 className="flow-result-title">{phase === 'running' ? 'Gerando...' : 'Pronto!'}</h2>
            <p className="flow-result-sub">
              {phase === 'running'
                ? `${config.title} com ${modelName}. Isso leva alguns segundos.`
                : 'Também está salvo no seu histórico.'}
            </p>
            {config.output === 'slides' ? (
              <div className="flow-slides">
                {(config.deck?.slides ?? []).slice(0, 4).map((sl, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`flow-slide${phase === 'running' ? ' is-running' : ''}`}
                    style={{ '--i': i } as CSSProperties}
                    disabled={phase !== 'done'}
                    onClick={() => openSlides(i)}
                    aria-label={`Abrir slide ${i + 1}`}
                  >
                    {phase === 'done' && config.deck && <SlideView slide={sl} theme={config.deck.theme} />}
                  </button>
                ))}
              </div>
            ) : config.output === 'doc' ? (
              <article
                className={`flow-doc${phase === 'running' ? ' is-running' : ''}${phase === 'done' && onOpenDoc ? ' is-openable' : ''}`}
                onClick={phase === 'done' ? openDoc : undefined}
              >
                {phase === 'done' && config.doc ? (
                  <>
                    <h3 className="flow-doc-title">{config.doc.title}</h3>
                    {config.doc.blocks.map((b, i) =>
                      b.startsWith('## ') ? (
                        <h4 key={i} style={{ '--i': i } as CSSProperties}>
                          {b.slice(3)}
                        </h4>
                      ) : (
                        <p key={i} style={{ '--i': i } as CSSProperties}>
                          {b}
                        </p>
                      ),
                    )}
                  </>
                ) : (
                  <>
                    <span className="flow-text-line is-title" />
                    <span className="flow-text-line" />
                    <span className="flow-text-line" />
                    <span className="flow-text-line is-short" />
                    <span className="flow-text-line" />
                    <span className="flow-text-line is-short" />
                  </>
                )}
              </article>
            ) : config.output === 'audio' ? (
              <div className="flow-audios">
                {Array.from({ length: qty }, (_, i) => (
                  <AudioResult
                    key={i}
                    i={i}
                    running={phase === 'running'}
                    title={RESULT_TITLE(values, config.title)}
                    onOpen={phase === 'done' && onOpenAudio ? () => openAudio(i) : undefined}
                  />
                ))}
              </div>
            ) : config.output === 'video' ? (
              <div className="flow-result-grid" style={{ '--cols': Math.min(qty, 2) } as CSSProperties}>
                {Array.from({ length: qty }, (_, i) => (
                  <div
                    key={i}
                    className={`flow-video${phase === 'running' ? ' is-running' : ''}`}
                    style={{ aspectRatio: `${rw || 16} / ${rh || 9}`, '--i': i } as CSSProperties}
                  >
                    {phase === 'done' && (
                      <>
                        <img src={RESULT_POSTERS[i % RESULT_POSTERS.length]} alt="" />
                        <span className="flow-video-play" aria-hidden="true">
                          <Play size={18} strokeWidth={0} fill="currentColor" />
                        </span>
                        <span className="flow-video-dur">{String(values.duration ?? '0:05').replace(/(\d+)s/, '0:$1')}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`flow-text${phase === 'running' ? ' is-running' : ''}${phase === 'done' && onOpenAudio ? ' is-openable' : ''}`}
                onClick={phase === 'done' && onOpenAudio ? () => openAudio(0) : undefined}
              >
                {phase === 'done' ? (
                  TRANSCRIPT.map((l) => (
                    <p key={l.t}>
                      <span className="flow-text-time">{l.t}</span>
                      {l.text}
                    </p>
                  ))
                ) : (
                  <>
                    <span className="flow-text-line" />
                    <span className="flow-text-line" />
                    <span className="flow-text-line is-short" />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <footer className="flow-foot">
          {phase === 'form' ? (
            <>
              {stepIdx > 0 && (
                <button type="button" className="flow-back" onClick={() => setStepIdx((i) => i - 1)}>
                  <ArrowLeft size={15} strokeWidth={2} />
                  Voltar
                </button>
              )}
              {credits !== null && (
                <span className="flow-credits" title={`${credits} créditos`}>
                  <img src={creditsCoin} alt="" aria-hidden="true" />
                  {credits}
                </span>
              )}
              <button type="button" className={`flow-next${isLast ? ' is-gen' : ''}`} disabled={!canNext} onClick={next}>
                {isLast ? (config.submitLabel ?? 'Gerar') : 'Próximo passo'}
              </button>
            </>
          ) : phase === 'done' ? (
            <>
              <button type="button" className="flow-back" onClick={restart}>
                <RotateCcw size={15} strokeWidth={2} />
                Editar e gerar de novo
              </button>
              {config.output === 'slides' && onOpenSlides ? (
                <button type="button" className="flow-next" onClick={() => openSlides(0)}>
                  <Presentation size={15} strokeWidth={2} />
                  Abrir apresentação
                </button>
              ) : (config.output === 'audio' || config.output === 'text') && onOpenAudio ? (
                <button type="button" className="flow-next" onClick={() => openAudio(0)}>
                  {config.output === 'text' ? <FileText size={15} strokeWidth={2} /> : <AudioLines size={15} strokeWidth={2} />}
                  {config.output === 'text' ? 'Abrir transcrição' : 'Abrir áudio'}
                </button>
              ) : config.output === 'doc' && onOpenDoc ? (
                <button type="button" className="flow-next" onClick={openDoc}>
                  <FileText size={15} strokeWidth={2} />
                  Abrir documento
                </button>
              ) : (
                <button type="button" className="flow-next">
                  <Download size={15} strokeWidth={2} />
                  Baixar
                </button>
              )}
            </>
          ) : (
            <span className="flow-running-note">Você pode fechar: o resultado fica no histórico.</span>
          )}
        </footer>
      </section>
    </div>
  )
}

/* ---------- campos ---------- */
const ACCEPT = { image: 'image/*', video: 'video/*', audio: 'audio/*', media: 'audio/*,video/*' }
const ACCEPT_HINT = {
  image: 'JPEG, PNG, GIF ou WEBP',
  video: 'MP4, MOV ou WEBM',
  audio: 'MP3, WAV ou M4A',
  media: 'Áudio (MP3, WAV) ou vídeo (MP4, MOV)',
}
function FieldHead({
  label,
  desc,
  required,
  details,
  example,
}: {
  label: string
  desc?: string
  required?: boolean
  details?: [string, string][]
  example?: string
}) {
  return (
    <div className="flow-field-head">
      <span className="flow-field-label">
        {label}
        {required && <span className="flow-req">Obrigatório</span>}
      </span>
      {desc && <p className="flow-field-desc">{desc}</p>}
      {example && (
        <p className="flow-field-example">
          <strong>Exemplo:</strong> <em>{example}</em>
        </p>
      )}
      {details && (
        <ul className="flow-field-details">
          {details.map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong> {v}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FieldView({
  field: f,
  value,
  upload,
  onChange,
  onUpload,
  onRemoveUpload,
}: {
  field: FlowField
  value: string | boolean | number | undefined
  upload?: Upload
  onChange: (v: string | boolean | number) => void
  onUpload: (u: Upload) => void
  onRemoveUpload: () => void
}) {
  const required = 'required' in f ? f.required : false
  let body: ReactNode = null
  if (f.type === 'textarea') {
    const text = String(value ?? '')
    body = (
      <>
        <textarea
          className="flow-textarea"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder ?? 'Digite seu texto aqui'}
          maxLength={f.maxLength}
          spellCheck={false}
          autoFocus
        />
        {f.maxLength && (
          <span className={`flow-counter${text.length >= f.maxLength ? ' is-max' : ''}`}>
            {text.length}/{f.maxLength}
          </span>
        )}
      </>
    )
  } else if (f.type === 'upload') {
    body = upload ? (
      <div className="flow-upload-file">
        {f.accept === 'image' ? (
          <img src={upload.url} alt="" />
        ) : f.accept === 'audio' ? (
          <span className="flow-upload-audio" aria-hidden="true">
            <AudioLines size={20} strokeWidth={1.9} />
          </span>
        ) : (
          <video src={upload.url} muted playsInline />
        )}
        <span className="flow-upload-name">{upload.name}</span>
        <button type="button" className="flow-upload-x" aria-label="Remover arquivo" onClick={onRemoveUpload}>
          <X size={14} strokeWidth={2.2} />
        </button>
      </div>
    ) : (
      <label className="flow-upload">
        <input
          type="file"
          accept={ACCEPT[f.accept]}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload({ name: file.name, url: URL.createObjectURL(file) })
            e.target.value = ''
          }}
        />
        <span className="flow-upload-ic" aria-hidden="true">
          {f.accept === 'image' ? (
            <ImagePlus size={22} strokeWidth={1.8} />
          ) : f.accept === 'audio' ? (
            <AudioLines size={22} strokeWidth={1.8} />
          ) : (
            <Film size={22} strokeWidth={1.8} />
          )}
        </span>
        <span className="flow-upload-title">Clique para enviar ou arraste aqui</span>
        <span className="flow-upload-hint">{ACCEPT_HINT[f.accept]}</span>
      </label>
    )
  } else if (f.type === 'choice') {
    body = (
      <div className="flow-choices" role="radiogroup" aria-label={f.label}>
        {f.options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={`flow-choice${value === o.value ? ' is-on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.hint && <span className="flow-choice-hint">{o.hint}</span>}
          </button>
        ))}
      </div>
    )
  } else if (f.type === 'cards') {
    body = (
      <div className="flow-cards" role="radiogroup" aria-label={f.label}>
        {f.options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={`flow-card${value === o.value ? ' is-on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.img && <img src={o.img} alt="" loading="lazy" />}
            <span className="flow-card-text">
              <span className="flow-card-name">{o.label}</span>
              {o.hint && <span className="flow-card-hint">{o.hint}</span>}
            </span>
            {value === o.value && (
              <span className="flow-card-check" aria-hidden="true">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>
    )
  } else if (f.type === 'avatars') {
    body = (
      <div className="flow-avatars" role="radiogroup" aria-label={f.label}>
        {f.options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={`flow-avatar${value === o.value ? ' is-on' : ''}`}
            style={{ '--i': i } as CSSProperties}
            onClick={() => onChange(o.value)}
          >
            <span className="flow-avatar-name">{o.label}</span>
            <span className="flow-avatar-thumb">
              {o.img && <img src={o.img} alt="" loading="lazy" />}
              <span className="flow-avatar-play" aria-hidden="true">
                <Play size={11} strokeWidth={0} fill="currentColor" />
              </span>
            </span>
          </button>
        ))}
      </div>
    )
  } else if (f.type === 'voices') {
    body = <VoiceList options={f.options} value={value as string | undefined} label={f.label} onChange={onChange} />
  } else if (f.type === 'toggle') {
    body = (
      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        className={`flow-toggle${value ? ' is-on' : ''}`}
        onClick={() => onChange(!value)}
      >
        <span className="flow-toggle-knob" />
      </button>
    )
  } else if (f.type === 'count') {
    const n = Number(value ?? f.min)
    body = (
      <div className="flow-count">
        <button type="button" aria-label="Menos" disabled={n <= f.min} onClick={() => onChange(n - 1)}>
          −
        </button>
        <span>{n}</span>
        <button type="button" aria-label="Mais" disabled={n >= f.max} onClick={() => onChange(n + 1)}>
          +
        </button>
      </div>
    )
  }
  return (
    <div className={`flow-field is-${f.type}`}>
      <FieldHead label={f.label} desc={f.desc} required={required} details={f.details} example={f.example} />
      {body}
    </div>
  )
}

/* resultados de exemplo (protótipo) */
const RESULT_POSTERS = [pDesert, pCyber, pInterior, pLake]
export const TRANSCRIPT = [
  { t: '00:00', text: 'Oi, pessoal! Hoje eu vou mostrar como a gente organiza o planejamento da semana.' },
  { t: '00:06', text: 'Primeiro, a gente junta tudo o que ficou pendente num lugar só.' },
  { t: '00:12', text: 'Depois, prioriza pelo impacto e pelo prazo de cada item.' },
  { t: '00:19', text: 'E no fim, cada pessoa sai com as três coisas mais importantes do dia.' },
]

/* vozes: escolher clicando na pill; o play fala uma frase de prévia com a
   voz do navegador (protótipo) e vira "pausar" enquanto toca */
function VoiceList({
  options,
  value,
  label,
  onChange,
}: {
  options: FlowOption[]
  value?: string
  label: string
  onChange: (v: string) => void
}) {
  const [playing, setPlaying] = useState<string | null>(null)
  useEffect(() => () => window.speechSynthesis?.cancel(), [])
  const preview = (o: FlowOption) => {
    const synth = window.speechSynthesis
    if (playing === o.value) {
      synth?.cancel()
      setPlaying(null)
      return
    }
    synth?.cancel()
    setPlaying(o.value)
    if (!synth) {
      window.setTimeout(() => setPlaying(null), 1800)
      return
    }
    const u = new SpeechSynthesisUtterance(`Olá! Eu sou ${o.label}, e posso narrar o seu texto.`)
    u.lang = 'pt-BR'
    u.onend = () => setPlaying((p) => (p === o.value ? null : p))
    synth.speak(u)
  }
  return (
    <div className="flow-voices" role="radiogroup" aria-label={label}>
      {options.map((o, i) => (
        <div
          key={o.value}
          className={`flow-voice${value === o.value ? ' is-on' : ''}${playing === o.value ? ' is-playing' : ''}`}
          style={{ '--i': i } as CSSProperties}
        >
          <button
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className="flow-voice-pick"
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
          <button
            type="button"
            className="flow-voice-play"
            aria-label={playing === o.value ? `Parar prévia de ${o.label}` : `Ouvir ${o.label}`}
            onClick={() => preview(o)}
          >
            {playing === o.value ? <Pause size={15} strokeWidth={0} fill="currentColor" /> : <Play size={15} strokeWidth={0} fill="currentColor" />}
          </button>
        </div>
      ))}
    </div>
  )
}

/* título do resultado em áudio (prompt, texto ou o nome do template) */
const RESULT_TITLE = (v: Record<string, string | boolean | number | undefined>, fallback: string) =>
  String(v.prompt ?? v.text ?? fallback).slice(0, 48) || fallback

/* resultado em áudio: card com play e forma de onda */
function AudioResult({ i, running, title, onOpen }: { i: number; running: boolean; title: string; onOpen?: () => void }) {
  const [on, setOn] = useState(false)
  const bars = Array.from({ length: 56 }, (_, k) => 0.25 + Math.abs(Math.sin(k * 0.55 + i)) * 0.75)
  return (
    <div className={`flow-audio${running ? ' is-running' : ''}${on ? ' is-on' : ''}`} style={{ '--i': i } as CSSProperties}>
      <button
        type="button"
        className="flow-audio-play"
        aria-label={on ? 'Pausar' : 'Ouvir'}
        disabled={running}
        onClick={() => setOn((x) => !x)}
      >
        {on ? <Pause size={16} strokeWidth={0} fill="currentColor" /> : <Play size={16} strokeWidth={0} fill="currentColor" />}
      </button>
      <span
        className={`flow-audio-body${onOpen ? ' is-openable' : ''}`}
        onClick={onOpen}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onKeyDown={onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      >
        <span className="flow-audio-title">{running ? 'Gerando áudio...' : title}</span>
        <span className="flow-audio-wave" aria-hidden="true">
          {bars.map((h, k) => (
            <span key={k} style={{ '--h': h, '--k': k } as CSSProperties} />
          ))}
        </span>
      </span>
      <span className="flow-audio-dur">{running ? '' : `0:${String(12 + i * 7).padStart(2, '0')}`}</span>
    </div>
  )
}
