"use client";

import { useEffect, useState } from "react";
import {
  listProjects,
  createProject,
  addPartida,
  getActiveProjectId,
  setActiveProjectId,
} from "@/lib/project/storage";
import { rowsToMaterials } from "@/lib/project/helpers";
import type { PartidaKind, MaterialRow } from "@/lib/project/types";

type InputRow = { key?: string; label: string; qty: number; unit: string };

type Props = {
  kind: PartidaKind;
  defaultTitle: string;
  items: InputRow[];
  raw?: Record<string, unknown>;
  /**
   * Si true, arranca con el proyecto activo seleccionado (si existe).
   * Default: true
   */
  useActiveProjectAsDefault?: boolean;
};

export default function AddToProject({
  kind,
  defaultTitle,
  items,
  raw,
  useActiveProjectAsDefault = true,
}: Props) {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [title, setTitle] = useState(defaultTitle);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const list = listProjects();
    setProjects(list);
    if (useActiveProjectAsDefault) {
      const active = getActiveProjectId();
      if (active && list.some((p) => p.id === active)) {
        setProjectId(active);
      }
    }
  }, [useActiveProjectAsDefault]);

  async function handleAdd() {
    if (!items?.length) return;

    setSaving(true);
    try {
      let targetId = projectId;

      if (!targetId) {
        const name = newName.trim() || "Proyecto sin nombre";
        const p = createProject({ name });
        targetId = p.id;
        // si se creó, pasarlo a activo
        setActiveProjectId(targetId);
        setProjects(listProjects());
        setProjectId(targetId);
      }

      const mats: MaterialRow[] = rowsToMaterials(items);

      addPartida(targetId, {
        kind,
        title: title.trim() || defaultTitle,
        inputs: {}, // dejamos listo para cuando guardemos inputs
        outputs: (raw ?? {}) as Record<string, unknown>,
        materials: mats,
      });

      alert("Partida agregada al proyecto ✅");
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar la partida 😕");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-medium">Agregar al proyecto</h3>

      <label className="text-sm block">
        Título de partida
        <input
          className="w-full px-3 py-2 mt-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={defaultTitle}
        />
      </label>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm block">
          Proyecto existente
          <select
            className="w-full px-3 py-2 mt-1"
            value={projectId}
            onChange={(e) => {
              const next = e.target.value;
              setProjectId(next);
              if (next) setActiveProjectId(next);
            }}
          >
            <option value="">— Crear nuevo —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {!projectId && (
          <label className="text-sm block">
            Nombre del nuevo proyecto
            <input
              className="w-full px-3 py-2 mt-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej.: Casa López"
            />
          </label>
        )}
      </div>

      <button className="btn" disabled={saving} onClick={handleAdd}>
        {saving ? "Guardando…" : "Agregar al proyecto"}
      </button>
    </div>
  );
}
