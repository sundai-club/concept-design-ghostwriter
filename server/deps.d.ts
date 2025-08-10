// Deno runtime globals for type-checking in editors without Deno types
declare const Deno: {
  readFile(path: string | URL): Promise<Uint8Array>;
  serve(opts: { port: number }, handler: (req: Request) => Response | Promise<Response>): void;
};
interface ImportMeta { main?: boolean }


