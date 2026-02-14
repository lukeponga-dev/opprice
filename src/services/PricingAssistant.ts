import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import type { ValuationResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const schema: Schema = {
    description: "SPCA Pricing Valuation Result",
    type: SchemaType.OBJECT,
    properties: {
        itemName: { type: SchemaType.STRING },
        conditionAssumption: { type: SchemaType.STRING },
        ethicalCheck: {
            type: SchemaType.OBJECT,
            properties: {
                status: { type: SchemaType.STRING, enum: ["Pass", "Fail", "Check Carefully"], format: "enum" },
                message: { type: SchemaType.STRING }
            },
            required: ["status", "message"]
        },
        marketStatus: { type: SchemaType.STRING },
        newRetailPrice: { type: SchemaType.STRING },
        onlineResaleValue: { type: SchemaType.NUMBER },
        marketValue: {
            type: SchemaType.OBJECT,
            properties: {
                min: { type: SchemaType.NUMBER },
                max: { type: SchemaType.NUMBER }
            },
            required: ["min", "max"]
        },
        demandLevel: { type: SchemaType.STRING, enum: ["High", "Medium", "Low"], format: "enum" },
        recommendedPrice: { type: SchemaType.NUMBER },
        confidenceLevel: { type: SchemaType.STRING, enum: ["High", "Medium", "Low"], format: "enum" },
        flag: { type: SchemaType.STRING },
        salesTip: { type: SchemaType.STRING }
    },
    required: [
        "itemName", "conditionAssumption", "ethicalCheck", "marketStatus",
        "newRetailPrice", "onlineResaleValue", "marketValue", "demandLevel",
        "recommendedPrice", "confidenceLevel", "flag", "salesTip"
    ]
};

export class PricingAssistantService {
    static async analyzeItem(image: File): Promise<ValuationResult> {
        console.log("Analyzing item with Gemini AI...");

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            tools: [
                {
                    googleSearchRetrieval: {},
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
            systemInstruction: `You are the SPCA Op Shop Pricing Assistant. Your goal is to turn donated goods into funds for animals in need.
            
            REAL-TIME RESEARCH: Use your Google Search tool to verify current NZ market prices on Trade Me, Facebook Marketplace NZ, and local retailers (Farmers, The Warehouse, Mighty Ape, etc.).
            
            Follow these steps for every image:
            1. Ethical Check: Flag Real Fur, Ivory, or Tortoiseshell (Policy Restricted). If Faux Fur, state "Looks like Faux Fur - Safe to sell".
            2. Identify: Brand, Model, Era. 
            3. Market Research: Use Google Search to find real-time data for the item's current 2nd-hand value in New Zealand.
            4. Budget Check: If Anko, Warehouse, or Shein, value low ($2-$5).
            5. Quality Check: If high-value brand (Country Road, Kathmandu, Royal Doulton), find real-time 2nd-hand price.
            6. Logic: Recommended Price should be 30-40% of online resale price for quick 7-day turnover.
            7. High Value: If online resale is > $50, flag as "High-value" and tip to move to Manager for Trade Me listing.
            
            Return ONLY a valid JSON object matching the provided schema.`
        });

        // Convert file to GenerativePart
        const imagePart = await this.fileToGenerativePart(image);

        const result = await model.generateContent([
            "Analyze this donated item for SPCA NZ pricing.",
            imagePart
        ]);

        const response = result.response;
        const text = response.text();
        return JSON.parse(text) as ValuationResult;
    }

    private static async fileToGenerativePart(file: File): Promise<{ inlineData: { data: string, mimeType: string } }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = (reader.result as string).split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type
                    }
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static formatPrice(price: number): string {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD'
        }).format(price);
    }
}


