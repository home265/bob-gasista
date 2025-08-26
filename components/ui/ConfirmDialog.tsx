"use client";
import React from "react";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-[min(92vw,480px)] rounded-lg bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {message ? <p className="text-sm text-foreground/70 mb-3">{message}</p> : null}
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
