"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listProjects,
  createProject,
  removeProject,
  setActiveProjectId,
  getActiveProjectId,
} from "@/lib/project/storage";

export default function ProyectosPage() {
  const [list, setList] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    setList(listProjects());
    // Corrección 1:
    setActive(getActiveProjectId() ?? "");
  }, []);

  function refresh() {
    setList(listProjects());
    // Corrección 2:
    setActive(getActiveProjectId() ?? "");
  }

  function onCreate() {
    const p = createProject({ name: name.trim() || "Proyecto sin nombre" });
    setName("");
    setActiveProjectId(p.id);
    refresh();
  }

  function onRemove(id: string) {
    if (!confirm("¿Eliminar proyecto y todas sus partidas?")) return;
    removeProject(id);
    refresh();
  }

  function onSetActive(id: string) {
    setActiveProjectId(id);
    refresh();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Proyectos</h1>

      <div className="card p-4 space-y-3">
        <h2 className="font-medium">Crear nuevo</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Nombre del proyecto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn" onClick={onCreate}>
            Crear
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-2">Listado</h2>
        {list.length === 0 ? (
          <p className="text-sm text-foreground/60">No hay proyectos todavía.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => (
              <li key={p.id} className="border rounded p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{p.name}</span>
                  {active === p.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[color:var(--color-neutral)]">
                      activo
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link className="btn-secondary" href={`/proyecto/${p.id}`}>
                    Abrir
                  </Link>
                  <button className="btn-secondary" onClick={() => onSetActive(p.id)}>
                    {active === p.id ? "Quitar activo" : "Hacer activo"}
                  </button>
                  <button className="btn-danger" onClick={() => onRemove(p.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}