
import { GoogleGenAI } from "@google/genai";

// Always use the API key from process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialMotivation(balance: number, goal: string, target: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a friendly financial coach for a gamified savings app called Piggybanko. 
      A user named Valentina has $${balance} saved towards her goal: "${goal}" (Target: $${target}). 
      Give her a short, 1-sentence motivational message in Spanish about how her small change is making a big difference. 
      Keep it energetic and mention her "Piggy".`,
    });
    return response.text || "¡Sigue ahorrando, tu Piggy está muy feliz hoy!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "¡Cada moneda cuenta! Estás más cerca de tu meta.";
  }
}

export async function getMerchantInsight(earnings: number, sales: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a business consultant for a shop owner named Don Roberto. 
      He earned $${earnings} in commissions and had $${sales} in sales via the Piggybanko app. 
      Write a 1-sentence congratulatory message in Spanish about how this digital system is improving his business cash flow.`,
    });
    return response.text || "¡Excelente cierre! Tu flujo de caja es más sano con Piggybanko.";
  } catch (error) {
    return "Tu negocio está creciendo con el ecosistema digital.";
  }
}

export async function getSearchSuggestions(query: string, availableCategories: string[]): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user searched for "${query}" in a marketplace but found no exact matches. 
      The available categories are: ${availableCategories.join(', ')}.
      Suggest exactly 3 related search terms or categories that might be relevant to the user.
      Return ONLY a comma-separated list of strings in Spanish. Do not add explanations.`,
    });
    const text = response.text || "";
    return text.split(',').map(s => s.trim().replace(/\./g, ''));
  } catch (error) {
    console.error("Gemini Search Suggestion Error:", error);
    return availableCategories.slice(0, 3);
  }
}

export async function searchPlacesOnMap(query: string, lat?: number, lng?: number): Promise<any[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Encuentra lugares relacionados con "${query}" que sean comercios, tiendas o panaderías.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            // Ensure proper check for defined lat/lng values
            latLng: (lat !== undefined && lng !== undefined) ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    // Transformamos los chunks de mapas en una estructura que el componente MapView entienda
    return groundingChunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        name: chunk.maps.title,
        address: chunk.maps.address || 'Ver en Google Maps',
        uri: chunk.maps.uri,
        lat: lat ? lat + (Math.random() - 0.5) * 0.02 : undefined, // Simulación de offset para visualización
        lng: lng ? lng + (Math.random() - 0.5) * 0.02 : undefined,
      }));
  } catch (error) {
    console.error("Error en búsqueda de mapas:", error);
    return [];
  }
}