"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  listProjects,
  createProject,
  removeProject,
  setActiveProjectId,
  getActiveProjectId,
} from "@/lib/project/storage";

export default function ProyectosPage() {
  const router = useRouter();
  const [list, setList] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    refreshList();
  }, []);

  function refreshList() {
    setList(listProjects());
    setActiveId(getActiveProjectId());
  }

  function handleCreateAndOpen() {
    const p = createProject({ name: name.trim() || "Proyecto sin nombre" });
    setActiveProjectId(p.id);
    router.push(`/proyecto/${p.id}/calculo`);
  }

  function handleRemove(id: string) {
    if (!confirm("¿Eliminar proyecto y todos sus cálculos? Esta acción no se puede deshacer.")) return;
    removeProject(id);
    refreshList();
  }

  function handleSetActive(id: string) {
    // Si ya está activo, lo desactivamos. Si no, lo activamos.
    const nextActiveId = activeId === id ? "" : id;
    setActiveProjectId(nextActiveId);
    refreshList();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mis Instalaciones de Gas</h1>
        <p className="text-sm text-foreground/70">Crea un proyecto nuevo o continúa con uno existente.</p>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-medium">Crear Nuevo Proyecto</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="border rounded px-3 py-2 flex-grow"
            placeholder="Ej: Casa Familia Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAndOpen()}
          />
          <button className="btn btn-primary" onClick={handleCreateAndOpen}>
            Crear y Abrir Calculadora
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-3">Proyectos Existentes</h2>
        {list.length === 0 ? (
          <p className="text-sm text-foreground/60">No hay proyectos todavía. ¡Crea el primero!</p>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => (
              <li key={p.id} className="border rounded p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{p.name}</span>
                  {activeId === p.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-800/50 text-green-300 border border-green-700/60">
                      activo
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link className="btn" href={`/proyecto/${p.id}/calculo`}>
                    Ir a la Calculadora
                  </Link>
                  <button className="btn-secondary" onClick={() => handleSetActive(p.id)}>
                    {activeId === p.id ? "Quitar activo" : "Hacer activo"}
                  </button>
                  <button className="btn-danger" onClick={() => handleRemove(p.id)}>
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