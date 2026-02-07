
import { GoogleGenAI, Type } from "@google/genai";

export async function generateOutreachMessage(memberName: string, daysAbsent: number): Promise<string> {
  try {
    // Check if API key is configured (basic check)
    if (!process.env.VITE_GEMINI_API_KEY && !process.env.API_KEY) {
      throw new Error("No API Key configured");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || '' });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Andika barua pepe fupi, yenye upendo na kutia moyo kwa mshiriki wa kanisa anayeitwa ${memberName} ambaye amekosa ibada kwa takriban siku ${daysAbsent}. 
      Lenga kumjulia hali na kumjulisha kuwa kanisa linamkumbuka. Weka lugha ya kichungaji na ya heshima. Ujumbe uwe kwa Kiswahili.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    });

    return response.text || fallbackMessage(memberName);
  } catch (error) {
    console.warn("AI Generation failed, using template fallback:", error);
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return fallbackMessage(memberName);
  }
}

function fallbackMessage(name: string): string {
  const greetings = ["Mpendwa", "Habari", "Bwana asifiwe"];
  const openers = [
    "tumekukosa katika ibada zetu za hivi karibuni.",
    "tumeona hukuhudhuria ibada kwa Jumapili chache zilizopita.",
    "uwepo wako umekosekana katika mikutano yetu."
  ];
  const closings = [
    "Tunatumai kukuona hivi karibuni!",
    "Tunakuombea.",
    "Tujulishe ikiwa kuna chochote tunaweza kukusaidia."
  ];

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const opener = openers[Math.floor(Math.random() * openers.length)];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `${greeting} ${name},\n\nTunatumai barua hii inakukuta ukiwa mzima. ${opener} Tulitaka tu kukujulia hali na kuhakikisha kuwa uko salama.\n\nWewe ni sehemu muhimu ya jamii yetu, na tungependa kukuona tena utakapoweza.\n\n${closing}\n\nBaraka,\nTimu yawachungaji`;
}
