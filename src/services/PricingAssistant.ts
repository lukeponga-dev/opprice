import type { ValuationResult } from '../types';

export class PricingAssistantService {
    /**
     * Mock analysis of an image.
     * In a real app, this would send the image to an LLM (Gemini) with the system prompt provided.
     */
    static async analyzeItem(_image: File): Promise<ValuationResult> {
        console.log("Analyzing item from image:", _image.name);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // We'll return a random mock scenario to demonstrate the logic
        const scenarios: ValuationResult[] = [
            {
                itemName: "Kathmandu Epiq Men's Down Jacket",
                conditionAssumption: "Good used condition, slight fading on cuffs, all zippers functional",
                ethicalCheck: {
                    status: 'Pass',
                    message: 'No restricted materials detected.'
                },
                marketStatus: "Quality Brand - High local demand",
                newRetailPrice: "$349.98 NZD",
                onlineResaleValue: 180,
                marketValue: {
                    min: 120,
                    max: 180
                },
                demandLevel: 'High',
                recommendedPrice: 65.00, // ~36% of online resale
                confidenceLevel: 'High',
                flag: 'No issues detected',
                salesTip: "Put on the 'Boutique' rack - this is a high-demand seasonal item."
            },
            {
                itemName: "Vintage style 3/4 Coat",
                conditionAssumption: "Excellent vintage condition, but fur trim detected",
                ethicalCheck: {
                    status: 'Fail',
                    message: '⚠️ WARNING: LOOKS LIKE REAL RABBIT FUR. Please check roots for skin vs mesh. If real, do not sell.'
                },
                marketStatus: "Niche Vintage / Potential restricted material",
                newRetailPrice: "Unknown (Vintage)",
                onlineResaleValue: 60,
                marketValue: {
                    min: 0,
                    max: 60
                },
                demandLevel: 'Low',
                recommendedPrice: 0.00, // Restricted item
                confidenceLevel: 'Medium',
                flag: 'Ethical Check Failed',
                salesTip: "Recycle/Discard if real fur. If faux fur, price at $15.00."
            },
            {
                itemName: "Anko Ceramic Vase (White)",
                conditionAssumption: "Brand new condition",
                ethicalCheck: {
                    status: 'Pass',
                    message: 'Safe to sell - synthetic ceramic.'
                },
                marketStatus: "Common Kmart item",
                newRetailPrice: "$12.00 NZD",
                onlineResaleValue: 5,
                marketValue: {
                    min: 2,
                    max: 5
                },
                demandLevel: 'Medium',
                recommendedPrice: 4.00,
                confidenceLevel: 'High',
                flag: 'No issues detected',
                salesTip: "Put in the homewares section. Standard budget item."
            }
        ];

        // Return a random one for demo purposes
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    }

    static formatPrice(price: number): string {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD'
        }).format(price);
    }
}

