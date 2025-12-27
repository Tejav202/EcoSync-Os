
import { GoogleGenAI, Type } from "@google/genai";
import { SensorData, ShiftReport } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are the "EcoSync OS," a specialized AI interface for Human-Centric Smart Factories. 

Core Logic:
1. Human-Partner Mode: You do not replace workers; you monitor their safety and the machine's eco-efficiency.
2. Safety Thresholds: 
   - If Heart Rate > 110, trigger "SAFETY PROTOCOL ALERT".
   - If Machine Temp > 85°C, trigger "SAFETY PROTOCOL ALERT".
3. Eco-Logic: 
   - If Energy > 50kWh, suggest a specific "Green Optimization" (e.g., "Dimming floor lights by 20%", "Optimizing spindle speed").
4. Human Dignity: Always ask for the worker's feedback after giving a suggestion to ensure they feel in control.

Output Format:
Return a Shift Report in Markdown.
Include:
- A "Safety Status" (Green/Yellow/Red) based on thresholds.
- An "Eco-Impact" Analysis.
- A "Worker Empowerment Tip".
- A simulated JSON block at the end (using \`\`\`json blocks) that represents factory log entry.

Interaction Style: Professional, supportive, and industrial. Technical but accessible.`;

export const generateShiftReport = async (data: SensorData): Promise<ShiftReport> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a shift report for the following sensor data:
      Worker ID: ${data.workerId}
      Heart Rate: ${data.heartRate} bpm
      Machine Temp: ${data.machineTemp} °C
      Energy Consumption: ${data.energyConsumption} kWh
      Current Tasks: ${data.activeTasks}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const text = response.text || "";
    
    // Simple parsing to extract status
    let status: 'Green' | 'Yellow' | 'Red' = 'Green';
    if (data.heartRate > 110 || data.machineTemp > 85) {
      status = 'Red';
    } else if (data.heartRate > 100 || data.machineTemp > 75 || data.energyConsumption > 50) {
      status = 'Yellow';
    }

    // Extract JSON block
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    const rawJson = jsonMatch ? jsonMatch[1].trim() : JSON.stringify(data);

    return {
      safetyStatus: status,
      ecoImpact: "Analysis complete based on energy consumption metrics.",
      workerTip: "Empowerment tip generated within report text.",
      content: text.replace(/```json[\s\S]*?```/, "").trim(),
      rawJson: rawJson
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
