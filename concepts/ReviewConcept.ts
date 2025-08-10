export class ReviewConcept {
  private reviews: Map<string, { review: string; manuscript: string; stage: string; output: unknown }[]> = new Map();

  start({ review, manuscript }: { review: string; manuscript: string }) {
    if (!this.reviews.has(review)) this.reviews.set(review, []);
    return { review };
  }

  runStage({ review, manuscript, stage }: { review: string; manuscript: string; stage: string }) {
    // Orchestration happens via synchronizations; this action just records the occurrence
    return { review };
  }

  record({ review, manuscript, stage, output }: { review: string; manuscript: string; stage: string; output: unknown }) {
    const list = this.reviews.get(review) ?? [];
    list.push({ review, manuscript, stage, output });
    this.reviews.set(review, list);
    return { review };
  }

  _byManuscript({ manuscript }: { manuscript: string }): { review: string; manuscript: string; stage: string; output: unknown }[] {
    const out: { review: string; manuscript: string; stage: string; output: unknown }[] = [];
    for (const [rid, records] of this.reviews.entries()) {
      for (const r of records) {
        if (r.manuscript === manuscript) out.push({ review: rid, manuscript: r.manuscript, stage: r.stage, output: r.output });
      }
    }
    return out;
  }
}


