"use client";

/**
 * Browser-side semantic search powered by a quantized MiniLM model
 * (Xenova/all-MiniLM-L6-v2). Runs entirely in the user's browser via
 * WebAssembly. No API keys, no server cost, ~22MB model cached after
 * first load.
 */

import type { FeatureExtractionPipeline } from "@huggingface/transformers";

const MODEL = "Xenova/all-MiniLM-L6-v2";

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (typeof window === "undefined") {
    throw new Error("ai-search runs only in the browser");
  }
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const transformers = await import("@huggingface/transformers");
      transformers.env.allowLocalModels = false;
      const pipe = await transformers.pipeline("feature-extraction", MODEL, {
        dtype: "q8",
      });
      return pipe as FeatureExtractionPipeline;
    })();
  }
  return embedderPromise;
}

export async function embedText(text: string): Promise<Float32Array> {
  const clean = text.trim();
  if (!clean) return new Float32Array();
  const embed = await getEmbedder();
  const output = await embed(clean, { pooling: "mean", normalize: true });
  return output.data as Float32Array;
}

export async function embedMany(
  texts: string[],
): Promise<Array<Float32Array>> {
  const results: Float32Array[] = [];
  for (const t of texts) {
    results.push(await embedText(t));
  }
  return results;
}

export function cosineSimilarity(
  a: Float32Array,
  b: Float32Array,
): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aMag += a[i] * a[i];
    bMag += b[i] * b[i];
  }
  const denom = Math.sqrt(aMag) * Math.sqrt(bMag);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Warm-up triggers the model download on a low-priority idle callback.
 * Call once on board mount so the first real search is instant.
 */
export function warmEmbedder() {
  if (typeof window === "undefined") return;
  const fire = () => {
    void getEmbedder().catch(() => {
      /* ignore: user is offline or browser blocks the worker */
    });
  };
  if ("requestIdleCallback" in window) {
    (window as Window & {
      requestIdleCallback: (cb: () => void) => void;
    }).requestIdleCallback(fire);
  } else {
    setTimeout(fire, 1500);
  }
}
