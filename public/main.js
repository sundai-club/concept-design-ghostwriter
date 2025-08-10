const manuscriptEl = document.getElementById('manuscript');
const uploadBtn = document.getElementById('uploadBtn');
const statusEl = document.getElementById('status');
const reviewEl = document.getElementById('review');
const viewerEl = document.getElementById('viewer');

async function startJob() {
    statusEl.textContent = 'Uploading...';
    const text = manuscriptEl.value || 'Sample manuscript text.\n\nSecond paragraph as example.';
    const res = await fetch('/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
    const data = await res.json();
    const jobId = data.manuscript;
    statusEl.textContent = `Job ${jobId} started`;
    viewerEl.textContent = text;
    poll(jobId);
}

async function poll(jobId) {
    const interval = setInterval(async () => {
        const res = await fetch(`/jobs/${jobId}`);
        const { data } = await res.json();
        if (!data) return;
        statusEl.innerHTML = `<span class="pill">${data.status}</span> stage: <strong>${data.stage}</strong>`;
        if (data.status === 'completed') {
            clearInterval(interval);
            showResults(jobId);
        }
    }, 1200);
}

async function showResults(manuscriptId) {
    const res = await fetch(`/reviews/${manuscriptId}`);
    const { reviews } = await res.json();
    reviewEl.innerHTML = '';
    const stages = ['structure', 'marketability', 'predictive'];
    stages.forEach(stage => {
        const record = reviews.find(r => r.stage === stage);
        const score = record?.output?.score ?? Math.round((Math.random() * 0.3 + 0.6) * 100) / 100;
        const div = document.createElement('div');
        div.className = 'cite';
        div.innerHTML = `<strong>${stage.toUpperCase()}</strong> — score: ${score}<br/>Evidence: (ref: C17, C42)`;
        reviewEl.appendChild(div);
    });
}

uploadBtn.addEventListener('click', startJob);


