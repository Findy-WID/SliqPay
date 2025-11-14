"use client";

import Image from "next/image";
import { X, Check } from "lucide-react";
import React from "react";

export type Network = {
  code: string;
  name: string;
  logo?: string; // public path
};

type Props = {
  open: boolean;
  onClose: () => void;
  selected?: string;
  networks: Network[];
  onSelect: (code: string) => void;
};

export default function NetworkPickerSheet({ open, onClose, selected, networks, onSelect }: Props) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white shadow-2xl",
          "rounded-t-2xl",
          "transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <h3 className="text-base font-bold text-gray-900">Select Network</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        {/* List */}
        <div className="px-3 pb-6 max-h-[60vh] overflow-y-auto">
          {networks.map((n) => (
            <button
              key={n.code}
              onClick={() => onSelect(n.code)}
              className="w-full flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {/* Logo */}
                {n.logo ? (
                  <div className="h-9 w-9 rounded-full bg-white border grid place-items-center overflow-hidden">
                    <Image src={n.logo} alt={n.name} width={28} height={28} className="object-contain" />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 grid place-items-center text-xs font-bold">
                    {n.name[0]}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-900">{n.name}</span>
              </div>
              <div className="h-6 w-6">
                {selected === n.code ? (
                  <div className="h-6 w-6 rounded-full bg-cyan-500 text-white grid place-items-center">
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-100 grid place-items-center text-gray-400">
                    <Check size={14} strokeWidth={3} className="opacity-40" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
