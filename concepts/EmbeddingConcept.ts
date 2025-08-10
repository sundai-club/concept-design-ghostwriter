export class EmbeddingConcept {
  private embeddings: Map<string, { embedding: string; chunk: string; vector: unknown }> = new Map();

  upsert({ embedding, chunk, vector }: { embedding: string; chunk: string; vector: unknown }) {
    this.embeddings.set(embedding, { embedding, chunk, vector });
    return { embedding };
  }

  _byChunk({ chunk }: { chunk: string }): { embedding: string; chunk: string; vector: unknown }[] {
    const out: { embedding: string; chunk: string; vector: unknown }[] = [];
    for (const e of this.embeddings.values()) {
      if (e.chunk === chunk) out.push({ embedding: e.embedding, chunk: e.chunk, vector: e.vector });
    }
    return out;
  }
}


