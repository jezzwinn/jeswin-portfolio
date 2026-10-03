import { isAdmin, json } from "../../lib/auth.js";

function extractDriveId(input) {
  const s = String(input || "").trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;
  const m = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/) || s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : "";
}

function clean(body) {
  const mediaUrl = String(body.mediaUrl || "").trim();
  const driveId = extractDriveId(mediaUrl);
  const type = ["graphic","video"].includes(String(body.type || "graphic")) ? String(body.type || "graphic") : "graphic";
  const thumbnailUrl = String(body.thumbnailUrl || "").trim() || (driveId ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w1600` : "");
  return {
    title: String(body.title || "").trim(),
    category: String(body.category || "").trim(),
    type,
    description: String(body.description || "").trim(),
    mediaUrl,
    thumbnailUrl,
    driveId,
    featured: body.featured ? 1 : 0,
    tags: String(body.tags || "").trim(),
    client: String(body.client || "").trim(),
    projectDate: String(body.projectDate || "").trim(),
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    published: body.published === false ? 0 : 1
  };
}

function validate(p) {
  if (!p.title) return "Title is required.";
  if (!p.mediaUrl) return "Media URL or Google Drive link is required.";
  return "";
}

async function listAll(env) {
  const result = await env.DB.prepare(`
    SELECT id,title,category,type,description,media_url,thumbnail_url,drive_id,featured,tags,client,project_date,sort_order,published
    FROM projects
    ORDER BY sort_order ASC, id DESC
  `).all();
  return result.results.map(r => ({
    id:r.id,title:r.title,category:r.category||"",type:r.type,description:r.description||"",
    mediaUrl:r.media_url,thumbnailUrl:r.thumbnail_url||"",driveId:r.drive_id||"",
    featured:!!r.featured,tags:r.tags||"",client:r.client||"",projectDate:r.project_date||"",
    sortOrder:Number(r.sort_order||0),published:!!r.published
  }));
}

export async function onRequestGet(context) {
  if (!await isAdmin(context.request, context.env)) return json({error:"Unauthorized"}, 401);
  try { return json(await listAll(context.env)); }
  catch(e) { return json({error:e.message},500); }
}

export async function onRequestPost(context) {
  if (!await isAdmin(context.request, context.env)) return json({error:"Unauthorized"}, 401);
  const p = clean(await context.request.json().catch(()=>({})));
  const error = validate(p);
  if (error) return json({error}, 400);
  try {
    const r = await context.env.DB.prepare(`
      INSERT INTO projects (title,category,type,description,media_url,thumbnail_url,drive_id,featured,tags,client,project_date,sort_order,published,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(p.title,p.category,p.type,p.description,p.mediaUrl,p.thumbnailUrl,p.driveId,p.featured,p.tags,p.client,p.projectDate,p.sortOrder,p.published,new Date().toISOString(),new Date().toISOString()).run();
    return json({ok:true,id:r.meta.last_row_id});
  } catch(e) { return json({error:e.message},500); }
}

export async function onRequestPut(context) {
  if (!await isAdmin(context.request, context.env)) return json({error:"Unauthorized"}, 401);
  const body = await context.request.json().catch(()=>({}));
  const id = Number(body.id);
  if (!id) return json({error:"Project ID is required."},400);
  const p = clean(body);
  const error = validate(p);
  if (error) return json({error},400);
  try {
    await context.env.DB.prepare(`
      UPDATE projects SET title=?,category=?,type=?,description=?,media_url=?,thumbnail_url=?,drive_id=?,featured=?,tags=?,client=?,project_date=?,sort_order=?,published=?,updated_at=?
      WHERE id=?
    `).bind(p.title,p.category,p.type,p.description,p.mediaUrl,p.thumbnailUrl,p.driveId,p.featured,p.tags,p.client,p.projectDate,p.sortOrder,p.published,new Date().toISOString(),id).run();
    return json({ok:true});
  } catch(e) { return json({error:e.message},500); }
}

export async function onRequestDelete(context) {
  if (!await isAdmin(context.request, context.env)) return json({error:"Unauthorized"}, 401);
  const url = new URL(context.request.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return json({error:"Project ID is required."},400);
  try {
    await context.env.DB.prepare("DELETE FROM projects WHERE id=?").bind(id).run();
    return json({ok:true});
  } catch(e) { return json({error:e.message},500); }
}
