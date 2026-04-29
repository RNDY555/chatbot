"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText, Moon, Sun, Paperclip, X, Info } from "lucide-react";

type Ticket = {
  id: string;
  subiect: string;
  descriere: string;
  documentText: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export default function TichetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tichet, setTichet] = useState<Ticket | null>(null);
  const [subiect, setSubiect] = useState("");
  const [descriere, setDescriere] = useState("");
  const [explicatie, setExplicatie] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "succes" | "eroare"; text: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
    const savedUser = localStorage.getItem("currentUserData");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
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

  useEffect(() => {
    const incarcaTichet = async () => {
      try {
        const response = await fetch(`/api/tichete/${id}`);
        const data = await response.json();
        if (!response.ok) {
          setMesaj({ tip: "eroare", text: "Tichetul nu a putut fi încărcat." });
          return;
        }
        setTichet(data);
        setSubiect(data.subiect);
        setDescriere(data.descriere);
      } catch (error) {
        setMesaj({ tip: "eroare", text: "Eroare de conexiune la server." });
      } finally {
        setIsLoading(false);
      }
    };
    incarcaTichet();
  }, [id]);

  const handleRezolva = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMesaj(null);
    try {
      const formData = new FormData();
      formData.append("subiect", subiect);
      formData.append("descriere", descriere);
      formData.append("explicatie", explicatie);
      
      if (documentFile) {
        formData.append("document", documentFile);
      }

      const response = await fetch(`/api/tichete/${id}/rezolva`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setMesaj({ tip: "eroare", text: data.error || "Nu s-a putut rezolva tichetul." });
        return;
      }
      
      const dataRezolvata = await response.json();
      setTichet(dataRezolvata);
      setMesaj({ tip: "succes", text: "Tichet rezolvat cu succes." });
    } catch (error) {
      setMesaj({ tip: "eroare", text: "Eroare de conexiune." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0F172A] flex items-center justify-center font-sans">
        <p className="text-slate-500 dark:text-slate-400 font-light">Se încarcă...</p>
      </div>
    );
  }

  const esteRezolvat = tichet?.status?.toLowerCase() === "rezolvat";

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0F172A] p-8 font-sans relative transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-600 dark:text-yellow-400 transition-all">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="max-w-3xl mx-auto mt-4">
        <button onClick={() => router.push("/")} className="mb-8 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-light transition-colors">
          <ArrowLeft size={20} /> Înapoi
        </button>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-medium text-slate-800 dark:text-white flex items-center gap-3">
              <FileText className="text-blue-500" /> Tichet
            </h1>
            <span className={`px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wide ${esteRezolvat ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {tichet?.status}
            </span>
          </div>

          {mesaj && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-light border ${mesaj.tip === "succes" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30"}`}>
              {mesaj.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-light text-slate-600 dark:text-slate-400 mb-2">Subiect</label>
              <input value={subiect} readOnly className="w-full bg-[#E2E8F0] dark:bg-slate-900 text-slate-800 dark:text-white px-5 py-3 rounded-2xl outline-none font-light opacity-70 border border-transparent dark:border-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-light text-slate-600 dark:text-slate-400 mb-2">Descriere</label>
              <textarea value={descriere} readOnly className="w-full bg-[#E2E8F0] dark:bg-slate-900 text-slate-800 dark:text-white px-5 py-3 rounded-2xl outline-none min-h-[130px] font-light resize-none opacity-70 border border-transparent dark:border-slate-700" />
            </div>

            {esteRezolvat && (
              <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 animation-fade-in">
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-3">
                  <Info size={18} /> Soluționare Tichet
                </label>
                <div className="text-slate-700 dark:text-slate-300 font-light leading-relaxed whitespace-pre-wrap bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl">
                  {tichet?.documentText || "Administratorul a marcat tichetul ca rezolvat fără o explicație suplimentară."}
                </div>
                {tichet?.resolvedAt && (
                  <p className="mt-4 text-[10px] text-emerald-600/60 dark:text-emerald-400/40 uppercase font-bold tracking-widest">
                    Data rezolvării: {new Date(tichet.resolvedAt).toLocaleString("ro-RO")}
                  </p>
                )}
              </div>
            )}

            {currentUser?.rol === "ADMIN" && !esteRezolvat && (
              <form onSubmit={handleRezolva} className="pt-4 space-y-6" noValidate>
                <div>
                  <label className="block text-sm font-light text-slate-600 dark:text-slate-400 mb-2">Explicație problemă</label>
                  <textarea 
                    value={explicatie} 
                    onChange={(e) => setExplicatie(e.target.value)} 
                    required 
                    className="w-full bg-[#E2E8F0] dark:bg-slate-900 text-slate-800 dark:text-white px-5 py-3 rounded-2xl outline-none min-h-[130px] font-light border border-transparent dark:border-slate-700 resize-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                    placeholder="Introdu aici explicația rezolvării..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-slate-600 dark:text-slate-400 mb-2">Încărcare document word (opțional)</label>
                  {!documentFile ? (
                    <label className="w-full bg-[#E2E8F0] dark:bg-slate-900 text-slate-500 px-5 py-3 rounded-2xl border border-transparent dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-light">
                      <Paperclip size={18} className="text-blue-500" />
                      <span>Selectează un fișier .docx dacă dorești</span>
                      <input 
                        type="file" 
                        accept=".docx" 
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} 
                        className="hidden" 
                      />
                    </label>
                  ) : (
                    <div className="bg-[#E2E8F0] dark:bg-slate-900 rounded-2xl px-5 py-4 border border-transparent dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-blue-500" />
                        <span className="text-slate-800 dark:text-white font-medium text-sm truncate max-w-[200px]">{documentFile.name}</span>
                      </div>
                      <button type="button" onClick={() => setDocumentFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={isSaving} 
                    className="w-full bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 mt-6 shadow-lg"
                  >
                    <CheckCircle size={20} />
                    {isSaving ? "Se trimite..." : "Rezolvă tichet"}
                  </button>
                </div>
              </form>
            )}

            {currentUser?.rol !== "ADMIN" && !esteRezolvat && (
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-light text-center">
                  Acest tichet este în curs de analiză de către un administrator.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}