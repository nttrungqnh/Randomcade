interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="placeholder" aria-labelledby="page-title">
      <p className="placeholder__eyebrow">Phase 1 · Project Foundation</p>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
    </section>
  )
}
