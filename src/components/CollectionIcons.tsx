/* Ícones das coleções/tarefas via Lucide (lucide.dev) — traço monoline
   arredondado, bem próximo do estilo do iOS/SF Symbols, sob licença aberta.
   Cor herda via currentColor (definida no container). */
import {
  Clock,
  Folder,
  SlidersHorizontal,
  Sun,
  Calendar,
  MapPin,
  Mail,
  Zap,
  Landmark,
  Globe,
  Image as ImageIcon,
  MoreHorizontal,
  Plane,
  BarChart3,
  Tag,
} from 'lucide-react'

const SZ = 22
const SW = 1.8

export const IconClock = () => <Clock size={SZ} strokeWidth={SW} />
export const IconFolder = () => <Folder size={SZ} strokeWidth={SW} />
export const IconSliders = () => <SlidersHorizontal size={SZ} strokeWidth={SW} />
export const IconSun = () => <Sun size={SZ} strokeWidth={SW} />
export const IconCalendar = () => <Calendar size={SZ} strokeWidth={SW} />
export const IconPin = () => <MapPin size={SZ} strokeWidth={SW} />
export const IconEnvelope = () => <Mail size={SZ} strokeWidth={SW} />
export const IconBolt = () => <Zap size={SZ} strokeWidth={SW} />
export const IconColumns = () => <Landmark size={SZ} strokeWidth={SW} />
export const IconGlobe = () => <Globe size={SZ} strokeWidth={SW} />
export const IconPhoto = () => <ImageIcon size={SZ} strokeWidth={SW} />
export const IconEllipsis = () => <MoreHorizontal size={SZ} strokeWidth={SW} />
export const IconAirplane = () => <Plane size={SZ} strokeWidth={SW} />
export const IconChartBar = () => <BarChart3 size={SZ} strokeWidth={SW} />
export const IconTag = () => <Tag size={SZ} strokeWidth={SW} />
