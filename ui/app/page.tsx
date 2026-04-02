"use client";
import { useState } from "react";
import { Send, UserCircle, ShieldAlert, LifeBuoy, History, Ticket } from "lucide-react";;

export default function Home() {

  const [activeTab, setActiveTab] = useState<"chatbot" | "tichete" | "cont">("chatbot");
  

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);

const handleTrimite = async () => {
    if (!inputText.trim()) return;


    const currentText = inputText;
    setMessages((prev) => [...prev, { text: currentText, sender: "user" }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("http://46.101.205.98:3000/api/v1/prediction/e5613c24-06b4-4284-9950-b36768178ded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          question: currentText,
        })
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { text: data.text || data.answer || "Nu am primit un răspuns valid.", sender: "bot" },
      ]);

    } catch (error) {
      console.error("Eroare ChatBot:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Eroare de conexiune. Verifică dacă Flowise este pornit!", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans flex flex-col items-center">
      
      {/* Meniul de Navigație */}
      <nav className="mt-8 bg-[#1A202C] text-white rounded-full px-2 py-2 flex items-center shadow-lg transition-all">
        <button 
          onClick={() => setActiveTab("chatbot")}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === "chatbot" ? "bg-white/20" : "hover:bg-white/10"}`}
        >
          ChatBot
        </button>
        <button 
          onClick={() => setActiveTab("tichete")}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === "tichete" ? "bg-white/20" : "hover:bg-white/10"}`}
        >
          Tichete
        </button>
        <button 
          onClick={() => setActiveTab("cont")}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === "cont" ? "bg-white/20" : "hover:bg-white/10"}`}
        >
          Contul Tau
        </button>
      </nav>

      {/* Randează conținutul în funcție de tab-ul selectat */}
      <main className="w-full max-w-4xl mt-12 px-6 pb-12 flex-1 flex flex-col">
        
        {/* CHATBOT */}
        {activeTab === "chatbot" && (
          <div className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto animation-fade-in">
            
            {messages.length === 0 ? (
              // Starea goală (exact ca în Figma)
              <div className="flex flex-col items-center text-center mt-20 mb-12">
                <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">Cu ce te pot ajuta?</h1>
                <p className="flex items-center gap-2 text-slate-500">
                  <ShieldAlert size={18} /> Te rog să nu folosești date sensibile!
                </p>
              </div>
            ) : (
              // Istoricul chat-ului
              <div className="w-full flex-1 overflow-y-auto mb-8 space-y-4 p-4 min-h-[40vh] max-h-[60vh] scrollbar-thin">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 max-w-[80%] shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-500 p-4 rounded-2xl rounded-tl-sm animate-pulse flex gap-2 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animation-delay-200"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animation-delay-400"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input-ul de Chat */}
            <div className="w-full relative mt-auto">
              <div className="bg-[#1A202C] rounded-3xl p-2 flex flex-col shadow-xl">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleTrimite();
                    }
                  }}
                  placeholder="Scrie intrebarea aici"
                  className="w-full bg-transparent text-white placeholder-slate-400 p-4 outline-none resize-none min-h-[80px]"
                />
                <div className="flex justify-end p-2">
                  <button
                    onClick={handleTrimite}
                    disabled={!inputText.trim() || isLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-full transition-all flex items-center gap-2"
                  >
                    Trimite mesaj <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTUL TĂU */}
        {activeTab === "cont" && (
          <div className="w-full max-w-2xl mx-auto mt-10 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animation-fade-in">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Contul Tau</h2>
              
              <div className="bg-[#EEF2F6] rounded-2xl p-6 flex items-center gap-8 mb-10">
                <div className="bg-white p-4 rounded-full shadow-sm text-slate-400">
                  <UserCircle size={64} strokeWidth={1.5} />
                </div>
                <div className="space-y-2 text-slate-700 font-medium">
                  <p><span className="text-slate-500 mr-2">Nume:</span> Abc</p>
                  <p><span className="text-slate-500 mr-2">Prenume:</span> Mariana</p>
                  <p><span className="text-slate-500 mr-2">Functie:</span> -</p>
                  <p><span className="text-slate-500 mr-2">Departament:</span> Asistenta sociala</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button className="flex-1 bg-[#2C629E] hover:bg-[#1A457B] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <LifeBuoy size={20} /> Contacteaza departamentul IT
                </button>
                <button className="flex-1 bg-[#2C629E] hover:bg-[#1A457B] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <History size={20} /> Vizualizare istoric
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TICHETE */}
        {activeTab === "tichete" && (
          <div className="w-full max-w-4xl mx-auto mt-10 animation-fade-in">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col min-h-[500px]">
              
              {/* Titlul */}
              <h2 className="text-xl font-bold text-slate-800 mb-8">Tichetele mele</h2>
              
              {/* Zona goală unde vor veni tichetele (Portocaliu/Verde) */}
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl mb-8">
                <p>Aici vor apărea tichetele tale...</p>
              </div>

              {/* Butoanele de la baza cardului */}
              <div className="flex flex-col items-center gap-4 mt-auto">
                <button className="px-8 py-3 bg-[#EEF2F6] hover:bg-slate-200 text-[#1A202C] font-semibold rounded-full transition-colors w-72 shadow-sm">
                  Raport solicitari tichete
                </button>
                <button className="px-8 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold rounded-full transition-colors w-72 shadow-sm">
                  CREEAZA TICHET
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}