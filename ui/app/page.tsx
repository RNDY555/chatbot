"use client";
import { useState, useEffect, useMemo } from "react";
import { Send, UserCircle, ShieldAlert, User, Phone, Mail, X, UserPlus, HelpCircle, Moon, Sun, MessageSquare, Search, ExternalLink, BarChart3, FileText } from "lucide-react";
import { checkLogin, saveMessage, getChatHistory } from "./action";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChatSession {
  id: string;
  title: string;
  messages: { text: string; sender: "user" | "bot" }[];
}

interface Ticket {
  id: string;
  subiect: string;
  status: string;
  createdAt: string;
}

const culoriDepartamente = ["#3B82F6", "#EF4444", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6"];

export default function Home() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"chatbot" | "tichete" | "cont">("chatbot");
  const [darkMode, setDarkMode] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportDepartamente, setReportDepartamente] = useState<string[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // State pop-up curat (doar text) pentru Creare Tichet
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubiect, setTicketSubiect] = useState("");
  const [ticketDescriere, setTicketDescriere] = useState("");
  const [isTicketLoading, setIsTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }

    const savedUser = localStorage.getItem("currentUserData");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      
      const savedSessions = localStorage.getItem(`chat_sessions_${user.id}`);
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const fetchTickets = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/tichete?userId=${currentUser.id}&rol=${currentUser.rol}&departament=${currentUser.departament}`);
      const data = await response.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (error) {}
  };

  useEffect(() => {
    if (activeTab === "tichete" && isLoggedIn) {
      fetchTickets();
    }
  }, [activeTab, isLoggedIn, currentUser]);

  useEffect(() => {
    if (isLoggedIn && currentUser && sessions.length > 0) {
      localStorage.setItem(`chat_sessions_${currentUser.id}`, JSON.stringify(sessions));
    }
  }, [sessions, currentUser, isLoggedIn]);

  const handleCreeazaTichet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTicketLoading(true);
    setTicketError("");
    setTicketSuccess(false);

    try {
      const response = await fetch("/api/tichete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subiect: ticketSubiect,
          descriere: ticketDescriere,
          userId: currentUser?.id
        })
      });

      if (!response.ok) {
        setTicketError("Nu s-a putut crea tichetul.");
        return;
      }

      setTicketSuccess(true);
      setTimeout(() => {
        setIsTicketModalOpen(false);
        setTicketSuccess(false);
        setTicketSubiect("");
        setTicketDescriere("");
        fetchTickets(); 
      }, 1500);

    } catch (error) {
      setTicketError("Eroare de conexiune la server.");
    } finally {
      setIsTicketLoading(false);
    }
  };

  const handleOpenReport = async () => {
    setIsReportModalOpen(true);
    setIsReportLoading(true);
    try {
      const response = await fetch("/api/raport");
      const data = await response.json();
      if (response.ok) {
        setReportData(data.data);
        setReportDepartamente(data.departamente);
      }
    } catch (error) {
    } finally {
      setIsReportLoading(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const filteredSessions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return sessions;
    return sessions.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.messages.some(m => m.text.toLowerCase().includes(term))
    );
  }, [sessions, searchTerm]);

  const filteredMessages = useMemo(() => {
    if (!activeSession) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return activeSession.messages;
    return activeSession.messages.filter(m => m.text.toLowerCase().includes(term));
  }, [activeSession, searchTerm]);

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
        localStorage.setItem("currentUserData", JSON.stringify(rezultat.user));
        
        const istoric = await getChatHistory(rezultat.user.id);
        localStorage.removeItem(`chat_sessions_${rezultat.user.id}`);
        
        if (istoric && istoric.length > 0) {
          const sessionFromDB: ChatSession = {
            id: "db_history",
            title: "Conversație istoric",
            messages: istoric.map((m: any) => ({ text: m.text, sender: m.sender }))
          };
          setSessions([sessionFromDB]);
          setActiveSessionId(sessionFromDB.id);
        } else {
          setSessions([]);
          setActiveSessionId(null);
        }
        setIsLoggedIn(true);
      }
    } catch (error) {
      setLoginError("Eroare de sistem.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUserData");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setSessions([]);
    setActiveSessionId(null);
    setActiveTab("chatbot");
  };

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `Discuție nouă ${sessions.length + 1}`,
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setSearchTerm("");
    return newId;
  };

  const handleTrimite = async (forcedText?: string) => {
    const textToSend = forcedText || inputText;
    if (!textToSend.trim()) return;

    let targetId = activeSessionId;
    if (!targetId) targetId = createNewSession();

    if (!forcedText) setInputText("");

    setSessions(prev => prev.map(s => 
      s.id === targetId 
      ? { ...s, messages: [...s.messages, { text: textToSend, sender: "user" }] } 
      : s
    ));

    setIsLoading(true);
    try {
      const response = await fetch("http://46.101.205.98:3000/api/v1/prediction/e5613c24-06b4-4284-9950-b36768178ded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend })
      });
      
      const rawText = await response.text();
      let botText = "";
      try {
        const data = JSON.parse(rawText);
        botText = data.text || data.answer || data.message || data.response || JSON.stringify(data);
      } catch (err) {
        botText = rawText;
      }

      setSessions(prev => prev.map(s => 
        s.id === targetId 
        ? { ...s, messages: [...s.messages, { text: botText, sender: "bot" }] } 
        : s
      ));
      
      await saveMessage(currentUser.id, textToSend, "user");
      await saveMessage(currentUser.id, botText, "bot");
    } catch (error) {
      setSessions(prev => prev.map(s => 
        s.id === targetId 
        ? { ...s, messages: [...s.messages, { text: "Eroare conexiune AI. Vă rugăm să reîncercați.", sender: "bot" }] } 
        : s
      ));
    } finally { 
      setIsLoading(false); 
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <>
      {!isLoggedIn ? (
        <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center font-sans relative">
          <div className="w-full max-w-md p-8 flex flex-col items-center animation-fade-in relative z-10">
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-4 bg-transparent p-4 rounded-full text-white">
                <User size={64} strokeWidth={1} />
              </div>
              <h1 className="text-3xl text-white font-light mt-2 tracking-wide">Autentificare</h1>
            </div>
            
            <form onSubmit={handleLogin} className="w-full space-y-6">
              {loginError && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center font-light">{loginError}</div>}
              
              <div className="space-y-2">
                <label className="text-white text-sm ml-4 font-light tracking-wide">Email*</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Introdu adresa de email" 
                  className="w-full bg-[#E2E8F0] text-slate-800 placeholder-slate-400 px-6 py-4 rounded-full outline-none font-light" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm ml-4 font-light tracking-wide">Parola*</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Introdu parola" 
                  className="w-full bg-[#E2E8F0] text-slate-800 placeholder-slate-400 px-6 py-4 rounded-full outline-none font-light" 
                  required 
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isLoginLoading} 
                  className="bg-[#3B82F6] hover:bg-blue-500 disabled:opacity-50 text-white px-14 py-3.5 rounded-full font-medium transition-all shadow-lg transform hover:scale-105 mx-auto block"
                >
                  {isLoginLoading ? "Se incarca..." : "Login"}
                </button>
              </div>
            </form>

            <div className="mt-16 text-center text-slate-400 text-sm font-light relative z-20">
              <p>Ai probleme cu accesul?</p>
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); setIsContactModalOpen(true); }} 
                className="hover:text-white transition-colors mt-1 inline-block cursor-pointer tracking-wide"
              >
                Contactează departamentul IT
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0F172A] font-sans transition-colors duration-300 flex flex-col items-center relative">
          <nav className="mt-8 bg-[#1A202C] text-white rounded-full px-2 py-2 flex items-center shadow-lg transition-all font-light">
            <button onClick={() => setActiveTab("chatbot")} className={`px-6 py-2 rounded-full transition-colors ${activeTab === "chatbot" ? "bg-white/20" : "hover:bg-white/10"}`}>Chatbot</button>
            <button onClick={() => setActiveTab("tichete")} className={`px-6 py-2 rounded-full transition-colors ${activeTab === "tichete" ? "bg-white/20" : "hover:bg-white/10"}`}>Tichete</button>
            <button onClick={() => setActiveTab("cont")} className={`px-6 py-2 rounded-full transition-colors ${activeTab === "cont" ? "bg-white/20" : "hover:bg-white/10"}`}>Contul Tau</button>
          </nav>

          <div className="absolute top-8 right-8">
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-600 dark:text-yellow-400 transition-all">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <main className="w-full max-w-6xl mt-12 px-6 pb-12 flex-1 flex flex-col">
            {activeTab === "chatbot" && (
              <div className="flex w-full h-[75vh] bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col p-4">
                  <button onClick={createNewSession} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-all mb-4 shadow-sm">
                    + Conversație nouă
                  </button>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input type="text" placeholder="Caută în chat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-700 dark:text-slate-300 font-light" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3 ml-1">Sesiuni Recente</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                    {filteredSessions.map((s) => (
                      <div key={s.id} onClick={() => setActiveSessionId(s.id)} className={`p-3 rounded-xl text-sm cursor-pointer truncate transition-all flex items-center gap-2 ${activeSessionId === s.id ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <MessageSquare size={14} /> {s.title}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col relative bg-white dark:bg-[#1E293B] transition-colors">
                  {!activeSession || activeSession.messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                      <h1 className="text-3xl font-normal text-slate-800 dark:text-white mb-3 tracking-wide">Cu ce te pot ajuta, {currentUser?.prenume}?</h1>
                      <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-light mb-8"><ShieldAlert size={18} strokeWidth={1.5} /> Te rog să nu folosești date sensibile!</p>
                      <button onClick={() => setIsFaqModalOpen(true)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-full font-light hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2"><HelpCircle size={18} /> Sugestii întrebări</button>
                    </div>
                  ) : filteredMessages.length === 0 && searchTerm ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-60">
                      <Search size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 font-light italic">
                        Nu am găsit mesaje care să conțină "{searchTerm}" în această conversație.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                      {filteredMessages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                          <div className={`px-5 py-3.5 max-w-[85%] text-[15px] font-light ${msg.sender === "user" ? "bg-blue-500 text-white rounded-3xl rounded-tr-sm shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-3xl rounded-tl-sm"}`}>
                            {msg.sender === "bot" && <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1 text-xs uppercase">Asistent Primărie</span>}
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isLoading && <div className="flex flex-col items-start px-6 text-slate-400 text-sm animate-pulse font-light italic">Se procesează...</div>}
                    </div>
                  )}

                  <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="max-w-4xl mx-auto flex gap-2 items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
                      <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTrimite(); } }} placeholder="Scrie intrebarea aici ..." className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 p-3 outline-none resize-none min-h-[45px] font-light" />
                      <button onClick={() => handleTrimite()} disabled={isLoading || !inputText.trim()} className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 text-sm rounded-full transition-all flex items-center gap-1.5 h-10">Trimite <Send size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cont" && (
              <div className="w-full max-w-2xl mx-auto mt-10 bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animation-fade-in transition-colors">
                <div className="p-8">
                  <h2 className="text-2xl font-medium text-center text-slate-800 dark:text-white mb-8">Contul Tau</h2>
                  <div className="bg-[#EEF2F6] dark:bg-slate-800/50 rounded-2xl p-6 flex items-center gap-8 mb-8 border border-transparent dark:border-slate-700 transition-colors">
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-full shadow-sm text-slate-400 dark:text-slate-300 transition-colors"><UserCircle size={64} strokeWidth={1} /></div>
                    <div className="space-y-2 text-slate-700 dark:text-slate-300 font-light transition-colors">
                      <p><span className="text-slate-500 dark:text-slate-400 mr-2 font-medium">Nume:</span> {currentUser?.nume} {currentUser?.prenume}</p>
                      <p><span className="text-slate-500 dark:text-slate-400 mr-2 font-medium">Email:</span> {currentUser?.email}</p>
                      <p><span className="text-slate-500 dark:text-slate-400 mr-2 font-medium">Departament:</span> {currentUser?.departament}</p>
                      <p><span className="text-slate-500 dark:text-slate-400 mr-2 font-medium">Rol:</span> {currentUser?.rol}</p>
                    </div>
                  </div>
                  {currentUser?.rol === "ADMIN" && (
                    <div className="mb-6"><button onClick={() => router.push("creare-utilizator")} className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"><UserPlus size={20} /> Adauga Membru Nou</button></div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <button onClick={() => setIsContactModalOpen(true)} className="flex-1 bg-[#2C629E] hover:bg-[#1A457B] text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">Contacteaza IT</button>
                    <button onClick={handleLogout} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">Iesi din cont (Logout)</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tichete" && (
              <div className="w-full max-w-4xl mx-auto mt-10 animation-fade-in">
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col min-h-[500px] transition-colors">
                  <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-8">
                    {currentUser?.rol === "ADMIN" ? `Tichete de rezolvat - ${currentUser.departament}` : "Tichetele mele"}
                  </h2>
                  
                  <div className="flex-1 overflow-y-auto mb-8 scrollbar-thin">
                    {tickets.length > 0 ? (
                      <div className="space-y-4">
                        {tickets.map((ticket) => (
                          <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white">{ticket.subiect}</p>
                              <p className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${ticket.status?.toLowerCase() === 'rezolvat' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{ticket.status}
                            </span>
                              <button 
                                onClick={() => router.push(`/tichete/${ticket.id}`)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <ExternalLink size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl font-light">
                        <p>Momentan nu sunt tichete disponibile.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4 mt-auto">
                    {currentUser?.rol === "ADMIN" && (
                      <button onClick={handleOpenReport} className="px-8 py-3 bg-[#EEF2F6] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1A202C] dark:text-white font-medium rounded-full w-72 transition-colors">
                        Raport solicitari
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setTicketSubiect("");
                        setTicketDescriere("");
                        setTicketError("");
                        setTicketSuccess(false);
                        setIsTicketModalOpen(true);
                      }}
                      className="px-8 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-full w-72 transition-colors shadow-lg transform hover:scale-105"
                    >
                      CREEAZA TICHET
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animation-fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700 transition-colors">
            <button onClick={() => setIsTicketModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full"><X size={20} /></button>
            <h3 className="text-2xl font-medium text-slate-800 dark:text-white mb-6 flex items-center gap-3"><FileText className="text-blue-500" /> Creează Tichet</h3>
            
            <form onSubmit={handleCreeazaTichet} className="space-y-4">
              {ticketError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-light border border-red-100 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">{ticketError}</div>}
              {ticketSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-light border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400">Tichetul a fost trimis cu succes!</div>}
              
              <div>
                <label className="block text-sm font-light text-slate-600 dark:text-slate-400 mb-2">Subiect</label>
                <input value={ticketSubiect} onChange={(e) => setTicketSubiect(e.target.value)} required className="w-full bg-[#E2E8F0] dark:bg-slate-900 text-slate-800 dark:text-white px-5 py-3 rounded-2xl outline-none font-light border border-transparent dark:border-slate-700 transition-colors" placeholder="Ex: Informații incomplete" />
              </div>
              
              <div>
                <label className="block text-sm font-light text-slate-600 dark:text-slate-400 mb-2">Descriere</label>
                <textarea value={ticketDescriere} onChange={(e) => setTicketDescriere(e.target.value)} required className="w-full bg-[#E2E8F0] dark:bg-slate-900 text-slate-800 dark:text-white px-5 py-3 rounded-2xl outline-none min-h-[120px] font-light border border-transparent dark:border-slate-700 transition-colors resize-none" placeholder="Descrie detaliat problema întâmpinată..." />
              </div>

              <button type="submit" disabled={isTicketLoading || ticketSuccess} className="w-full bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 mt-2 shadow-lg">
                {isTicketLoading ? "Se trimite..." : "TRIMITE TICHET"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animation-fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-4xl p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700 transition-colors">
            <button onClick={() => setIsReportModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full"><X size={20} /></button>
            <h3 className="text-2xl font-medium text-slate-800 dark:text-white mb-6 flex items-center gap-3"><BarChart3 className="text-blue-500" /> Tichete / Departament - {new Date().getFullYear()}</h3>
            
            <div className="w-full h-80 bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              {isReportLoading ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-light animate-pulse">Se încarcă datele...</div>
              ) : reportData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} vertical={false} />
                    <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: darkMode ? '#334155' : '#f1f5f9'}} contentStyle={{backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }} />
                    
                    {reportDepartamente.map((dep, idx) => (
                      <Bar key={dep} dataKey={dep} fill={culoriDepartamente[idx % culoriDepartamente.length]} radius={[4, 4, 0, 0]} />
                    ))}
                    <Bar dataKey="Total" fill={darkMode ? "#38bdf8" : "#0ea5e9"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-light">Nu există date pentru anul curent.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animation-fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700">
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full"><X size={20} /></button>
            <h3 className="text-2xl font-medium text-slate-800 dark:text-white mb-6 flex items-center gap-3">Suport Tehnic</h3>
            <div className="space-y-4 font-light text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700"><Phone className="text-blue-500" size={20} /> 021 999 8888</div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700"><Mail className="text-emerald-500" size={20} /> it@primarie.ro</div>
            </div>
          </div>
        </div>
      )}

      {isFaqModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-transparent dark:border-slate-700">
            <button onClick={() => setIsFaqModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
            <h3 className="text-xl font-medium mb-6 text-slate-800 dark:text-white">Sugestii întrebări</h3>
            <div className="space-y-3">
              {["Cum eliberez un certificat de urbanism?", "Acte necesare pentru stare civilă?", "Programul departamentului taxe?"].map((q, i) => (
                <button key={i} onClick={() => { setIsFaqModalOpen(false); handleTrimite(q); }} className="w-full text-left p-4 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 font-light">{q}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}