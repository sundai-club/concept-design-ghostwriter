export class ManuscriptConcept {
  private manuscripts: Map<string, {
    manuscript: string;
    filename: string;
    mime: string;
    text: string;
    pages: number;
  }> = new Map();

  upload({ manuscript, filename, mime }: { manuscript: string; filename: string; mime: string }) {
    this.manuscripts.set(manuscript, { manuscript, filename, mime, text: "", pages: 0 });
    return { manuscript };
  }

  setText({ manuscript, text, pages }: { manuscript: string; text: string; pages: number }) {
    const existing = this.manuscripts.get(manuscript);
    if (existing) {
      existing.text = text;
      existing.pages = pages;
      this.manuscripts.set(manuscript, existing);
    } else {
      this.manuscripts.set(manuscript, { manuscript, filename: "", mime: "", text, pages });
    }
    return { manuscript };
  }

  _get({ manuscript }: { manuscript: string }): { manuscript: string; filename: string; mime: string; text: string; pages: number }[] {
    const m = this.manuscripts.get(manuscript);
    if (!m) return [];
    return [{ manuscript: m.manuscript, filename: m.filename, mime: m.mime, text: m.text, pages: m.pages }];
  }
}


