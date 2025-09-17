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
    <div className="max-w-3xl mx-auto p-6">
      <Header />

      <article className="prose prose-lg prose-indigo max-w-none">
        <h1>{data.title}</h1>
        <p className="text-sm text-gray-500">
          {data.date ? new Date(data.date).toLocaleDateString("fr-FR") : ""}
        </p>

        {/* ✅ Ici on insère le contenu markdown converti en HTML */}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
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
