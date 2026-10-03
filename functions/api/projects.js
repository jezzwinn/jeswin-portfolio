import { json } from "../lib/auth.js";

function extractDriveId(input) {
  const s = String(input || "").trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;
  const m = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/) || s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : "";
}

function normalize(row) {
  const driveId = row.drive_id || extractDriveId(row.media_url);
  const thumbnailUrl = row.thumbnail_url || (driveId ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w1600` : row.media_url);
  return {
    id: row.id,
    title: row.title,
    category: row.category || "",
    type: row.type || "graphic",
    description: row.description || "",
    mediaUrl: row.media_url || "",
    thumbnailUrl,
    driveId,
    featured: !!row.featured,
    tags: row.tags || "",
    client: row.client || "",
    projectDate: row.project_date || "",
    sortOrder: Number(row.sort_order || 0),
    published: !!row.published
  };
}

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(`
      SELECT id,title,category,type,description,media_url,thumbnail_url,drive_id,featured,tags,client,project_date,sort_order,published
      FROM projects
      WHERE published = 1
      ORDER BY sort_order ASC, id DESC
    `).all();
    return json(result.results.map(normalize));
  } catch (e) {
    return json({ error:"Database is not configured or the projects table is missing.", detail:e.message }, 500);
  }
}
