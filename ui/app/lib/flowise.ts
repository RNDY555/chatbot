export async function trimiteDocumentInFlowise(params: {
  ticketId: string;
  file: File;
}) {
  const flowiseBaseUrl = process.env.FLOWISE_BASE_URL;
  const apiKey = process.env.FLOWISE_API_KEY;
  const documentStoreId = process.env.FLOWISE_DOCUMENT_STORE_ID;
  const documentLoaderId = process.env.FLOWISE_DOC_LOADER_ID;

  if (!flowiseBaseUrl || !documentStoreId || !documentLoaderId) {
    throw new Error("Lipsesc variabile Flowise din .env");
  }

  const formData = new FormData();

  // Trimitem DOAR fisierul .docx catre Flowise.
  // Subiectul si descrierea raman doar in baza ta de date/site.
  formData.append("files", params.file, params.file.name);

  // Acesta este ID-ul loaderului Docx File din Flowise.
  formData.append("docId", documentLoaderId);

  // Metadata tehnica. Nu punem subiect/descriere aici.
  formData.append(
    "metadata",
    JSON.stringify({
      source: "ticket",
      ticketId: params.ticketId,
      originalFileName: params.file.name,
    })
  );

  const headers: Record<string, string> = {};

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(
    `${flowiseBaseUrl.replace(/\/$/, "")}/api/v1/document-store/upsert/${documentStoreId}`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Eroare Flowise: ${response.status} - ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}