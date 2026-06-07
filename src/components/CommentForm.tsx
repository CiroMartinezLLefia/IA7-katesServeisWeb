"use client";

import { useState } from "react";
import { addComment } from "@/app/actions/comments";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommentForm({ matchId }: { matchId: string }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError("El comentari no pot estar buit.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await addComment({ content: trimmed, matchId });

      if (res.success) {
        setContent("");
        router.refresh(); // Triggers RSC re-fetch of comments
      } else {
        setError(res.error || "Error al desar el comentari.");
      }
    } catch (err: any) {
      setError("S'ha produït un error de xarxa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="comment" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Escriu un comentari en viu
        </label>
        <textarea
          id="comment"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Què opineu d'aquest partit? Comparteix la teva opinió..."
          className="w-full rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary p-3 resize-none transition-all"
        />
      </div>

      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-primary/10"
        >
          {isSubmitting ? (
            <div className="w-3.5 h-3.5 rounded-full border border-slate-950 border-t-transparent animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Enviar comentari</span>
        </button>
      </div>
    </form>
  );
}
