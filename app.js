const API_URL = "https://lingoscribe-backend-wb3k.onrender.com";

const uploadZone     = document.getElementById("uploadZone");
const fileInput      = document.getElementById("audioFile");
const selectedFile   = document.getElementById("selectedFile");
const processBtn     = document.getElementById("processBtn");
const statusBar      = document.getElementById("statusBar");
const statusText     = document.getElementById("statusText");
const resultsSection = document.getElementById("resultsSection");
const insightsBlock  = document.getElementById("insightsBlock");
const askBlock       = document.getElementById("askBlock");
const askInput       = document.getElementById("askInput");
const askBtn         = document.getElementById("askBtn");
const askAnswer      = document.getElementById("askAnswer");
const errorBar       = document.getElementById("errorBar");
const errorText      = document.getElementById("errorText");

let currentTranscript = "";

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) setFile(fileInput.files[0]);
});

uploadZone.addEventListener("click", (e) => {
  if (!e.target.classList.contains("file-browse")) fileInput.click();
});
uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("drag-over");
});
uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

function setFile(file) {
  selectedFile.textContent = file.name;
  processBtn.disabled = false;
  fileInput._file = file;
}

processBtn.addEventListener("click", async () => {
  const file = fileInput.files[0] || fileInput._file;
  if (!file) return;

  reset();
  setStatus("Transcribing audio…");
  processBtn.disabled = true;

  const slowTimer = setTimeout(() => {
    setStatus("Server is waking up — this can take up to a minute on the first request.");
  }, 9000);

  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(API_URL + "/transcribe", { method: "POST", body: form });
    clearTimeout(slowTimer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Transcription failed");
    }

    const data = await res.json();
    hideStatus();
    renderResults(data);

    const hasTranslation = data.segments.some(
      s => s.translation_en && !s.translation_en.includes("[translation unavailable")
    );
    currentTranscript = data.segments
      .map(s => (hasTranslation ? (s.translation_en || s.text) : s.text))
      .join(" ");

    if (currentTranscript) runInsights(data.language, currentTranscript);

  } catch (err) {
    clearTimeout(slowTimer);
    hideStatus();
    showError(err.message);
  } finally {
    processBtn.disabled = false;
  }
});

function renderResults(data) {
  const hasSpeaker = data.diarization_enabled && data.segments.some(s => s.speaker);

  document.getElementById("metaLang").textContent     = langName(data.language);
  document.getElementById("metaSegments").textContent = data.segments.length;
  document.getElementById("metaConf").textContent     =
    data.language_probability ? Math.round(data.language_probability * 100) + "%" : "—";

  const head = document.getElementById("tableHead");
  const body = document.getElementById("tableBody");
  head.innerHTML = body.innerHTML = "";

  const cols = hasSpeaker ? ["Speaker", "Time", "Original", "English"] : ["Time", "Original", "English"];
  cols.forEach(c => {
    const th = document.createElement("th");
    th.textContent = c;
    head.appendChild(th);
  });

  data.segments.forEach(seg => {
    const tr = document.createElement("tr");
    if (hasSpeaker) addCell(tr, seg.speaker || "—", "");
    addCell(tr, fmtTime(seg.start) + " – " + fmtTime(seg.end), "td-time");
    addCell(tr, seg.text, "td-original");
    addCell(tr, seg.translation_en || "—", "td-translation");
    body.appendChild(tr);
  });

  resultsSection.classList.remove("hidden");
  askBlock.classList.remove("hidden");
  window.scrollTo({ top: resultsSection.offsetTop - 80, behavior: "smooth" });
}

function addCell(row, text, cls) {
  const td = document.createElement("td");
  if (cls) td.className = cls;
  td.textContent = text;
  row.appendChild(td);
}

async function runInsights(language, text) {
  insightsBlock.classList.remove("hidden");
  try {
    const res = await fetch(API_URL + "/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();

    document.getElementById("insSummary").textContent = d.summary || "—";
    document.getElementById("insTone").textContent    = d.tone ? capitalize(d.tone) : "—";
    document.getElementById("insObs").textContent     = d.observation || "—";

    const ul = document.getElementById("insTopics");
    ul.innerHTML = "";
    (d.key_topics || []).forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });

    ["cardSummary", "cardTopics", "cardTone", "cardObs"].forEach((id, i) => {
      setTimeout(() => document.getElementById(id).classList.add("visible"), i * 100);
    });
  } catch {
    insightsBlock.classList.add("hidden");
  }
}

askBtn.addEventListener("click", askQuestion);
askInput.addEventListener("keydown", e => { if (e.key === "Enter") askQuestion(); });

async function askQuestion() {
  const q = askInput.value.trim();
  if (!q || !currentTranscript) return;
  askBtn.disabled = true;
  askBtn.textContent = "…";
  askAnswer.classList.add("hidden");
  try {
    const res = await fetch(API_URL + "/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: currentTranscript, question: q }),
    });
    if (!res.ok) throw new Error("Could not get answer");
    const d = await res.json();
    askAnswer.textContent = d.answer;
    askAnswer.classList.remove("hidden");
  } catch (err) {
    showError(err.message);
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "Ask";
  }
}

function setStatus(msg) { statusText.textContent = msg; statusBar.classList.remove("hidden"); }
function hideStatus() { statusBar.classList.add("hidden"); }
function showError(msg) {
  errorText.textContent = msg;
  errorBar.classList.remove("hidden");
  setTimeout(() => errorBar.classList.add("hidden"), 9000);
}
function reset() {
  resultsSection.classList.add("hidden");
  insightsBlock.classList.add("hidden");
  askBlock.classList.add("hidden");
  askAnswer.classList.add("hidden");
  errorBar.classList.add("hidden");
  currentTranscript = "";
  document.querySelectorAll(".insight-card").forEach(c => c.classList.remove("visible"));
}
function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return m + ":" + s;
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function langName(code) {
  return { ur: "Urdu", pa: "Punjabi", hi: "Hindi", en: "English", ar: "Arabic" }[code] || code.toUpperCase();
}
