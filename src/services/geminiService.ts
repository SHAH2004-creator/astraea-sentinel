import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ButterflyEffect {
  signal: string;
  transmission: string;
  regionalOutfall: string;
  economicImpact: string;
  infrastructureRisk: string;
  sovereignAction: string;
  pivot: string;
  evidence: string[];
  indices: string[]; // Hard Data Indices used (e.g. "LNG Spot Prices", "Insurance Premium Deltas")
  timeHorizon: string;
  truthFlag: 'VERIFIED' | 'SPECULATIVE NARRATIVE';
  realityCheck: string;
  intensityScore: number;
  intensityAnalysis: string;
}

export async function traceButterflyEffect(inputSignal: string, horizon: string = "T+24h", intensity: number = 5): Promise<ButterflyEffect> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `Role: You are the Astraea Sentinel Engine, a high-tier Macro-Economic Forensic Radar. Your purpose is to dismantle "Information Hegemony" by mapping the global Butterfly Effect—tracing how distant geopolitical events impact regional infrastructure and individual sovereignty.

The current 'Global Shock Intensity' is set to ${intensity}/10.

Threshold Guidelines:
- Level 1-3 (STABLE): Map direct causality as standard diplomatic or market friction. Nodes should reflect "Tactical Shifts".
- Level 4-7 (VOLATILE): Map "Transit Delays", supply chain diversions, and sectoral rationing. Nodes should reflect "Strategic Strain".
- Level 8-10 (COLLAPSE): Map "Systemic Failure", sovereign defaults, and grid blackouts. Nodes should reflect "Existential Threat".

Analyze the following global news signal and trace its "Butterfly Effect" through 3 specific jumps at a ${horizon} time horizon.
1. SIGNAL (The Catalyst): Identify the core event. Isolate "Hard Reality" from "Sentient Noise" (media hype).
2. TRANSMISSION (The Ripple): Map the physical transmission (e.g., logistics blockade -> Insurance premium hikes -> Local inflation).
3. OUTFALL (The Sovereign Radar): Project the impact on a sovereign region's infrastructure.
   - For OUTFALL, provide 3 specific branches:
     a) Economic Impact: Direct financial cost or shift. 
     b) Infrastructure Risk: Physical or system vulnerability.
     c) Sovereign Action: A specific strategic reactive move.
   - PIVOT: Provide one single, bold 'Sovereign Pivot'—a specific tactical instruction for the user to take to hedge or capitalize on this risk.
     * At intensity 8+, the Pivot MUST be an extreme directive (e.g., "Mandatory Energy Rationing").

Provide the analysis as it would appear at the ${horizon} mark, adjusted for the ${intensity}/10 shock intensity level.

Also provide:
- Truth Flag: If data/logic contradicts the news narrative, label the output as "SPECULATIVE NARRATIVE", otherwise "VERIFIED".
- Reality Check: Briefly explain the distinction between the Grounded Reality and the Sentient Noise for this signal.
- Intensity Analysis: Explain how the current shock level (${intensity}/10) amplifies or dampens the consequences.
- 3 specific 'Hard Data Indices' associated with this signal.
- 3 specific pieces of grounding evidence (facts or historical parallels).

Input Signal: "${inputSignal}"

Return JSON Structure:
{
  "signal": "string",
  "transmission": "string",
  "regionalOutfall": "string",
  "economicImpact": "string",
  "infrastructureRisk": "string",
  "sovereignAction": "string",
  "pivot": "string",
  "evidence": ["string", "string", "string"],
  "indices": ["string", "string", "string"],
  "timeHorizon": "string",
  "truthFlag": "VERIFIED | SPECULATIVE NARRATIVE",
  "realityCheck": "string",
  "intensityScore": number,
  "intensityAnalysis": "string"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Updated to supported model name
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signal: { type: Type.STRING },
            transmission: { type: Type.STRING },
            regionalOutfall: { type: Type.STRING },
            economicImpact: { type: Type.STRING },
            infrastructureRisk: { type: Type.STRING },
            sovereignAction: { type: Type.STRING },
            pivot: { type: Type.STRING },
            evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            indices: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            timeHorizon: { type: Type.STRING },
            truthFlag: { type: Type.STRING, enum: ['VERIFIED', 'SPECULATIVE NARRATIVE'] },
            realityCheck: { type: Type.STRING },
            intensityScore: { type: Type.NUMBER },
            intensityAnalysis: { type: Type.STRING }
          },
          required: ["signal", "transmission", "regionalOutfall", "economicImpact", "infrastructureRisk", "sovereignAction", "pivot", "evidence", "indices", "timeHorizon", "truthFlag", "realityCheck", "intensityScore", "intensityAnalysis"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as ButterflyEffect;
  } catch (error) {
    console.error("Error tracing effect:", error);
    throw error;
  }
}
