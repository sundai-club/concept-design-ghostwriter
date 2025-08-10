export class MeaningMakerConcept {
  private jobs: Map<string, { job: string; manuscript: string; status: string; stage: string; summary: unknown | null }> = new Map();

  createJob({ job, manuscript }: { job: string; manuscript: string }) {
    this.jobs.set(job, { job, manuscript, status: "pending", stage: "init", summary: null });
    return { job };
  }

  updateStatus({ job, status, stage }: { job: string; status: string; stage: string }) {
    const j = this.jobs.get(job) ?? { job, manuscript: "", status: "", stage: "", summary: null };
    j.status = status;
    j.stage = stage;
    this.jobs.set(job, j);
    return { job };
  }

  setSummary({ job, summary }: { job: string; summary: unknown }) {
    const j = this.jobs.get(job) ?? { job, manuscript: "", status: "", stage: "", summary: null };
    j.summary = summary;
    j.status = "completed";
    this.jobs.set(job, j);
    return { job };
  }

  _get({ job }: { job: string }): { job: string; manuscript: string; status: string; stage: string; summary: unknown }[] {
    const j = this.jobs.get(job);
    if (!j) return [];
    return [{ job: j.job, manuscript: j.manuscript, status: j.status, stage: j.stage, summary: j.summary as unknown }];
  }
}


