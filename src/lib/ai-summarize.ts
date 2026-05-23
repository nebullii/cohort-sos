"use client";

import { cosineSimilarity, embedText } from "./ai-search";

/**
 * Extractive summary using the same MiniLM model we use for search.
 *
 * Picks the sentences from the input most central to the document's overall
 * meaning. Centrality is measured by average cosine similarity against every
 * other sentence in the input. This is a tiny LexRank-style summarizer that
 * runs entirely in the browser. No API key, no generative model required.
 *
 * For the resolve flow, we feed it the requester's context plus every reply
 * in the conversation. The output is a 2-4 sentence fix-note draft.
 */
export async function summarize(
  text: string,
  maxSentences: number = 3,
): Promise<string> {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) {
    return sentences.join(" ");
  }
  const vectors: Float32Array[] = [];
  for (const s of sentences) {
    vectors.push(await embedText(s));
  }
  const scores = vectors.map((v, i) => {
    let sum = 0;
    let n = 0;
    for (let j = 0; j < vectors.length; j++) {
      if (i === j) continue;
      sum += cosineSimilarity(v, vectors[j]);
      n++;
    }
    return n === 0 ? 0 : sum / n;
  });
  const ranked = sentences
    .map((s, i) => ({ s, i, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  return ranked.join(" ");
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 400);
}
