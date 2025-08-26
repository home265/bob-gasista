"use client";
import React from "react";

export type ResultRow = {
  label: string;
  qty?: number | string;
  unit?: string;
  hint?: string;
};

type Props = {
  title?: string;
  items: ResultRow[];
  dense?: boolean;
};

export default function ResultTable({ title, items, dense = false }: Props) {
  return (
    <div className="space-y-2">
      {title ? <h2 className="font-medium">{title}</h2> : null}
      <table className={`w-full text-sm ${dense ? "" : ""}`}>
        <thead className="text-foreground/60">
          <tr>
            <th className="text-left py-1">Ítem</th>
            <th className="text-right py-1">Cantidad</th>
            <th className="text-left py-1">Unidad</th>
            <th className="text-left py-1">Nota</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={`${r.label}-${i}`} className="border-t">
              <td className="py-1">{r.label}</td>
              <td className="py-1 text-right">
                {typeof r.qty === "number" ? Math.round(r.qty * 100) / 100 : r.qty ?? ""}
              </td>
              <td className="py-1">{r.unit ?? ""}</td>
              <td className="py-1 text-foreground/60">{r.hint ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
