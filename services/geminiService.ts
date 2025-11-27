
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Point } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this example, we'll log an error.
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getGenerativeContent = async (point: Point): Promise<string> => {
  if (!API_KEY) {
    return "La chiave API di Gemini non è configurata. Impossibile generare contenuti.";
  }
  
  const prompt = `
    Sei una guida turistica e storica esperta.
    Fornisci un approfondimento interessante e poco conosciuto sul seguente luogo e evento.
    Sii narrativo e coinvolgente, come se stessi raccontando una storia a un visitatore curioso.
    Evita di ripetere semplicemente le informazioni fornite. Aggiungi contesto, aneddoti o dettagli sorprendenti.
    Il testo deve essere in italiano.

    Luogo: ${point.title}
    Descrizione: ${point.description}

    Approfondimento:
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Non è stato possibile generare un approfondimento.";
  } catch (error) {
    console.error("Error fetching generative content:", error);
    if (error instanceof Error) {
      return `Errore durante la generazione dei contenuti: ${error.message}`;
    }
    return "Si è verificato un errore sconosciuto durante la comunicazione con l'API Gemini.";
  }
};
