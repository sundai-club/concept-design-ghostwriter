import { SyncConcept, actions, Logging } from "../engine/mod.ts";
import { APIConcept } from "../concepts/APIConcept.ts";
import { ManuscriptConcept } from "../concepts/ManuscriptConcept.ts";
import { ChunkConcept } from "../concepts/ChunkConcept.ts";
import { EmbeddingConcept } from "../concepts/EmbeddingConcept.ts";
import { ReviewConcept } from "../concepts/ReviewConcept.ts";
import { MeaningMakerConcept } from "../concepts/MeaningMakerConcept.ts";
import { makePipelineSyncs } from "../syncs/pipeline.ts";
import { PersistenceConcept } from "../concepts/PersistenceConcept.ts";
import { makePersistenceSyncs } from "../syncs/persist.ts";
// Deno provides crypto.randomUUID

const Sync = new SyncConcept();
Sync.logging = Logging.TRACE;

const concepts = {
  API: new APIConcept(),
  Manuscript: new ManuscriptConcept(),
  Chunk: new ChunkConcept(),
  Embedding: new EmbeddingConcept(),
  Review: new ReviewConcept(),
  MeaningMaker: new MeaningMakerConcept(),
  Persistence: new PersistenceConcept(),
};

const instrumented = Sync.instrument(concepts);
const { API, Manuscript, Chunk, Embedding, Review, MeaningMaker, Persistence } = instrumented as any;

// Register pipeline synchronizations
Sync.register(makePipelineSyncs({ API, Manuscript, Chunk, Embedding, Review, MeaningMaker }));
Sync.register(makePersistenceSyncs({ MeaningMaker, Review, Persistence }));

const serveStatic = async (pathname: string): Promise<Response> => {
  const filePath = pathname === "/" ? "../public/index.html" : `../public${pathname}`;
  try {
    const file = await Deno.readFile(new URL(filePath, import.meta.url));
    const contentType = filePath.endsWith(".html")
      ? "text/html"
      : filePath.endsWith(".js")
      ? "text/javascript"
      : filePath.endsWith(".css")
      ? "text/css"
      : filePath.endsWith(".json")
      ? "application/json"
      : "application/octet-stream";
    return new Response(file, { headers: { "content-type": contentType } });
  } catch (_) {
    return new Response("Not found", { status: 404 });
  }
};

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const { pathname } = url;

  if (req.method === "POST" && pathname === "/upload") {
    const ct = req.headers.get("content-type") || "";
    let input: Record<string, unknown> = {};
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file && file instanceof File) {
        const buf = await file.arrayBuffer();
        // Best-effort docx to text: defer real parsing to a dedicated service later
        input = { text: "" };
      } else {
        return Response.json({ error: "file missing" }, { status: 400 });
      }
    } else {
      const body = await req.json().catch(() => ({}));
      input = body as Record<string, unknown>;
    }
    const requestId = crypto.randomUUID();
    await API.request({ request: requestId, method: "POST", path: "/upload", input });
    const info = concepts.API._get({ request: requestId })[0];
    const output = info?.output ?? { ok: true, manuscript: requestId };
    return Response.json(output);
  }

  if (req.method === "GET" && pathname.startsWith("/jobs/")) {
    const job = pathname.split("/")[2];
    const data = (concepts as any).MeaningMaker._get({ job })[0] ?? null;
    return Response.json({ job, data });
  }

  if (req.method === "GET" && pathname.startsWith("/manuscripts/") && pathname.endsWith("/chunks")) {
    const manuscript = pathname.split("/")[2];
    const chunks = (concepts as any).Chunk._byManuscript({ manuscript });
    return Response.json({ manuscript, chunks });
  }

  if (req.method === "GET" && pathname.startsWith("/manuscripts/")) {
    const manuscript = pathname.split("/")[2];
    const data = (concepts as any).Manuscript._get({ manuscript })[0] ?? null;
    return Response.json({ manuscript, data });
  }

  if (req.method === "GET" && pathname.startsWith("/reviews/")) {
    const manuscript = pathname.split("/")[2];
    const data = (concepts as any).Review._byManuscript({ manuscript });
    return Response.json({ manuscript, reviews: data });
  }

  if (req.method === "GET" && pathname === "/history/jobs") {
    const rows = await (concepts as any).Persistence._getJobs({});
    return Response.json({ jobs: rows });
  }

  // static files
  if (req.method === "GET") {
    return serveStatic(pathname);
  }
  return new Response("Method Not Allowed", { status: 405 });
};

// deno-lint-ignore no-window
if ((import.meta as any).main) {
  Deno.serve({ port: 8080 }, handler);
}


