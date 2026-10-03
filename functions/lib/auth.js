const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(sig));
}

export async function sessionToken(env) {
  return hmac(env.ADMIN_SECRET, "jeswin-portfolio-admin-v1");
}

export async function isAdmin(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)jeswin_admin=([^;]+)/);
  if (!match || !env.ADMIN_SECRET) return false;
  const expected = await sessionToken(env);
  return match[1] === expected;
}

export function json(data, status=200, extra={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", ...extra }
  });
}

export function noStoreJson(data, status=200) {
  return json(data, status);
}
