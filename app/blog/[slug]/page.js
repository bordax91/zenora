import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { notFound } from "next/navigation"
import { remark } from "remark"
import html from "remark-html"
import Header from "@/components/Header"

// 📂 Dossier où sont stockés tes articles
const postsDir = path.join(process.cwd(), "content/blog")

export default async function BlogPostPage({ params }) {
  const { slug } = params
  const filePath = path.join(postsDir, `${slug}.mdx`)

  // ⚡ Vérifier si le fichier existe
  if (!fs.existsSync(filePath)) {
    notFound()
  }

  // 📝 Lire contenu de l'article
  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(fileContent)

  // 🔄 Convertir le markdown en HTML
  const processedContent = await remark()
    .use(html)
    .process(content)
  const contentHtml = processedContent.toString()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section avec titre */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{data.title}</h1>
          <p className="text-sm text-gray-500">
            {data.date ? new Date(data.date).toLocaleDateString("fr-FR") : ""}
          </p>
        </div>
      </section>

      {/* Contenu de l'article */}
      <section className="py-12 px-6 flex-1">
        <div className="max-w-3xl mx-auto">
          <article
            className="prose prose-lg prose-indigo max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-center py-6 text-gray-500 text-sm border-t">
        <div className="flex flex-col items-center gap-2">
          <p>Zenora © 2025 — Tous droits réservés</p>
          <div className="flex gap-4 text-blue-500">
            <a href="/mentions-legales" className="hover:underline">
              Mentions légales
            </a>
            <a href="/politique-confidentialite" className="hover:underline">
              Politique de confidentialité
            </a>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// 🔄 Générer les slugs à build-time (SSG)
export async function generateStaticParams() {
  const files = fs.readdirSync(postsDir)
  return files.map((filename) => ({
    slug: filename.replace(/\.mdx?$/, ""),
  }))
}
