---
description: How to run code quality checks
---

# Code Quality Workflow

Follow these steps to ensure the codebase remains stable and follows project standards.

## 1. Static Analysis (Linting)

Run ESLint to find and fix code style issues.
// turbo

```bash
npm run lint
```

## 2. Type Checking

Run the TypeScript compiler to ensure there are no type errors.
// turbo

```bash
tsc --noEmit
```

## 3. Full Build Verification

Run a full build to verify that both linting and type checking pass.
// turbo

```bash
npm run build
```

## 4. Pre-commit Checklist

Before pushing code, ensure:

- [ ] No lint errors are reported.
- [ ] TypeScript compilation is successful.
- [ ] The application starts correctly with `npm run dev`.
