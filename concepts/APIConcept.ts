export class APIConcept {
  private requests: Map<string, {
    request: string;
    method: string;
    path: string;
    input: unknown;
    output: unknown | null;
  }> = new Map();

  request({ request, method, path, input }: { request: string; method: string; path: string; input: unknown }) {
    this.requests.set(request, { request, method, path, input, output: null });
    return { request };
  }

  response({ request, output }: { request: string; output: unknown }) {
    const existing = this.requests.get(request);
    if (existing) {
      existing.output = output;
      this.requests.set(request, existing);
    } else {
      this.requests.set(request, { request, method: "", path: "", input: null, output });
    }
    return { request };
  }

  _get({ request }: { request: string }): { request: string; method: string; path: string; input: unknown; output: unknown }[] {
    const r = this.requests.get(request);
    if (!r) return [];
    return [{ request: r.request, method: r.method, path: r.path, input: r.input, output: r.output as unknown }];
  }
}


