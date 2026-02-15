---
description: How to build and deploy the application
---

# Deployment Workflow

Follow these steps to build and deploy the Price Scan application.

## 1. Prerequisites

- Ensure `VITE_GEMINI_API_KEY` is set in your `.env` file.
- Ensure you have `node` and `npm` installed.

## 2. Install Dependencies

```bash
npm install
```

## 3. Build the Project

Run the production build to ensure all types and lint checks pass.
// turbo

```bash
npm run build
```

## 4. Deploy to Vercel

The project is configured for Vercel. You can deploy via the CLI:

```bash
vercel --prod
```

Alternatively, push to the `main` branch to trigger an automatic deployment.

## 5. Verification

After deployment, verify that the camera and AI research features are functional on the production URL.
