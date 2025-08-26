// lib/project/storage.ts
import type { Project, Partida, PartidaKind, MaterialRow } from "./types";

const LS_KEY = "gascalc_projects_v1";
const LS_ACTIVE = "gascalc_active_project_id";

const hasWindow = () => typeof window !== "undefined" && !!window.localStorage;
const now = () => Date.now();

function readAll(): Project[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((p) => p && typeof p.id === "string");
  } catch {
    return [];
  }
}

function writeAll(list: Project[]) {
  if (!hasWindow()) return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ---- API de proyectos ----
export function listProjects(): Array<Pick<Project, "id" | "name">> {
  return readAll().map(({ id, name }) => ({ id, name }));
}

export function getProject(id: string): Project | null {
  const p = readAll().find((x) => x.id === id);
  return p ?? null;
}

export function createProject(input: { name: string; client?: string; siteAddress?: string }): Project {
  const list = readAll();
  const p: Project = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Proyecto sin nombre",
    client: input.client?.trim() || undefined,
    siteAddress: input.siteAddress?.trim() || undefined,
    partes: [],
    createdAt: now(),
    updatedAt: now(),
  };
  list.push(p);
  writeAll(list);
  // si no había activo, lo seteamos
  if (!getActiveProjectId()) setActiveProjectId(p.id);
  return p;
}

export function updateProject(id: string, patch: Partial<Pick<Project, "name" | "client" | "siteAddress">>): Project | null {
  const list = readAll();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const curr = list[idx];
  const next: Project = {
    ...curr,
    name: patch.name?.trim() || curr.name,
    client: patch.client?.trim() ?? curr.client,
    siteAddress: patch.siteAddress?.trim() ?? curr.siteAddress,
    updatedAt: now(),
  };
  list[idx] = next;
  writeAll(list);
  return next;
}

export function removeProject(id: string) {
  const list = readAll().filter((x) => x.id !== id);
  writeAll(list);
  if (getActiveProjectId() === id) setActiveProjectId(list[0]?.id ?? "");
}

// ---- Activo ----
export function getActiveProjectId(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(LS_ACTIVE);
}
export function setActiveProjectId(id: string) {
  if (!hasWindow()) return;
  if (id) window.localStorage.setItem(LS_ACTIVE, id);
  else window.localStorage.removeItem(LS_ACTIVE);
}

// ---- Partidas ----
export function addPartida(
  projectId: string,
  data: {
    kind: PartidaKind;
    title: string;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    materials: MaterialRow[];
  }
): Partida | null {
  const list = readAll();
  const idx = list.findIndex((x) => x.id === projectId);
  if (idx < 0) return null;

  const pt: Partida = {
    id: crypto.randomUUID(),
    kind: data.kind,
    title: data.title.trim() || "(Sin título)",
    inputs: data.inputs,
    outputs: data.outputs,
    materials: data.materials,
    createdAt: now(),
    updatedAt: now(),
  };

  const p = list[idx];
  const next: Project = { ...p, partes: [...p.partes, pt], updatedAt: now() };
  list[idx] = next;
  writeAll(list);
  return pt;
}

export function getPartida(projectId: string, partidaId: string): Partida | null {
  const p = getProject(projectId);
  if (!p) return null;
  return p.partes.find((pt) => pt.id === partidaId) ?? null;
}

export function updatePartida(
  projectId: string,
  partidaId: string,
  patch: Partial<Pick<Partida, "title" | "inputs" | "outputs" | "materials">>
): Partida | null {
  const list = readAll();
  const pIdx = list.findIndex((x) => x.id === projectId);
  if (pIdx < 0) return null;

  const p = list[pIdx];
  const ptIdx = p.partes.findIndex((pt) => pt.id === partidaId);
  if (ptIdx < 0) return null;

  const curr = p.partes[ptIdx];
  const next: Partida = {
    ...curr,
    title: patch.title?.trim() || curr.title,
    inputs: patch.inputs ?? curr.inputs,
    outputs: patch.outputs ?? curr.outputs,
    materials: patch.materials ?? curr.materials,
    updatedAt: now(),
  };

  const nextProject: Project = {
    ...p,
    partes: p.partes.map((x, i) => (i === ptIdx ? next : x)),
    updatedAt: now(),
  };
  list[pIdx] = nextProject;
  writeAll(list);
  return next;
}

export function removePartida(projectId: string, partidaId: string) {
  const list = readAll();
  const pIdx = list.findIndex((x) => x.id === projectId);
  if (pIdx < 0) return;
  const p = list[pIdx];
  const next: Project = {
    ...p,
    partes: p.partes.filter((pt) => pt.id !== partidaId),
    updatedAt: now(),
  };
  list[pIdx] = next;
  writeAll(list);
}
