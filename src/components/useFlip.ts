import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * FLIP para listas: chame `capture()` logo ANTES do setState que muda a ordem;
 * após o re-render, cada [data-flip-id] desliza da posição antiga para a nova.
 * Elementos com data-flip-skip="true" (ex: o que está sendo arrastado) são ignorados.
 */
export function useFlip(ref: RefObject<HTMLElement | null>) {
  const captured = useRef<Map<string, number> | null>(null)

  const capture = () => {
    const container = ref.current
    if (!container) return
    const map = new Map<string, number>()
    container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
      map.set(el.dataset.flipId as string, el.getBoundingClientRect().top)
    })
    captured.current = map
  }

  useLayoutEffect(() => {
    if (!captured.current) return
    const old = captured.current
    captured.current = null
    const container = ref.current
    if (!container) return
    container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
      if (el.dataset.flipSkip === 'true') return
      const id = el.dataset.flipId as string
      const now = el.getBoundingClientRect().top
      const before = old.get(id)
      if (before == null) {
        el.animate(
          [
            { opacity: 0, transform: 'scale(0.9)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        )
        return
      }
      const dy = before - now
      if (Math.abs(dy) > 0.5) {
        el.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
          { duration: 320, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
        )
      }
    })
  })

  return capture
}
