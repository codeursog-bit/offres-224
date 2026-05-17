"use client";
import { useState } from "react";
import MarkdownEditor from "./MarkdownEditor";

export default function NouveauConseilPage() {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    console.log(content);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 font-display">Nouvel article</h1>
        <button onClick={handleSubmit} className="btn-primary px-6 py-2.5 text-sm">
          Publier
        </button>
      </div>
      <MarkdownEditor value={content} onChange={setContent} />
    </div>
  );
}