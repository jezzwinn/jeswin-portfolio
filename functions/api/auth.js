import { sessionToken, isAdmin, json } from "../lib/auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");

  if (!env.ADMIN_PASSWORD || !env.ADMIN_SECRET) {
    return json({ ok:false, error:"Admin secrets are not configured yet." }, 500);
  }

  if (password !== env.ADMIN_PASSWORD) {
    return json({ ok:false, error:"Incorrect password." }, 401);
  }

  const token = await sessionToken(env);
  return json({ ok:true }, 200, {
    "Set-Cookie": `jeswin_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
  });
}

export async function onRequestDelete(context) {
  return json({ ok:true }, 200, {
    "Set-Cookie": "jeswin_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
  });
}

export async function onRequestGet(context) {
  return json({ ok: await isAdmin(context.request, context.env) });
}
