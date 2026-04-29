"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText } from "lucide-react";

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

export default function RezolvaTichetPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [tichet, setTichet] = useState<Ticket | null>(null);
  const [subiect, setSubiect] = useState("");
  const [descriere, setDescriere] = useState("");
  const [documentText, setDocumentText] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "succes" | "eroare"; text: string } | null>(null);

  useEffect(() => {
    const incarcaTichet = async () => {
      try {
        const response = await fetch(`/api/tichete/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setMesaj({ tip: "eroare", text: data.error || "Tichetul nu a putut fi incarcat." });
          return;
        }

        setTichet(data);
        setSubiect(data.subiect);
        setDescriere(data.descriere);
        setDocumentText(data.documentText || "");
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
      const response = await fetch(`/api/tichete/${id}/rezolva`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subiect,
          descriere,
          documentText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMesaj({ tip: "eroare", text: data.error || "Nu s-a putut rezolva tichetul." });
        return;
      }

      setTichet(data);
      setMesaj({
        tip: "succes",
        text: "Tichet rezolvat. Documentul a fost trimis in Flowise Document Store."
      });
    } catch (error) {
      setMesaj({ tip: "eroare", text: "Eroare de conexiune la server." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <p className="text-slate-500">Se incarca tichetul...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
          Inapoi
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
              <FileText className="text-blue-500" />
              Rezolvare tichet
            </h1>

            {tichet?.status === "REZOLVAT" ? (
              <span className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold">
                rezolvat
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold">
                nerezolvat
              </span>
            )}
          </div>

          {mesaj && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm ${
                mesaj.tip === "succes"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {mesaj.text}
            </div>
          )}

          <form onSubmit={handleRezolva} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Subiect
              </label>
              <input
                value={subiect}
                onChange={(e) => setSubiect(e.target.value)}
                className="w-full bg-[#EEF2F6] text-slate-800 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: Acte necesare pentru ajutor social"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Descriere
              </label>
              <textarea
                value={descriere}
                onChange={(e) => setDescriere(e.target.value)}
                className="w-full bg-[#EEF2F6] text-slate-800 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 min-h-[110px]"
                placeholder="Descrierea informatiei cerute in tichet"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Document / informatie de adaugat in baza de cunostinte
              </label>
              <textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                className="w-full bg-[#EEF2F6] text-slate-800 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 min-h-[260px]"
                placeholder="Scrie aici informatia completa care trebuie invatata de chatbot..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              {isSaving ? "Se trimite in Flowise..." : "REZOLVA TICHET"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}