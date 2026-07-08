// Update this to your deployed Render URL after deployment.
// For local development, keep it pointing at localhost.
const API_URL = "http://localhost:8000";

const fileInput   = document.getElementById("audioFile");
const fileLabel   = document.getElementById("fileName");
const processBtn  = document.getElementById("processBtn");
const statusEl    = document.getElementById("status");
const resultsSection = document.getElementById("resultsSection");
const langDetected   = document.getElementById("langDetected");
const langConf       = document.getElementById("langConf");
const tableHead      = document.getElementById("tableHead");
const tableBody      = document.getElementById("tableBody");

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    fileLabel.textContent = fileInput.files[0].name;
    processBtn.disabled = false;
  }
});

processBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  setStatus("loading", "Uploading and processing…");
  processBtn.disabled = true;
  resultsSection.classList.add("hidden");

  // Show a "server waking up" message if the request takes more than 8s
  const slowTimer = setTimeout(() => {
    setStatus("loading", "Waking up the server — this can take up to a minute on first request. Please wait…");
  }, 8000);

  try {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_URL}/transcribe`, { method: "POST", body: form });
    clearTimeout(slowTimer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Server error");
    }

    const data = await res.json();
    renderResults(data);
    statusEl.classList.add("hidden");
  } catch (err) {
    clearTimeout(slowTimer);
    setStatus("error", `Error: ${err.message}`);
  } finally {
    processBtn.disabled = false;
  }
});

function setStatus(type, message) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
  statusEl.classList.remove("hidden");
}

function renderResults(data) {
  langDetected.textContent = data.language || "unknown";
  langConf.textContent     = data.language_probability
    ? `${(data.language_probability * 100).toFixed(1)}%`
    : "n/a";

  const hasSpeaker = data.diarization_enabled &&
    data.segments.some(s => s.speaker);

  // Build header
  tableHead.innerHTML = "";
  const cols = hasSpeaker
    ? ["Speaker", "Time", "Original Text", "English Translation"]
    : ["Time", "Original Text", "English Translation"];
  cols.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    tableHead.appendChild(th);
  });

  // Build rows
  tableBody.innerHTML = "";
  data.segments.forEach(seg => {
    const tr = document.createElement("tr");
    const time = `${fmtTime(seg.start)} → ${fmtTime(seg.end)}`;
    const cells = hasSpeaker
      ? [seg.speaker || "—", time, seg.text, seg.translation_en]
      : [time, seg.text, seg.translation_en];
    cells.forEach(val => {
      const td = document.createElement("td");
      td.textContent = val || "—";
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });

  resultsSection.classList.remove("hidden");
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}
