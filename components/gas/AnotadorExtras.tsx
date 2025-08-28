// components/gas/AnotadorExtras.tsx
"use client";

import { useState } from "react";

type ExtraItem = {
  id: string;
  nombre: string;
  cantidad: number;
};

export default function AnotadorExtras() {
  const [items, setItems] = useState<ExtraItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        nombre: newItemName.trim(),
        cantidad: newItemQty,
      },
    ]);
    setNewItemName("");
    setNewItemQty(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground/70">
        Agrega aquí otros materiales que necesites recordar y que no son parte del cálculo automático (ej: teflón, sellador, etc.).
      </p>
      
      {/* --- LISTA DE ITEMS --- */}
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-muted/40 p-2 rounded-md text-sm">
              <span>{item.nombre}</span>
              <div className="flex items-center gap-3">
                 <span>Cantidad: <strong>{item.cantidad}</strong></span>
                 {/* --- ESTILO DE BOTÓN "QUITAR" ACTUALIZADO --- */}
                 <button 
                    onClick={() => handleRemoveItem(item.id)} 
                    className="btn btn-ghost text-red-500 hover:bg-red-900/40 text-xs py-1 px-2"
                 >
                    Quitar
                 </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-foreground/60 py-3">No hay materiales adicionales.</p>
        )}
      </div>

      {/* --- FORMULARIO PARA AGREGAR --- */}
      <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-border">
        <label className="text-sm flex-grow min-w-[200px]">
          <span className="font-medium">Nombre del Ítem</span>
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full px-3 py-2 mt-1"
            placeholder="Ej: Cinta de teflón"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Cantidad</span>
          <input
            type="number"
            value={newItemQty}
            onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-24 px-3 py-2 mt-1 text-center"
          />
        </label>
        {/* --- ESTILO DE BOTÓN "+ AGREGAR" ACTUALIZADO --- */}
        <button type="button" onClick={handleAddItem} className="btn btn-secondary">
          + Agregar
        </button>
      </div>
    </div>
  );
}