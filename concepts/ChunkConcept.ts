export class ChunkConcept {
  private chunks: Map<string, {
    chunk: string;
    manuscript: string;
    text: string;
    page: number;
    start: number;
    end: number;
  }> = new Map();

  create({ chunk, manuscript, text, page, start, end }: { chunk: string; manuscript: string; text: string; page: number; start: number; end: number }) {
    this.chunks.set(chunk, { chunk, manuscript, text, page, start, end });
    return { chunk };
  }

  _byManuscript({ manuscript }: { manuscript: string }): { chunk: string; manuscript: string; text: string; page: number; start: number; end: number }[] {
    const out: { chunk: string; manuscript: string; text: string; page: number; start: number; end: number }[] = [];
    for (const c of this.chunks.values()) {
      if (c.manuscript === manuscript) out.push({ chunk: c.chunk, manuscript: c.manuscript, text: c.text, page: c.page, start: c.start, end: c.end });
    }
    return out;
  }
}


