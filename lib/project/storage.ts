// lib/project/storage.ts
import { db } from "@/lib/db";
import type { Project, Partida, MaterialRow } from "./types";

const now = () => Date.now();

// --- API de Proyectos (Corregida y funcionando) ---

export async function listProjects(): Promise<Pick<Project, "id" | "name">[]> {
  // --- CORRECCIÓN DEFINITIVA AQUÍ ---
  // 1. Primero esperamos a que la base de datos nos devuelva el array completo de proyectos.
  const allProjects = await db.projects.orderBy("name").toArray();
  // 2. Luego, con el array en mano, lo mapeamos para devolver solo los campos necesarios.
  return allProjects.map(p => ({ id: p.id, name: p.name }));
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function createProject(input: { name: string; client?: string; siteAddress?: string }): Promise<Project> {
  const p: Project = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Proyecto sin nombre",
    client: input.client?.trim() || undefined,
    siteAddress: input.siteAddress?.trim() || undefined,
    partes: [],
    createdAt: now(),
    updatedAt: now(),
  };
  await db.projects.add(p);
  return p;
}

export async function updateProject(id: string, patch: Partial<Pick<Project, "name" | "client" | "siteAddress">>): Promise<Project | null> {
  const updates = { ...patch, updatedAt: now() };
  const updatedCount = await db.projects.update(id, updates);

  if (updatedCount > 0) {
    return getProject(id).then(p => p || null);
  }
  return null;
}

export async function removeProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

// --- API de Partidas (Sin cambios, ya era correcta) ---

export async function getGasCalculation(projectId: string): Promise<Partida | null> {
    const p = await getProject(projectId);
    if (!p) return null;
    return p.partes.find(pt => pt.kind === "gas_instalacion") ?? null;
}

export async function saveOrUpdateGasCalculation(
  projectId: string,
  data: {
    title: string;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    materials: MaterialRow[];
  }
): Promise<Partida | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const existingPartidaIndex = project.partes.findIndex(pt => pt.kind === "gas_instalacion");
  let savedPartida: Partida;

  if (existingPartidaIndex > -1) {
    const currentPartida = project.partes[existingPartidaIndex];
    savedPartida = {
      ...currentPartida,
      title: data.title.trim() || currentPartida.title,
      inputs: data.inputs,
      outputs: data.outputs,
      materials: data.materials,
      updatedAt: now(),
    };
    project.partes[existingPartidaIndex] = savedPartida;
  } else {
    savedPartida = {
      id: crypto.randomUUID(),
      kind: "gas_instalacion",
      title: data.title.trim() || "Cálculo de Gas",
      inputs: data.inputs,
      outputs: data.outputs,
      materials: data.materials,
      createdAt: now(),
      updatedAt: now(),
    };
    project.partes.push(savedPartida);
  }
  
  project.updatedAt = now();
  await db.projects.put(project);

  return savedPartida;
}