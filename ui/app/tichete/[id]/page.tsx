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

export default function TichetPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [tichet, setTichet] = useState<Ticket | null>(null);
  const [subiect, setSubiect] = useState("");
  const [descriere, setDescriere] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "succes" | "eroare"; text: string } | null>(null);

  useEffect(() => {
    const incarcaTichet = async () => {
      try {
        const response = await fetch(`/api/tichete/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setMesaj({
            tip: "eroare",
            text: data.error || "Tichetul nu a putut fi incarcat.",
          });
          return;
        }

        setTichet(data);
        setSubiect(data.subiect);
        setDescriere(data.descriere);
      } catch (error) {
        setMesaj({
          tip: "eroare",
          text: "Eroare de conexiune la server.",
        });
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
      if (!documentFile) {
        setMesaj({
          tip: "eroare",
          text: "Trebuie sa incarci un fisier .docx.",
        });
        setIsSaving(false);
        return;
      }

      if (!documentFile.name.toLowerCase().endsWith(".docx")) {
        setMesaj({
          tip: "eroare",
          text: "Fisierul trebuie sa fie de tip .docx.",
        });
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("subiect", subiect);
      formData.append("descriere", descriere);
      formData.append("document", documentFile);

      const response = await fetch(`/api/tichete/${id}/rezolva`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMesaj({
          tip: "eroare",
          text: data.error || "Nu s-a putut rezolva tichetul.",
        });
        return;
      }

      setTichet(data);
      setDocumentFile(null);
      setMesaj({
        tip: "succes",
        text: "Tichet rezolvat. Documentul a fost trimis in Flowise.",
      });
    } catch (error) {
      setMesaj({
        tip: "eroare",
        text: "Eroare de conexiune la server.",
      });
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
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
          Inapoi
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
              <FileText className="text-blue-500" />
              Tichet
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
                className="w-full bg-[#EEF2F6] text-slate-800 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 min-h-[130px]"
                required
              />
            </div>

            {tichet?.documentText && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-sm text-slate-500">Document selectat anterior:</p>
                <p className="text-slate-800 font-medium mt-1">{tichet.documentText}</p>
              </div>
            )}

            {tichet?.status !== "REZOLVAT" && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Incarca document Word pentru chatbot
                </label>

                {!documentFile ? (
                  <>
                    <input
                      type="file"
                      accept=".docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setDocumentFile(file);
                      }}
                      className="w-full bg-[#EEF2F6] text-slate-800 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />

                    <p className="text-sm text-slate-400 mt-2">
                      Incarca din nou fisierul .docx. Acesta va fi trimis in Flowise.
                    </p>
                  </>
                ) : (
                  <div className="bg-[#EEF2F6] rounded-2xl px-5 py-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Fisier selectat:</p>

                    <p className="text-slate-800 font-medium mt-1">
                      {documentFile.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => setDocumentFile(null)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Schimba fisierul
                    </button>
                  </div>
                )}
              </div>
            )}

            {tichet?.status !== "REZOLVAT" && (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {isSaving ? "Se trimite in Flowise..." : "REZOLVA TICHET"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}