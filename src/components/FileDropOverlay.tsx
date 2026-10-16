import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Upload } from 'lucide-react'
import './file-drop.css'

/* Arrastar arquivos do computador: enquanto a tela aceita upload, qualquer
   arraste de arquivo mostra o aviso "Solte aqui" em tela cheia e o soltar vale
   em qualquer ponto. Um elemento com data-drop-target="<id>" e
   data-drop-label="<texto>" vira destino específico (ex.: "Na seção X"). */
/* várias telas podem aceitar upload ao mesmo tempo (ex.: modal de Contexto
   sobre a página do projeto): só a última montada responde */
const stack: number[] = []
let seq = 0

export default function FileDropOverlay({
  enabled = true,
  where,
  sub,
  title = 'Solte aqui para fazer upload',
  onFiles,
}: {
  enabled?: boolean
  /* destino padrão, mostrado no aviso (ex.: "Jurídico") */
  where?: string
  /* texto de apoio no lugar do "Em <destino>" */
  sub?: string
  title?: string
  /* target: o data-drop-target sob o cursor (null = destino padrão) */
  onFiles: (files: File[], target: string | null) => void
}) {
  const [active, setActive] = useState(false)
  const [hover, setHover] = useState<{ id: string; label: string } | null>(null)
  const depth = useRef(0)
  const cb = useRef(onFiles)
  cb.current = onFiles

  useEffect(() => {
    if (!enabled) return
    const me = ++seq
    stack.push(me)
    const isTop = () => stack[stack.length - 1] === me
    const isFiles = (e: DragEvent) => !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')
    const targetOf = (e: DragEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('[data-drop-target]') as HTMLElement | null
      return el ? { id: el.dataset.dropTarget!, label: el.dataset.dropLabel ?? '' } : null
    }
    const onEnter = (e: DragEvent) => {
      if (!isFiles(e) || !isTop()) return
      depth.current += 1
      setActive(true)
    }
    const onOver = (e: DragEvent) => {
      if (!isFiles(e) || !isTop()) return
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
      const t = targetOf(e)
      setHover((h) => (h?.id === t?.id ? h : t))
    }
    const onLeave = (e: DragEvent) => {
      if (!isFiles(e) || !isTop()) return
      depth.current = Math.max(0, depth.current - 1)
      if (depth.current === 0) {
        setActive(false)
        setHover(null)
      }
    }
    const onDrop = (e: DragEvent) => {
      if (!isFiles(e) || !isTop()) return
      e.preventDefault()
      depth.current = 0
      setActive(false)
      setHover(null)
      const files = Array.from(e.dataTransfer?.files ?? [])
      if (files.length) cb.current(files, targetOf(e)?.id ?? null)
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onDrop)
      stack.splice(stack.indexOf(me), 1)
      depth.current = 0
      setActive(false)
      setHover(null)
    }
  }, [enabled])

  /* destaque no destino específico sob o cursor */
  useEffect(() => {
    if (!hover) return
    const el = document.querySelector(`[data-drop-target="${CSS.escape(hover.id)}"]`)
    el?.classList.add('is-file-drop')
    return () => el?.classList.remove('is-file-drop')
  }, [hover])

  if (!enabled || !active) return null
  return createPortal(
    <div className={`fd-overlay${hover ? ' is-target' : ''}`} aria-hidden="true">
      <div className="fd-card">
        <span className="fd-ic">
          <Upload size={24} strokeWidth={1.8} />
        </span>
        <span className="fd-text">
          <span className="fd-title">{title}</span>
          {(hover?.label || sub || where) && (
            <span className="fd-sub">{hover?.label || sub || `Em ${where}`}</span>
          )}
        </span>
      </div>
    </div>,
    document.body,
  )
}
