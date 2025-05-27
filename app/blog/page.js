// app/blog/page.jsx
import Link from 'next/link';

const articles = [
  {
    slug: 'comment-gerer-le-stress',
    title: 'Comment gérer le stress au quotidien ?',
    date: '2025-05-27',
    preview: 'Découvrez des conseils simples pour mieux gérer le stress au quotidien...'
  },
  {
    slug: 'retrouver-le-sommeil',
    title: '5 astuces pour retrouver le sommeil naturellement',
    date: '2025-05-24',
    preview: 'Améliorez votre sommeil grâce à ces 5 conseils faciles à appliquer...'
  },
];

export default function BlogPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Nos articles</h1>
      <ul className="space-y-6">
        {articles.map(article => (
          <li key={article.slug} className="border-b pb-4">
            <Link href={`/blog/${article.slug}`} className="block">
              <h2 className="text-2xl font-semibold text-blue-700 hover:underline">{article.title}</h2>
              <p className="text-gray-500 text-sm">{article.date}</p>
              <p className="mt-2 text-gray-700">{article.preview}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
