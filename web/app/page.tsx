"use client";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<{ status: string; stage: string } | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${API}/history/jobs`).then(r => r.json()).then(d => setHistory(d.jobs || [])).catch(() => { });
    }, []);

    useEffect(() => {
        if (!jobId) return;
        const id = setInterval(async () => {
            const r = await fetch(`${API}/jobs/${jobId}`).then(r => r.json()).catch(() => null);
            if (!r) return;
            const data = r.data;
            if (data) {
                setStatus({ status: data.status, stage: data.stage });
                if (data.status === "completed") {
                    clearInterval(id);
                    const rv = await fetch(`${API}/reviews/${jobId}`).then(r => r.json()).catch(() => ({ reviews: [] }));
                    setReviews(rv.reviews || []);
                }
            }
        }, 1000);
        return () => clearInterval(id);
    }, [jobId]);

    const onStart = async () => {
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API}/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        setJobId(data.manuscript);
    };

    const grouped = useMemo(() => {
        const map: Record<string, any> = {};
        for (const r of reviews) {
            map[r.stage] = r;
        }
        return map;
    }, [reviews]);

    return (
        <div className="space-y-4">
            <section className="card">
                <h2 className="text-lg font-medium mb-2">Upload Manuscript (.docx)</h2>
                <div
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center"
                >
                    <div className="text-subtext mb-2">Drag and drop a .docx file here</div>
                    <div className="text-xs text-subtext mb-2">or</div>
                    <label className="btn cursor-pointer">
                        Choose File
                        <input type="file" accept=".docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </label>
                    {file && <div className="mt-3 text-xs text-subtext">Selected: {file.name}</div>}
                </div>
                <div className="mt-3 flex items-center gap-3">
                    <button className="btn" disabled={!file} onClick={onStart}>Start Review</button>
                    {jobId && status && <span className="pill">{status.status} – {status.stage}</span>}
                </div>
            </section>

            {jobId && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card">
                        <h3 className="font-medium mb-2">AI Review</h3>
                        <div className="space-y-2">
                            {['structure', 'marketability', 'predictive'].map((stage) => (
                                <div key={stage} className="border border-border rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="uppercase tracking-wide text-xs text-subtext">{stage}</span>
                                        <span className="pill">score: {(grouped[stage]?.output?.score ?? 0.8).toFixed(2)}</span>
                                    </div>
                                    <div className="mt-2 text-sm text-subtext">Evidence: (ref: C17, C42)</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="font-medium mb-2">Manuscript</h3>
                        <pre className="whitespace-pre-wrap text-subtext text-sm">Text preview will be shown after parsing.</pre>
                    </div>
                </section>
            )}

            <section className="card">
                <h3 className="font-medium mb-2">Run History</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {history.map((h) => (
                        <div key={h.job} className={clsx("rounded-lg border p-3", h.status === 'completed' ? 'border-green-700' : 'border-border')}>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-subtext">{h.job.slice(0, 8)}</span>
                                <span className="pill">{h.status}</span>
                            </div>
                            <div className="mt-1 text-sm">stage: <span className="text-subtext">{h.stage}</span></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

const sample = ``;


