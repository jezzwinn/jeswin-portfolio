const projectsEl = document.getElementById("projects");
const emptyState = document.getElementById("empty-state");
const filters = document.querySelectorAll(".filter");
let allProjects = [];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function isDriveUrl(url) {
  return /drive\.google\.com/i.test(String(url || ""));
}

function driveId(url) {
  const s = String(url || "");
  const m = s.match(/\/file\/d\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/) || s.match(/\/d\/([\w-]+)/);
  return m ? m[1] : "";
}

function thumbSrc(p) {
  if (p.thumbnailUrl) return p.thumbnailUrl;
  if (p.thumbnail) return p.thumbnail;
  const id = p.driveId || driveId(p.mediaUrl || p.url);
  if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`;
  return p.mediaUrl || p.url || "";
}

function mediaSrc(p) {
  return p.mediaUrl || p.url || "";
}

function validProject(p) {
  return !!(p && p.id && p.title && p.type && (p.mediaUrl || p.url || p.thumbnailUrl));
}

function renderProjects(filter = "all") {
  const list = allProjects
    .filter(validProject)
    .filter(p => filter === "all" || p.type === filter)
    .sort((a,b) => (Number(a.sortOrder)||0) - (Number(b.sortOrder)||0));

  projectsEl.innerHTML = "";
  emptyState.style.display = list.length ? "none" : "block";
  if (!list.length) return;

  list.forEach((p, index) => {
    const card = document.createElement("article");
    card.className = `project reveal visible ${p.type}`;

    const visual = document.createElement("div");
    visual.className = "project-visual";
    visual.innerHTML = `<span class="project-type">${p.type === "video" ? "VIDEO" : "GRAPHIC"}</span>${p.featured ? '<span class="featured">FEATURED</span>' : ''}`;

    const src = thumbSrc(p);
    if (!src) return;

    const media = document.createElement("img");
    media.src = src;
    media.alt = p.title;
    media.loading = "lazy";
    media.addEventListener("error", () => card.remove(), { once:true });
    visual.appendChild(media);

    const info = document.createElement("div");
    info.className = "project-info";
    info.innerHTML = `<div><span class="project-index">${String(index + 1).padStart(2,"0")}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.category || (p.type === "video" ? "Video Edit" : "Graphic Design"))}</p></div><span class="arrow">↗</span>`;

    card.append(visual, info);
    projectsEl.appendChild(card);
    card.addEventListener("click", () => openLightbox(p));
    addTilt(card);
  });
}

function openLightbox(p) {
  const box = document.getElementById("lightbox");
  const stage = document.getElementById("lightbox-stage");
  const title = document.getElementById("lightbox-title");
  title.textContent = p.title || "Project";
  stage.innerHTML = "";

  const src = mediaSrc(p);
  const id = p.driveId || driveId(src);

  if (p.type === "video" && id) {
    const frame = document.createElement("iframe");
    frame.src = `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
    frame.allow = "autoplay; fullscreen";
    frame.allowFullscreen = true;
    frame.loading = "lazy";
    stage.appendChild(frame);
  } else if (p.type === "video") {
    const v = document.createElement("video");
    v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
    stage.appendChild(v);
  } else {
    const img = document.createElement("img");
    img.src = src || thumbSrc(p); img.alt = p.title || "";
    stage.appendChild(img);
  }

  box.classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeLightbox() {
  document.getElementById("lightbox")?.classList.remove("open");
  document.body.classList.remove("no-scroll");
  const stage = document.getElementById("lightbox-stage");
  if (stage) stage.innerHTML = "";
}

document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);
document.getElementById("lightbox")?.addEventListener("click", e => { if(e.target.id === "lightbox") closeLightbox(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") closeLightbox(); });

filters.forEach(button => button.addEventListener("click", () => {
  filters.forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  renderProjects(button.dataset.filter);
}));

const menu = document.querySelector(".menu-btn"), nav = document.querySelector("nav");
menu?.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", () => nav?.classList.remove("open")));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if(entry.isIntersecting) entry.target.classList.add("visible");
}), { threshold:.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

function addTilt(el) {
  el.addEventListener("pointermove", e => {
    if(window.innerWidth < 800) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width-.5;
    const y = (e.clientY-r.top)/r.height-.5;
    el.style.setProperty("--rx", `${-y*3}deg`);
    el.style.setProperty("--ry", `${x*3}deg`);
  });
  el.addEventListener("pointerleave", () => {
    el.style.setProperty("--rx","0deg");
    el.style.setProperty("--ry","0deg");
  });
}

document.addEventListener("pointermove", e => {
  document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
  document.documentElement.style.setProperty("--my", `${e.clientY}px`);
});

async function loadProjects() {
  try {
    const res = await fetch("/api/projects", { cache:"no-store" });
    if (!res.ok) throw new Error("Portfolio API unavailable");
    const data = await res.json();
    allProjects = Array.isArray(data) ? data.filter(validProject) : [];
  } catch (e) {
    allProjects = [];
  }
  renderProjects(document.querySelector(".filter.active")?.dataset.filter || "all");
  document.body.classList.add("cms-ready");
}

loadProjects();
setInterval(loadProjects, 60000);
