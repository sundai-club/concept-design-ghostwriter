import { getDb } from "../server/db.ts";

export class PersistenceConcept {
  async saveJob({ job, manuscript, status, stage, summary }: { job: string; manuscript: string; status: string; stage: string; summary?: unknown }) {
    const db = await getDb();
    await db.collection("jobs").updateOne(
      { job },
      { $set: { job, manuscript, status, stage, summary: summary ?? null, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
    return { job };
  }

  async saveReview({ review, manuscript, stage, output }: { review: string; manuscript: string; stage: string; output: unknown }) {
    const db = await getDb();
    await db.collection("reviews").insertOne({ review, manuscript, stage, output, createdAt: new Date() });
    return { review };
  }

  async _getJobs(_: Record<PropertyKey, never>): Promise<{ job: string; manuscript: string; status: string; stage: string; summary: unknown }[]> {
    const db = await getDb();
    const rows = await db.collection("jobs").find({}, { sort: { updatedAt: -1 } }).toArray();
    return rows.map((r: any) => ({ job: r.job, manuscript: r.manuscript, status: r.status, stage: r.stage, summary: r.summary }));
  }

  async _getReviews({ manuscript }: { manuscript: string }): Promise<{ review: string; manuscript: string; stage: string; output: unknown }[]> {
    const db = await getDb();
    const rows = await db.collection("reviews").find({ manuscript }, { sort: { createdAt: 1 } }).toArray();
    return rows.map((r: any) => ({ review: r.review, manuscript: r.manuscript, stage: r.stage, output: r.output }));
  }
}


