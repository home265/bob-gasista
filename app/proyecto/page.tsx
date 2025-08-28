// app/proyecto/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  listProjects,
  createProject,
  removeProject,
} from "@/lib/project/storage";

// Definimos un tipo para la lista de proyectos para mayor claridad
type ProjectListItem = {
  id: string;
  name: string;
};

export default function ProyectosPage() {
  const router = useRouter();
  // Estado para la lista de proyectos. Inicializa como un array vacío.
  const [list, setList] = useState<ProjectListItem[]>([]);
  // Nuevo estado para saber cuándo estamos cargando datos de la base de datos.
  const [isLoading, setIsLoading] = useState(true);
  // Estado para el input de nuevo proyecto.
  const [name, setName] = useState("");

  // Usamos useCallback para que la función de refresco no se cree en cada render.
  const refreshList = useCallback(async () => {
    setIsLoading(true); // Ponemos en modo "cargando"
    try {
      // Llamamos a la nueva función asíncrona y esperamos el resultado.
      const projects = await listProjects();
      setList(projects);
    } catch (error) {
      console.error("Error al cargar los proyectos:", error);
      // Opcional: mostrar un mensaje de error al usuario.
    } finally {
      setIsLoading(false); // Quitamos el modo "cargando", haya funcionado o no.
    }
  }, []);

  // useEffect ahora llama a refreshList solo una vez, cuando el componente se monta.
  useEffect(() => {
    refreshList();
  }, [refreshList]);

  // La función de crear ahora es 'async' para poder usar 'await'.
  async function handleCreateAndOpen() {
    if (!name.trim()) return; // Evitamos crear proyectos sin nombre
    const p = await createProject({ name: name.trim() });
    // Navegamos solo después de que el proyecto se haya creado exitosamente.
    router.push(`/proyecto/${p.id}/calculo`);
  }

  // La función de eliminar también es 'async'.
  async function handleRemove(id: string) {
    if (!confirm("¿Eliminar proyecto y todos sus cálculos? Esta acción no se puede deshacer.")) return;
    await removeProject(id);
    // Refrescamos la lista para que el proyecto eliminado desaparezca de la UI.
    await refreshList();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mis Proyectos de Gas</h1>
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
            disabled={isLoading} // Deshabilitamos el input mientras carga
          />
          <button className="btn btn-primary" onClick={handleCreateAndOpen} disabled={isLoading}>
            Crear y Abrir Calculadora
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-3">Proyectos Existentes</h2>
        {isLoading ? (
          <p className="text-sm text-foreground/60">Cargando proyectos...</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-foreground/60">No hay proyectos todavía. ¡Crea el primero!</p>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => (
              <li key={p.id} className="border rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="font-medium">{p.name}</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto">
  {/* Para el botón principal, usamos btn-primary para ser más explícitos */}
  <Link className="btn btn-primary text-center" href={`/proyecto/${p.id}/calculo`}>
    Editar/Ver Cálculo
  </Link>
  {/* AÑADIMOS la clase 'btn' que faltaba */}
  <Link className="btn btn-secondary text-center" href={`/proyecto/${p.id}`}>
    Ver Resumen y Exportar
  </Link>
  {/* AÑADIMOS la clase 'btn' que faltaba */}
  <button className="btn btn-danger" onClick={() => handleRemove(p.id)}>
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