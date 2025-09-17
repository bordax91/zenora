import fs from "fs"
import path from "path"
import matter from "gray-matter"
import Link from "next/link"
import Header from "@/components/Header"

export default function BlogPage() {
  // 📂 Dossier où sont stockés tes articles
  const postsDir = path.join(process.cwd(), "content/blog")

  // 📑 Lire tous les fichiers .mdx
  const files = fs.readdirSync(postsDir)

  // 📝 Récupérer les métadonnées (frontmatter)
  const posts = files.map((filename) => {
    const filePath = path.join(postsDir, filename)
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { data } = matter(fileContent) // data = frontmatter

    return {
      slug: filename.replace(".mdx", ""),
      title: data.title || "Sans titre",
      date: data.date || null,
      description: data.description || "",
    }
  })

  // Trier par date décroissante
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <>
      <Header /> {/* ✅ Ajout du header */}
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📰 Blog Zenora</h1>

        {posts.length === 0 && (
          <p className="text-gray-600">Aucun article publié pour le moment.</p>
        )}

        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="border-b pb-4">
              <Link
                href={`/blog/${post.slug}`}
                className="text-2xl font-semibold text-indigo-600 hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-500">
                {post.date ? new Date(post.date).toLocaleDateString("fr-FR") : ""}
              </p>
              <p className="mt-2 text-gray-700">{post.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
