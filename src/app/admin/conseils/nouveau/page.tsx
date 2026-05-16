"use client";
import { useState } from "react";

export default function MarkdownEditor({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const insertStyle = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("md-editor") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newVal = `${before}${prefix}${selected}${suffix}${after}`;
    onChange(newVal);
  };

  const actions = [
    { label: "B", style: ["**", "**"], title: "Gras" },
    { label: "I", style: ["*", "*"], title: "Italique" },
    { label: "H2", style: ["## ", ""], title: "Titre 2" },
    { label: "List", style: ["- ", ""], title: "Liste" },
    { label: "Link", style: ["[", "](url)"], title: "Lien" },
  ];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {actions.map(a => (
          <button
            key={a.label}
            type="button"
            onClick={() => insertStyle(a.style[0], a.style[1])}
            className="w-8 h-8 flex items-center justify-center text-xs font-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
            title={a.title}
          >
            {a.label}
          </button>
        ))}
      </div>
      <textarea
        id="md-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-6 min-h-[400px] outline-none font-mono text-sm leading-relaxed"
        placeholder="Rédigez votre article en Markdown..."
      />
    </div>
  );
}