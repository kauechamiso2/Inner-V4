/* Coleções e arquivos da Biblioteca — compartilhados entre o submenu de @
   e a busca inline do menu de menção. */
import folder from '../assets/library/folder.svg'
import fPdf from '../assets/library/file-pdf.svg'
import fImage from '../assets/library/file-image.svg'
import fText from '../assets/library/file-text.svg'
import fPpt from '../assets/library/ppt.svg'
import fExcel from '../assets/library/excel.svg'
import fVideo from '../assets/library/video.svg'
import fWave from '../assets/library/waveform.svg'

export const folderIcon = folder

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/120/120`

export type LibEntry = {
  id: string
  label: string
  img: string
  sub: string
  color?: string
  /* coleção com emoji nativo no lugar do ícone de pasta */
  emoji?: string
  /* arquivo do tipo imagem mostra thumb no lugar do ícone */
  thumb?: string
  size?: string
}

export const COLLECTIONS: LibEntry[] = [
  { id: 'col-hr', label: 'HR Stuff', img: folder, sub: '54 arquivos', emoji: '🧑‍💼' },
  { id: 'col-mkt', label: 'Marketing & Conteúdo', img: folder, sub: '18 conversas', emoji: '📣' },
]

export const FILES: LibEntry[] = [
  { id: 'f-marca', label: 'Guia de marca Inner 2026', img: fPdf, sub: 'PDF', color: '#C0392B', size: '2.4 MB' },
  { id: 'f-hero', label: 'Hero 3D do site novo', img: fImage, sub: 'Imagem', color: '#7C4DC0', thumb: thumb('hero3d'), size: '1.8 MB' },
  { id: 'f-roteiro', label: 'Roteiro — vídeo institucional', img: fText, sub: 'Documento', color: '#3E63C4', size: '48 KB' },
  { id: 'f-deck', label: 'Deck de vendas Q4', img: fPpt, sub: 'Slides', color: '#C15A2B', size: '6.1 MB' },
  { id: 'f-planilha', label: 'Planilha de criativos', img: fExcel, sub: 'Planilha', color: '#1F7A4D', size: '320 KB' },
  { id: 'f-banner', label: 'Banner da Black Friday', img: fImage, sub: 'Imagem', color: '#7C4DC0', thumb: thumb('blackfriday'), size: '2.2 MB' },
  { id: 'f-teaser', label: 'Teaser do lançamento V4', img: fVideo, sub: 'Vídeo', color: '#4C52C4', size: '58 MB' },
  { id: 'f-jingle', label: 'Jingle da campanha', img: fWave, sub: 'Áudio', color: '#C98A2D', size: '3.4 MB' },
]

export const normalizeLib = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

import type { Attachment } from './MentionMenu'

/* monta o anexo (chip no input) para uma coleção ou arquivo */
export function entryAttachment(e: LibEntry, collection: boolean): Attachment {
  return collection
    ? { kind: 'collection', name: e.label, fileType: e.sub, img: folder }
    : {
        kind: e.sub === 'Imagem' ? 'image' : 'file',
        name: e.label,
        fileType: e.sub,
        size: e.size,
        thumb: e.thumb,
        color: e.color,
        img: e.img,
      }
}
