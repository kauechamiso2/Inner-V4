import './page-view.css'

/* Página de grid (Library / Tarefas): só o título por enquanto, como na ref */
export default function PageView({ title }: { title: string }) {
  return (
    <main className="page-view">
      <div className="page-view-grid">
        <h1 className="page-view-title">{title}</h1>
      </div>
    </main>
  )
}
