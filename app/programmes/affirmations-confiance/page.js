'use client'
import Header from '@/components/Header';
import { useEffect, useState } from 'react';

export default function AffirmationsConfiance() {
  const [currentLine, setCurrentLine] = useState(0);

  const lines = [
    "Installe-toi confortablement...",
    "Ferme doucement les yeux...",
    "Prends une profonde inspiration...",
    "Et relâche lentement toute tension...",
    "Répète mentalement après moi : « Je suis capable. »...",
    "« Je mérite d’être heureux(se). »...",
    "« Je suis digne d’amour et de réussite. »...",
    "Respire profondément...",
    "À chaque respiration, ressens ta confiance grandir...",
    "« Je choisis de croire en moi. »...",
    "« Je suis plus fort(e) que mes peurs. »...",
    "« Je suis maître de mes choix et de mon chemin. »...",
    "Laisse ces affirmations s’imprégner dans ton cœur...",
    "Ressens ta force intérieure grandir doucement...",
    "Inspire cette énergie positive...",
    "Expire toute hésitation...",
    "Tu es prêt(e) à accomplir de grandes choses...",
  ];

  useEffect(() => {
    if (currentLine < lines.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentLine(currentLine + 1);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, lines.length]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
          Affirmations de Puissance
        </h1>
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl animate-fade-in">
          {lines.slice(0, currentLine + 1).map((line, index) => (
            <p key={index} className="text-gray-800 text-lg mb-2">{line}</p>
          ))}
        </div>
      </main>
    </div>
  );
}
