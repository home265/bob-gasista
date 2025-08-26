// lib/project/storage.ts
import type { Project, Partida, PartidaKind, MaterialRow } from "./types";

const LS_KEY = "gascalc_projects_v1";

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

// ---- API de Proyectos (Simplificada) ----

export function listProjects(): Array<Pick<Project, "id" | "name">> {
  return readAll().map(({ id, name }) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
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
  return p;
}

export function updateProject(id: string, patch: Partial<Pick<Project, "name" | "client" | "siteAddress">>): Project | null {
  const list = readAll();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const curr = list[idx];
  const next: Project = { ...curr, ...patch, updatedAt: now() };
  list[idx] = next;
  writeAll(list);
  return next;
}

export function removeProject(id: string) {
  const list = readAll().filter((x) => x.id !== id);
  writeAll(list);
}

// ---- API de Partidas (Específica para el Cálculo de Gas) ----

/**
 * Busca la partida de cálculo de gas dentro de un proyecto.
 */
export function getGasCalculation(projectId: string): Partida | null {
    const p = getProject(projectId);
    if (!p) return null;
    // Solo puede haber una partida de gas por proyecto.
    return p.partes.find(pt => pt.kind === "gas_instalacion") ?? null;
}

/**
 * Guarda o actualiza la partida de cálculo de gas de un proyecto.
 * Si ya existe, la sobrescribe. Si no, la crea.
 */
export function saveOrUpdateGasCalculation(
  projectId: string,
  data: {
    title: string;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    materials: MaterialRow[];
  }
): Partida | null {
  const list = readAll();
  const projectIndex = list.findIndex((p) => p.id === projectId);
  if (projectIndex < 0) return null;

  const project = list[projectIndex];
  const existingPartidaIndex = project.partes.findIndex(pt => pt.kind === "gas_instalacion");

  if (existingPartidaIndex > -1) {
    // --- ACTUALIZAR PARTIDA EXISTENTE ---
    const currentPartida = project.partes[existingPartidaIndex];
    const updatedPartida: Partida = {
      ...currentPartida,
      title: data.title.trim() || currentPartida.title,
      inputs: data.inputs,
      outputs: data.outputs,
      materials: data.materials,
      updatedAt: now(),
    };
    project.partes[existingPartidaIndex] = updatedPartida;
    project.updatedAt = now();
    writeAll(list);
    return updatedPartida;
  } else {
    // --- CREAR NUEVA PARTIDA ---
    const newPartida: Partida = {
      id: crypto.randomUUID(),
      kind: "gas_instalacion",
      title: data.title.trim() || "Cálculo de Gas",
      inputs: data.inputs,
      outputs: data.outputs,
      materials: data.materials,
      createdAt: now(),
      updatedAt: now(),
    };
    project.partes.push(newPartida);
    project.updatedAt = now();
    writeAll(list);
    return newPartida;
  }
}