import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowUp, Check, ChevronDown, ChevronRight, Clock3, Images, Minus, Plus, Search, Upload } from 'lucide-react'
import creditsCoin from '../assets/credits.svg'
import { BarPopover, ImageModelLogo, ImageModelMenu } from './ImageModelPicker'
import { normSearch } from './SearchToggle'
import {
  ASPECT_RATIOS,
  AUTO_MODEL,
  IMAGE_MODELS,
  IMAGE_MODEL_BY_ID,
  LIBRARY_IMAGES,
  RESOLUTIONS,
  setImageSettings,
  useImageSettings,
} from './imageModels'
import type { AspectRatio } from './imageModels'
import {
  VIDEO_AUTO_MODEL,
  VIDEO_DURATIONS,
  VIDEO_MODELS,
  VIDEO_MODEL_BY_ID,
  VIDEO_QUALITIES,
  VIDEO_RATIOS,
  setVideoSettings,
  useVideoSettings,
} from './videoGen'

type PopKind = 'add' | 'ratio' | 'res' | 'model' | 'dur' | 'qual'

/* forma da proporção (retângulo com a razão certa) para o botão e a lista */
function RatioIcon({ ratio, size = 15 }: { ratio: AspectRatio; size?: number }) {
  if (ratio === 'Auto')
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M2.5 5.5v-2a1 1 0 0 1 1-1h2M10.5 2.5h2a1 1 0 0 1 1 1v2M13.5 10.5v2a1 1 0 0 1-1 1h-2M5.5 13.5h-2a1 1 0 0 1-1-1v-2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  const [w, h] = ratio.split(':').map(Number)
  const k = 11 / Math.max(w, h)
  const rw = Math.max(5, w * k)
  const rh = Math.max(5, h * k)
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x={8 - rw / 2} y={8 - rh / 2} width={rw} height={rh} rx="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/* estrela de IA com preenchimento em gradiente que gira devagar; o glow
   pulsante vem via CSS (.ip-spark-svg). A grande + uma pequena no canto. */
function SparkIcon() {
  const gid = `ip-spark-${useId().replace(/:/g, '')}`
  return (
    <svg className="ip-spark-svg" width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 0.5 0.5"
            to="360 0.5 0.5"
            dur="7s"
            repeatCount="indefinite"
          />
          <stop offset="0%" stopColor="#5b8cff" />
          <stop offset="48%" stopColor="#9a6bff" />
          <stop offset="100%" stopColor="#ff79c0" />
        </linearGradient>
      </defs>
      <path
        d="M11.47 3.2a.56.56 0 0 1 1.06 0l1.1 3.43a4 4 0 0 0 2.6 2.6l3.43 1.1a.56.56 0 0 1 0 1.06l-3.43 1.1a4 4 0 0 0-2.6 2.6l-1.1 3.43a.56.56 0 0 1-1.06 0l-1.1-3.43a4 4 0 0 0-2.6-2.6l-3.43-1.1a.56.56 0 0 1 0-1.06l3.43-1.1a4 4 0 0 0 2.6-2.6Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M18.7 3.05a.38.38 0 0 1 .72 0l.4 1.26a1.5 1.5 0 0 0 .98.98l1.26.4a.38.38 0 0 1 0 .72l-1.26.4a1.5 1.5 0 0 0-.98.98l-.4 1.26a.38.38 0 0 1-.72 0l-.4-1.26a1.5 1.5 0 0 0-.98-.98l-1.26-.4a.38.38 0 0 1 0-.72l1.26-.4a1.5 1.5 0 0 0 .98-.98Z"
        fill={`url(#${gid})`}
      />
    </svg>
  )
}

export type BaseAttachment = { uid: string; src: string }

type Props = {
  value: string
  onValueChange: (v: string) => void
  count: number
  onCountChange: (n: number) => void
  /* imagens anexadas como base ("Usar de base") — compartilhadas pelo pai */
  attachments: BaseAttachment[]
  onRemoveAttachment: (uid: string) => void
  /* "+": imagem do computador ou da Biblioteca entra como base */
  onAddBase?: (src: string) => void
  /* dispara a geração (botão "Gerar" ativo) */
  onGenerate: () => void
  /* variante fixada no rodapé (quando o input do topo sai de vista) */
  docked?: boolean
  /* sempre no estado ativo (expandido), ex.: barra das Minhas gerações */
  alwaysOpen?: boolean
  /* foca o campo ao montar / quando muda */
  autoFocusKey?: number
  /* "video": modelos de vídeo, proporção, duração e qualidade */
  variant?: 'image' | 'video'
}

/* Input de prompt do pilar de Imagens: começa como uma barra compacta e,
   ao focar/digitar, expande fluidamente para um input de duas linhas com a
   toolbar (modelo, estilo, proporção, qualidade, quantidade). Controles são
   visuais por enquanto; só o stepper de quantidade é funcional.
   O estado (texto/quantidade) é controlado pelo pai para ser compartilhado
   entre a barra do topo e a barra fixada no rodapé. */
export default function ImagePromptBar({
  value,
  onValueChange,
  count,
  onCountChange,
  attachments,
  onRemoveAttachment,
  onAddBase,
  onGenerate,
  docked = false,
  alwaysOpen = false,
  autoFocusKey,
  variant = 'image',
}: Props) {
  const isVideo = variant === 'video'
  const [focused, setFocused] = useState(false)
  const hasAtt = attachments.length > 0
  /* menus da barra ("+", proporção, resolução) e o modal de modelos; com algum
     aberto, a barra continua expandida mesmo sem foco no texto */
  const [pop, setPop] = useState<{ kind: PopKind; el: HTMLElement } | null>(null)
  const [libOpen, setLibOpen] = useState(false)
  const [libQuery, setLibQuery] = useState('')
  const open = alwaysOpen || focused || value.trim().length > 0 || hasAtt || !!pop
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (autoFocusKey) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocusKey])
  const canGenerate = value.trim().length > 0 || hasAtt
  /* modelo, proporção e resolução (compartilhados com a outra barra) */
  const cfg = useImageSettings()
  const vcfg = useVideoSettings()
  /* imagem x vídeo: mesma barra, listas e configurações diferentes */
  const models = isVideo ? VIDEO_MODELS : IMAGE_MODELS
  const selectedModel = isVideo ? vcfg.model : cfg.model
  const model = isVideo
    ? (VIDEO_MODEL_BY_ID[vcfg.model] ?? VIDEO_MODEL_BY_ID['kling-30'])
    : (IMAGE_MODEL_BY_ID[cfg.model] ?? IMAGE_MODEL_BY_ID['nano-banana-2'])
  const autoName = isVideo ? VIDEO_AUTO_MODEL : AUTO_MODEL
  const ratio = isVideo ? vcfg.ratio : cfg.ratio
  const ratios: readonly string[] = isVideo ? VIDEO_RATIOS : ASPECT_RATIOS
  const setModel = (id: string) => (isVideo ? setVideoSettings({ model: id }) : setImageSettings({ model: id }))
  const setRatio = (r: string) => (isVideo ? setVideoSettings({ ratio: r }) : setImageSettings({ ratio: r as AspectRatio }))
  const fileRef = useRef<HTMLInputElement>(null)
  const toggle = (kind: PopKind) => (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    setLibOpen(false)
    setLibQuery('')
    setPop((p) => (p?.kind === kind ? null : { kind, el }))
  }
  const nlq = normSearch(libQuery)
  const libList = LIBRARY_IMAGES.filter((img) => !nlq || normSearch(img.name).includes(nlq))
  const credits = model.credits * count
  /* depois que a expansão termina, liberamos o overflow para o glow do botão
     "escapar" (durante a animação o overflow fica escondido) */
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!open) {
      setSettled(false)
      return
    }
    const t = window.setTimeout(() => setSettled(true), 340)
    return () => window.clearTimeout(t)
  }, [open])

  return (
    <div
      className={`ip-prompt${open ? ' is-open' : ''}${settled ? ' is-settled' : ''}${
        docked ? ' is-docked' : ''
      }`}
    >
      {hasAtt && (
        <div className="ip-attachments">
          {attachments.map((a) => (
            <span className="att att-image" key={a.uid}>
              <img src={a.src} alt="" />
              <button
                type="button"
                className="att-remove"
                aria-label="Remover imagem base"
                onClick={() => onRemoveAttachment(a.uid)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="ip-prompt-top">
        <span className="ip-prompt-spark" aria-hidden="true">
          <SparkIcon />
        </span>
        <textarea
          ref={inputRef}
          className="ip-prompt-input"
          placeholder={isVideo ? 'Descreva o vídeo que você quer gerar...' : 'Digite o que você quer gerar...'}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && canGenerate) {
              e.preventDefault()
              onGenerate()
            }
          }}
          rows={1}
          spellCheck={false}
        />
      </div>

      <div className="ip-prompt-bar">
        <div className="ip-prompt-ctrls">
          <button
            type="button"
            className={`ip-pc ip-pc-add${pop?.kind === 'add' ? ' is-open' : ''}`}
            aria-label="Adicionar imagem de referência"
            aria-haspopup="menu"
            aria-expanded={pop?.kind === 'add'}
            tabIndex={open ? 0 : -1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle('add')}
          >
            <Plus size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className={`ip-pc ip-pc-drop ip-pc-model${pop?.kind === 'model' ? ' is-open' : ''}`}
            tabIndex={open ? 0 : -1}
            aria-haspopup="menu"
            aria-expanded={pop?.kind === 'model'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle('model')}
          >
            <ImageModelLogo model={model} size={18} />
            {model.name}
            {model.name === 'Automático' && <span className="ip-pc-auto">{autoName}</span>}
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`ip-pc ip-pc-drop${pop?.kind === 'ratio' ? ' is-open' : ''}`}
            tabIndex={open ? 0 : -1}
            aria-label={`Proporção: ${ratio}`}
            aria-haspopup="menu"
            aria-expanded={pop?.kind === 'ratio'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle('ratio')}
          >
            <RatioIcon ratio={ratio as AspectRatio} size={14} />
            {ratio}
          </button>
          {isVideo ? (
            <>
              <button
                type="button"
                className={`ip-pc ip-pc-drop${pop?.kind === 'dur' ? ' is-open' : ''}`}
                tabIndex={open ? 0 : -1}
                aria-label={`Duração: ${vcfg.duration}`}
                aria-haspopup="menu"
                aria-expanded={pop?.kind === 'dur'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggle('dur')}
              >
                <Clock3 size={13} strokeWidth={2.2} />
                {vcfg.duration}
              </button>
              <button
                type="button"
                className={`ip-pc ip-pc-drop${pop?.kind === 'qual' ? ' is-open' : ''}`}
                tabIndex={open ? 0 : -1}
                aria-label={`Qualidade: ${vcfg.quality}`}
                aria-haspopup="menu"
                aria-expanded={pop?.kind === 'qual'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggle('qual')}
              >
                {vcfg.quality}
                <ChevronDown size={14} strokeWidth={2} />
              </button>
            </>
          ) : (
          <button
              type="button"
              className={`ip-pc ip-pc-drop${pop?.kind === 'res' ? ' is-open' : ''}`}
              tabIndex={open ? 0 : -1}
              aria-label={`Resolução: ${cfg.res}`}
              aria-haspopup="menu"
              aria-expanded={pop?.kind === 'res'}
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggle('res')}
            >
              {cfg.res}
              <ChevronDown size={14} strokeWidth={2} />
            </button>
          )}
          <div className="ip-stepper">
            <button
              type="button"
              aria-label="Menos imagens"
              disabled={count <= 1}
              tabIndex={open ? 0 : -1}
              onClick={() => onCountChange(Math.max(1, count - 1))}
            >
              <Minus size={14} strokeWidth={2.4} />
            </button>
            <span className="ip-stepper-val">{count}/4</span>
            <button
              type="button"
              aria-label="Mais imagens"
              disabled={count >= 4}
              tabIndex={open ? 0 : -1}
              onClick={() => onCountChange(Math.min(4, count + 1))}
            >
              <Plus size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="ip-prompt-send">
          <button
            type="button"
            className={`ip-prompt-go${canGenerate ? ' is-ready' : ''}`}
            style={{ '--go-w': `${110 + String(credits).length * 8}px` } as CSSProperties}
            aria-label="Gerar imagem"
            tabIndex={open ? 0 : -1}
            onClick={canGenerate ? () => onGenerate() : undefined}
          >
            <span className="ip-go-arrow" aria-hidden="true">
              <ArrowUp size={18} strokeWidth={2.4} />
            </span>
            <span className="ip-go-text">
              Gerar
              {/* créditos que a geração vai consumir, dentro do botão */}
              <span className="ip-go-cost" title={`${credits} créditos`}>
                <img src={creditsCoin} alt="" aria-hidden="true" />
                {credits}
              </span>
            </span>
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((f) => onAddBase?.(URL.createObjectURL(f)))
          e.target.value = ''
        }}
      />

      {pop?.kind === 'add' && (
        <BarPopover anchor={pop.el} label="Imagem de referência" width={248} className="igp-cascade" onClose={() => setPop(null)}>
          <button
            type="button"
            className="igp-item"
            role="menuitem"
            onPointerEnter={() => setLibOpen(false)}
            onClick={() => {
              setPop(null)
              fileRef.current?.click()
            }}
          >
            <Upload size={16} strokeWidth={1.9} />
            Upload do dispositivo
          </button>
          <button
            type="button"
            className={`igp-item${libOpen ? ' is-on' : ''}`}
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={libOpen}
            onPointerEnter={() => setLibOpen(true)}
            onClick={() => setLibOpen(true)}
          >
            <Images size={16} strokeWidth={1.9} />
            Imagens da Biblioteca
            <ChevronRight className="igp-chev" size={15} strokeWidth={2} />
          </button>
          {/* cascata ao lado: só as imagens da Biblioteca */}
          {libOpen && (
            <div className="igp-sub" role="menu" aria-label="Imagens da Biblioteca">
              <label className="igp-search">
                <Search size={14} strokeWidth={2} />
                <input
                  value={libQuery}
                  onChange={(e) => setLibQuery(e.target.value)}
                  placeholder="Buscar imagens"
                  spellCheck={false}
                  autoFocus
                />
              </label>
              <div className="igp-sub-list">
                {libList.length === 0 && <p className="igp-empty">Nenhuma imagem encontrada</p>}
                {libList.map((img) => {
                  const added = attachments.some((a) => a.src === img.src)
                  return (
                    <button
                      key={img.id}
                      type="button"
                      className="igp-item igp-img"
                      role="menuitem"
                      disabled={added}
                      onClick={() => {
                        onAddBase?.(img.src)
                        setPop(null)
                        setLibOpen(false)
                      }}
                    >
                      <span className="igp-img-thumb" aria-hidden="true">
                        <img src={img.src} alt="" loading="lazy" />
                      </span>
                      <span className="igp-img-name">{img.name}</span>
                      {added && <Check className="igp-check" size={15} strokeWidth={2.4} aria-label="Já anexada" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </BarPopover>
      )}

      {/* modelos: menu contextual grande (logo, nome e créditos) */}
      {pop?.kind === 'model' && (
        <ImageModelMenu
          anchor={pop.el}
          selected={selectedModel}
          models={models}
          autoName={autoName}
          onSelect={setModel}
          onClose={() => setPop(null)}
        />
      )}

      {pop?.kind === 'ratio' && (
        <BarPopover anchor={pop.el} label="Proporção" width={180} onClose={() => setPop(null)}>
          {ratios.map((r) => (
            <button
              key={r}
              type="button"
              className={`igp-item${ratio === r ? ' is-on' : ''}`}
              role="menuitemradio"
              aria-checked={ratio === r}
              onClick={() => {
                setRatio(r)
                setPop(null)
              }}
            >
              <RatioIcon ratio={r as AspectRatio} />
              {r}
              {ratio === r && <Check className="igp-check" size={15} strokeWidth={2.4} />}
            </button>
          ))}
        </BarPopover>
      )}

      {pop?.kind === 'res' && (
        <BarPopover anchor={pop.el} label="Resolução" width={200} onClose={() => setPop(null)}>
          {RESOLUTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`igp-item igp-res${cfg.res === r.id ? ' is-on' : ''}`}
              role="menuitemradio"
              aria-checked={cfg.res === r.id}
              onClick={() => {
                setImageSettings({ res: r.id })
                setPop(null)
              }}
            >
              <span className="igp-res-text">
                <span>{r.id}</span>
                <span className="igp-res-px">{r.px}</span>
              </span>
              {cfg.res === r.id && <Check className="igp-check" size={15} strokeWidth={2.4} />}
            </button>
          ))}
        </BarPopover>
      )}

      {pop?.kind === 'dur' && (
        <BarPopover anchor={pop.el} label="Duração" width={170} onClose={() => setPop(null)}>
          {VIDEO_DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`igp-item${vcfg.duration === d ? ' is-on' : ''}`}
              role="menuitemradio"
              aria-checked={vcfg.duration === d}
              onClick={() => {
                setVideoSettings({ duration: d })
                setPop(null)
              }}
            >
              <Clock3 size={15} strokeWidth={1.9} />
              {d.replace('s', ' segundos')}
              {vcfg.duration === d && <Check className="igp-check" size={15} strokeWidth={2.4} />}
            </button>
          ))}
        </BarPopover>
      )}

      {pop?.kind === 'qual' && (
        <BarPopover anchor={pop.el} label="Qualidade" width={190} onClose={() => setPop(null)}>
          {VIDEO_QUALITIES.map((q) => (
            <button
              key={q.id}
              type="button"
              className={`igp-item igp-res${vcfg.quality === q.id ? ' is-on' : ''}`}
              role="menuitemradio"
              aria-checked={vcfg.quality === q.id}
              onClick={() => {
                setVideoSettings({ quality: q.id })
                setPop(null)
              }}
            >
              <span className="igp-res-text">
                <span>{q.id}</span>
                <span className="igp-res-px">{q.hint}</span>
              </span>
              {vcfg.quality === q.id && <Check className="igp-check" size={15} strokeWidth={2.4} />}
            </button>
          ))}
        </BarPopover>
      )}
    </div>
  )
}
