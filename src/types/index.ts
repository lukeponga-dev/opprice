export type DemandLevel = 'High' | 'Medium' | 'Low';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type EthicalCheckResult = 'Pass' | 'Fail' | 'Check Carefully';
export type FlagType =
    | 'Potential counterfeit'
    | 'High-value / luxury item (needs authentication)'
    | 'Safety recall'
    | 'Electrical testing required'
    | 'Ethical Check Failed'
    | 'No issues detected';

export interface ValuationResult {
    itemName: string;
    conditionAssumption: string;
    ethicalCheck: {
        status: EthicalCheckResult;
        message: string;
    };
    marketStatus: string;
    newRetailPrice: string;
    onlineResaleValue: number;
    marketValue: {
        min: number;
        max: number;
    };
    demandLevel: DemandLevel;
    recommendedPrice: number;
    confidenceLevel: ConfidenceLevel;
    flag: FlagType;
    salesTip: string;
}

export interface ResearchStatus {
    step: 'idle' | 'analyzing' | 'searching' | 'assessing' | 'finalizing';
    message: string;
}

