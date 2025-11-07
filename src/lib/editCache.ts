// Lightweight in-memory cache for passing a project between pages on the client.
// This avoids relying solely on sessionStorage (which can be blocked or not read in some navigation flows).

let cachedProjeto: any = null

export function setEditingProjeto(p: any) {
  try { cachedProjeto = p } catch (e) { /* ignore */ }
}

export function takeEditingProjeto(id?: string) {
  try {
    if (!cachedProjeto) return null
    if (!id) return null
    if (String(cachedProjeto.id) === String(id)) {
      const tmp = cachedProjeto
      cachedProjeto = null
      return tmp
    }
    return null
  } catch (e) {
    return null
  }
}

export function peekEditingProjeto() {
  return cachedProjeto
}
