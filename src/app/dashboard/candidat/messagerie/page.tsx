// app/dashboard/candidat/messagerie/page.tsx
"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function MessageriePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState(Cookies.get("last_conv_id") || null);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Connexion SSE
    const eventSource = new EventSource("/api/messages/stream");
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };
    return () => eventSource.close();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Appel API POST /api/messages...
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-180px)] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex">
      {/* Liste des conversations */}
      <div className="w-80 border-r border-gray-50 flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <h2 className="font-black text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2].map((i) => (
            <button 
              key={i}
              onClick={() => { setActiveConv(i.toString()); Cookies.set("last_conv_id", i.toString()); }}
              className={`w-full p-6 flex gap-4 items-center hover:bg-gray-50 transition-colors ${activeConv === i.toString() ? 'bg-purple-50' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-[#7B2D8B] text-white flex items-center justify-center font-bold">MT</div>
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900">MTN Congo</div>
                <div className="text-xs text-gray-400 line-clamp-1">Votre candidature a été retenue...</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de Chat */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {activeConv ? (
          <>
            <div className="p-6 bg-white border-b border-gray-50 flex justify-between items-center">
              <span className="font-bold text-gray-900">MTN Congo</span>
              <span className="text-[10px] text-teal-500 font-black uppercase">En ligne</span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {/* Bulles de messages */}
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-600">
                  Bonjour, nous avons bien reçu votre CV. Êtes-vous disponible pour un entretien à Brazzaville ?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-[#7B2D8B] p-4 rounded-2xl rounded-tr-none shadow-sm text-sm text-white">
                  Bonjour, oui je suis disponible dès lundi prochain.
                </div>
              </div>
            </div>
            <div className="p-6 bg-white">
              <div className="flex gap-4">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#7B2D8B] text-sm"
                />
                <button 
                  onClick={sendMessage}
                  className="w-14 h-14 bg-[#7B2D8B] text-white rounded-2xl flex items-center justify-center hover:shadow-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-bold">
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
}