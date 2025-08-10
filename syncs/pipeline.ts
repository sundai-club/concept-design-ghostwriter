import { actions, Frames, Vars } from "../engine/mod.ts";

// Concepts are provided when instrumented by the engine in the server setup.
// This file exports a function that, given instrumented concepts, returns the sync map.

export const makePipelineSyncs = (
  {
    API,
    Manuscript,
    Chunk,
    Embedding,
    Review,
    MeaningMaker,
  }: any,
) => {
  // Parse uploaded manuscript body to text and set it
  const IngestUploadedManuscript = ({ manuscriptId, payload, text, pages }: Vars) => ({
    when: actions(
      [API.request, { method: "POST", path: "/upload", input: payload }, { request: manuscriptId }],
    ),
    where: (frames: Frames): Frames =>
      frames.map(($) => {
        const body = $[payload] as any;
        const txt = typeof body?.text === "string" ? body.text : "";
        const f: any = { ...$ };
        f[text] = txt;
        f[pages] = 1;
        return f;
      }),
    then: actions(
      [Manuscript.upload, { manuscript: manuscriptId, filename: "uploaded", mime: "text/plain" }],
      [Manuscript.setText, { manuscript: manuscriptId, text, pages }],
      [API.response, { request: manuscriptId, output: { ok: true, manuscript: manuscriptId } }],
    ),
  });

  // Kick off a job when a manuscript is uploaded
  const CreateJobOnUpload = ({ job, manuscript }: Vars) => ({
    when: actions(
      [Manuscript.upload, { manuscript }, {}],
    ),
    then: actions(
      [MeaningMaker.createJob, { job: manuscript as any, manuscript }],
      [MeaningMaker.updateStatus, { job: manuscript as any, status: "running", stage: "parsing" }],
    ),
  });

  // After text is set, chunk it
  const ChunkAfterText = ({ manuscript, text, chunkText, chunk, start, end, page }: Vars) => ({
    when: actions(
      [Manuscript.setText, { manuscript, text }, {}],
    ),
    where: (frames: Frames) => frames
      .flatMap(($) => {
        const mText = $[text] as string;
        const segments = mText.split(/\n\n+/);
        let pos = 0;
        const newFrames: Frames = new Frames();
        segments.forEach((seg) => {
          const s = pos;
          const e = pos + seg.length;
          pos = e + 2; // account for split
          const f: any = { ...$ };
          f[chunkText] = seg;
          f[chunk] = crypto.randomUUID();
          f[start] = s;
          f[end] = e;
          f[page] = 1; // placeholder
          newFrames.push(f as any);
        });
        return newFrames;
      }),
    then: actions(
      [Chunk.create, { chunk, manuscript, text: chunkText, page, start, end }],
      [MeaningMaker.updateStatus, { job: manuscript as any, status: "running", stage: "chunked" }],
    ),
  });

  // Embed chunks (bind embedding id and vector in where)
  const EmbedChunks = ({ chunk, embedding, vector }: Vars) => ({
    when: actions(
      [Chunk.create, { chunk }, {}],
    ),
    where: (frames: Frames): Frames => frames.map(($) => {
      const f: any = { ...$ };
      f[embedding] = crypto.randomUUID();
      f[vector] = [];
      return f;
    }),
    then: actions(
      [Embedding.upsert, { embedding, chunk, vector }],
    ),
  });

  // Start review stages
  const StartReviewStages = ({ review, manuscript, stage, job }: Vars) => ({
    when: actions(
      [MeaningMaker.updateStatus, { status: "running", stage: "chunked" }, { job }],
    ),
    where: (frames: Frames): Frames => frames.map(($) => {
      const f: any = { ...$ };
      f[review] = crypto.randomUUID();
      return f;
    }),
    then: actions(
      [Review.start, { review, manuscript: job }],
      [Review.runStage, { review, manuscript: job, stage: "structure" }],
      [Review.runStage, { review, manuscript: job, stage: "marketability" }],
      [Review.runStage, { review, manuscript: job, stage: "predictive" }],
      [MeaningMaker.updateStatus, { job, status: "running", stage: "reviewing" }],
    ),
  });

  // Record per-stage outputs (placeholder; real LLM integration happens externally)
  const RecordStageOutputs = ({ review, manuscript }: Vars) => ({
    when: actions(
      [Review.runStage, { review, manuscript }, {}],
    ),
    then: actions(
      [Review.record, { review, manuscript, stage: "structure", output: { score: 0.8 } }],
    ),
  });

  // Finalize job
  const FinalizeJob = ({ manuscript }: Vars) => ({
    when: actions(
      [Review.record, { manuscript }, {}],
    ),
    then: actions(
      [MeaningMaker.setSummary, { job: manuscript as any, summary: { overall: 0.82 } }],
      [MeaningMaker.updateStatus, { job: manuscript as any, status: "completed", stage: "done" }],
    ),
  });

  return {
    IngestUploadedManuscript,
    CreateJobOnUpload,
    ChunkAfterText,
    EmbedChunks,
    StartReviewStages,
    RecordStageOutputs,
    FinalizeJob,
  };
};
