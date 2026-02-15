---
description: Instruct the AI to return only this JSON structure.
---

{
  "status": "ACCEPTED | REJECTED",
  "meta": {
    "brand": "String",
    "category": "Apparel | Furniture | Homeware | Media | Pet",
    "material": "String",
    "tier": "Tier 1 | Tier 2 | Tier 3"
  },
  "rejection_data": {
    "is_rejected": boolean,
    "reason_title": "Short Title (e.g., 'Budget Brand')",
    "reason_desc": "Polite explanation for volunteer."
  },
  "pricing": {
    "trade_me_average": "NZ$ XX.XX",
    "suggested_spca_price": "NZ$ XX.XX",
    "price_confidence": "High | Medium | Low"
  },
  "volunteer_action": {
    "qc_alert": "Specific check (e.g., 'Check underarms for moth holes' or 'Wiggle legs to check stability')",
    "tag_color": "Suggested tag color if applicable"
  }
}
