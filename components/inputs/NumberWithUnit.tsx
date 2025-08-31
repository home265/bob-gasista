"use client";
import React, { useEffect, useState } from "react";

type Props = {
  label: React.ReactNode;
  name: string;
  unit?: string;
  value: number | string;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
};

export default function NumberWithUnit({
  label,
  name,
  unit,
  value,
  onChange,
  step = 0.01,
  min = 0,
}: Props) {
  const [raw, setRaw] = useState<string>(value === 0 ? "0" : String(value ?? ""));
  useEffect(() => {
    const next = value === 0 ? "0" : String(value ?? "");
    if (next !== raw) setRaw(next);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const toNumber = (s: string) => (s.trim() === "" ? NaN : parseFloat(s.replace(",", ".")));
  const commit = () => {
    const n = toNumber(raw);
    const val = Number.isFinite(n) ? n : 0;
    onChange(val);
    setRaw(String(val));
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          name={name}
          type="text"
          inputMode="decimal"
          className="w-40 rounded border px-3 py-2"
          step={step}
          min={min}
          value={raw}
          onChange={(e) => {
            const v = e.target.value;
            if (/^-?\d*(?:[.,]\d*)?$/.test(v) || v === "") {
              setRaw(v);
              const n = toNumber(v);
              if (Number.isFinite(n)) onChange(n);
            }
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") (e.currentTarget as HTMLInputElement).blur();
          }}
        />
        {unit ? <span className="text-gray-600">{unit}</span> : null}
      </div>
    </label>
  );
}