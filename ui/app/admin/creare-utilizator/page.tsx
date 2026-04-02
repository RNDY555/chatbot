// app/admin/creare-utilizator/page.tsx
"use client";
import { useState } from "react";
import { UserPlus, Mail, Key, Building, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminCreateUserPage() {
  // Stari pentru formular
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departament, setDepartament] = useState("Asistenta sociala");
  const [rol, setRol] = useState("MEMBRU");

  // Stari pentru status (pentru utilizator)
  const [isLoading, setIsLoading] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "succes" | "eroare"; text: string } | null>(null);

  const handleCreeazaCont = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMesaj(null);

    const dateUtilizator = { nume, prenume, email, password, departament, rol };

    try {
      const response = await fetch("/api/admin/creare-utilizator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateUtilizator)
      });

      const data = await response.json();

      if (response.ok) {
        setMesaj({ tip: "succes", text: `Contul pentru ${nume} ${prenume} a fost creat!` });
        // Golim formularul
        setNume(""); setPrenume(""); setEmail(""); setPassword("");
      } else {
        setMesaj({ tip: "eroare", text: data.error || "A aparut o eroare." });
      }
    } catch (error) {
      setMesaj({ tip: "eroare", text: "Eroare de conexiune la server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 md:p-10 font-sans text-white">
      
      {/* Header Panou Admin */}
      <header className="flex items-center justify-between pb-8 border-b border-white/10 mb-12">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserPlus size={32} className="text-blue-400" /> Administrare Utilizatori
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10 shadow-inner">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <p className="font-medium">Mod Admin</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start">
        
        {/* Titlu si Info in stil Figma */}
        <div className="flex-1 space-y-4 pt-10">
          <h2 className="text-4xl font-extralight tracking-tight">Adaugare Cont Nou</h2>
          <p className="text-slate-400 max-w-md">
            Completati detaliile de mai jos pentru a inregistra un nou membru in baza de date a Primariei Digitale. Contul va fi activ instantaneu.
          </p>
        </div>

        {/* Formularul (Stilizat ca Login-ul din Figma) */}
        <form onSubmit={handleCreeazaCont} className="flex-1 w-full bg-black/20 p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Overlay pentru incarcare */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Afisare Mesaje (Succes/Eroare) */}
          {mesaj && (
            <div className={`p-4 rounded-xl text-center text-sm font-medium ${mesaj.tip === "succes" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-red-500/10 text-red-300 border border-red-500/30"}`}>
              {mesaj.text}
            </div>
          )}

          {/* Campuri Formular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputGroup label="Nume*" value={nume} setValue={setNume} placeholder="ex: Abc" icon={Users} />
            <InputGroup label="Prenume*" value={prenume} setValue={setPrenume} placeholder="ex: Mariana" icon={Users} />
          </div>

          <InputGroup label="Email*" type="email" value={email} setValue={setEmail} placeholder="introduceti adresa de email" icon={Mail} />
          <InputGroup label="Parola Generata*" type="password" value={password} setValue={setPassword} placeholder="introduceti o parola sigura" icon={Key} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputGroup label="Departament" value={departament} setValue={setDepartament} placeholder="Asistenta sociala" icon={Building} />
            
            <div className="space-y-2">
              <label className="text-white text-sm ml-4">Rol Cont*</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full bg-[#E2E8F0] text-slate-800 px-6 py-3 rounded-full outline-none focus:ring-2 focus:ring-blue-400 transition-all appearance-none font-medium"
              >
                <option value="MEMBRU">MEMBRU </option>
                <option value="ADMIN">ADMINISTRATOR</option>
              </select>
            </div>
          </div>

          {/* Butonul (Figma Style) */}
          <div className="pt-6 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#3B82F6] hover:bg-blue-600 disabled:bg-slate-500 text-white px-16 py-3 rounded-full font-semibold transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105"
            >
              Creeaza Cont
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Componenta interna pentru a simplifica codul
interface InputGroupProps {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  type?: string;
}

function InputGroup({ label, value, setValue, placeholder, icon: Icon, type = "text" }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-white text-sm ml-4 flex items-center gap-2">
        <Icon size={16} className="text-slate-400" /> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#E2E8F0] text-slate-800 placeholder-slate-400 px-6 py-3 rounded-full outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium"
        required={label.includes('*')}
      />
    </div>
  );
}