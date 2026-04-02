"use client";
import { useState } from "react";
import { Send, UserCircle, ShieldAlert, LifeBuoy, User, Phone, Mail, Clock, X, UserPlus } from "lucide-react";
import { checkLogin } from './action';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"chatbot" | "tichete" | "cont">("chatbot");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError("");

    try {
      const rezultat = await checkLogin(email, password);

      if (rezultat?.error) {
        setLoginError(rezultat.error);
      } else if (rezultat?.success) {
        setCurrentUser(rezultat.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      setLoginError("Eroare de sistem.");
    } finally {
      setIsLoginLoading(false);
    }
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setMessages([]);
    setActiveTab("chatbot");
  };

  const handleTrimite = async () => {
    if (!inputText.trim()) return;

    const currentText = inputText;
    setMessages((prev) => [...prev, { text: currentText, sender: "user" }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("http://46.101.205.98:3000/api/v1/prediction/e5613c24-06b4-4284-9950-b36768178ded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentText })
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { text: data.text || data.answer || "Răspuns Flowise...", sender: "bot" },
      ]);
    } catch (error) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Flowise nu este conectat inca, dar interfata merge perfect!", sender: "bot" },
        ]);
        setIsLoading(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center font-sans relative">
          <div className="w-full max-w-md p-8 flex flex-col items-center animation-fade-in">
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-4 bg-white/5 p-4 rounded-full border border-white/10 shadow-lg">
                <User size={56} className="text-blue-400" strokeWidth={1} />
              </div>
              <h1 className="text-3xl text-white font-light tracking-wide mt-2">Autentificare</h1>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-6">
              
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center font-light">
                  {loginError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-slate-300 text-sm ml-4 font-light">Email*</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="introduceti adresa de email"
                  className="w-full bg-[#E2E8F0] text-slate-800 placeholder-slate-500 px-6 py-4 rounded-full outline-none focus:ring-4 focus:ring-blue-500/50 transition-all font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-300 text-sm ml-4 font-light">Parola*</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="introduceti parola"
                  className="w-full bg-[#E2E8F0] text-slate-800 placeholder-slate-500 px-6 py-4 rounded-full outline-none focus:ring-4 focus:ring-blue-500/50 transition-all font-light"
                  required
                />
              </div>
              <div className="pt-6 flex justify-center">
                <button 
                  type="submit" 
                  disabled={isLoginLoading}
                  className="bg-[#3B82F6] hover:bg-blue-500 disabled:opacity-50 text-white px-14 py-3.5 rounded-full font-medium transition-all shadow-lg transform hover:scale-105"
                >
                  {isLoginLoading ? "Se incarca..." : "Login"}
                </button>
              </div>
            </form>

            <div className="mt-16 text-center text-slate-400 text-sm font-light">
              <p>Ai probleme cu accesul?</p>
              <button 
                type="button" 
                onClick={() => setIsContactModalOpen(true)} 
                className="hover:text-blue-400 transition-colors mt-1 inline-block"
              >
                Contacteaza departamentul IT
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-[#F0F2F5] font-sans flex flex-col items-center animation-fade-in relative">
          <nav className="mt-8 bg-[#1A202C] text-white rounded-full px-2 py-2 flex items-center shadow-lg transition-all font-light">
            <button onClick={() => setActiveTab("chatbot")} className={`px-6 py-2 rounded-full transition-colors ${activeTab === "chatbot" ? "bg-white/20" : "hover:bg-white/10"}`}>ChatBot</button>
            <button onClick={() => setActiveTab("tichete")} className={`px-6 py-2 rounded-full transition-colors ${activeTab === "tichete" ? "bg-white/20" : "hover:bg-white/10"}`}>Tichete</button>
            <button onClick={() => setActiveTab("cont")} className={`px-6 py-2 rounded-full transition-colors ${activeTab === "cont" ? "bg-white/20" : "hover:bg-white/10"}`}>Contul Tau</button>
          </nav>

          <main className="w-full max-w-4xl mt-12 px-6 pb-12 flex-1 flex flex-col">
            {activeTab === "chatbot" && (
              <div className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto animation-fade-in">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center text-center mt-20 mb-12">
                    <h1 className="text-3xl font-normal text-slate-800 mb-3 tracking-wide">Cu ce te pot ajuta, {currentUser?.prenume}?</h1>
                    <p className="flex items-center gap-2 text-slate-500 font-light"><ShieldAlert size={18} strokeWidth={1.5} /> Te rog să nu folosești date sensibile!</p>
                  </div>
                ) : (
                  <div className="w-full flex-1 overflow-y-auto mb-8 space-y-4 p-4 min-h-[40vh] max-h-[60vh] scrollbar-thin">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`p-4 max-w-[80%] shadow-sm font-light ${msg.sender === "user" ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm" : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm"}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 text-slate-500 p-4 rounded-2xl rounded-tl-sm animate-pulse font-light">Tipareste...</div>
                      </div>
                    )}
                  </div>
                )}
                <div className="w-full relative mt-auto">
                  <div className="bg-[#1A202C] rounded-3xl p-2 flex flex-col shadow-xl">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTrimite(); } }}
                      placeholder="Scrie intrebarea aici ..."
                      className="w-full bg-transparent text-white placeholder-slate-400 p-4 outline-none resize-none min-h-[80px] font-light"
                    />
                    <div className="flex justify-end p-2">
                      <button onClick={handleTrimite} disabled={!inputText.trim() || isLoading} className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-full transition-all flex items-center gap-2">
                        Trimite mesaj <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cont" && (
              <div className="w-full max-w-2xl mx-auto mt-10 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animation-fade-in">
                <div className="p-8">
                  <h2 className="text-2xl font-medium text-center text-slate-800 mb-8">Contul Tau</h2>
                  <div className="bg-[#EEF2F6] rounded-2xl p-6 flex items-center gap-8 mb-8">
                    <div className="bg-white p-4 rounded-full shadow-sm text-slate-400"><UserCircle size={64} strokeWidth={1} /></div>
                    <div className="space-y-2 text-slate-700 font-light">
                      <p><span className="text-slate-500 mr-2 font-medium">Nume:</span> {currentUser?.nume} {currentUser?.prenume}</p>
                      <p><span className="text-slate-500 mr-2 font-medium">Email:</span> {currentUser?.email}</p>
                      <p><span className="text-slate-500 mr-2 font-medium">Departament:</span> {currentUser?.departament}</p>
                      <p><span className="text-slate-500 mr-2 font-medium">Rol:</span> {currentUser?.rol}</p>
                    </div>
                  </div>

                  {currentUser?.rol === "ADMIN" && (
                    <div className="mb-6">
                      <button 
                        onClick={() => router.push("/admin/creare-utilizator")}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <UserPlus size={20} /> Adauga Membru Nou
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <button 
                      onClick={() => setIsContactModalOpen(true)} 
                      className="flex-1 bg-[#2C629E] hover:bg-[#1A457B] text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <LifeBuoy size={20} /> Contacteaza IT
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors" 
                    >
                      Iesi din cont (Logout)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tichete" && (
              <div className="w-full max-w-4xl mx-auto mt-10 animation-fade-in">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col min-h-[500px]">
                  <h2 className="text-xl font-medium text-slate-800 mb-8">Tichetele mele</h2>
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl mb-8 font-light">
                    <p>Aici vor apărea tichetele tale...</p>
                  </div>
                  <div className="flex flex-col items-center gap-4 mt-auto">
                    <button className="px-8 py-3 bg-[#EEF2F6] hover:bg-slate-200 text-[#1A202C] font-medium rounded-full w-72 transition-colors">Raport solicitari</button>
                    <button className="px-8 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-full w-72 transition-colors">CREEAZA TICHET</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animation-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-medium text-slate-800 mb-6 flex items-center gap-3">
              <LifeBuoy className="text-blue-500" size={28} strokeWidth={1.5} />
              Suport Tehnic
            </h3>
            
            <div className="space-y-4 font-light">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Telefon Urgențe</p>
                  <p className="text-lg text-slate-700">021 999 8888</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Email Suport</p>
                  <p className="text-lg text-slate-700">it@primarie.ro</p>
                </div>
              </div>

  
            </div>

          </div>
        </div>
      )}
    </>
  );
}