
# Copilot Instructions (2026-02-15)

## Purpose
Enable safe, efficient Copilot/model use in a multi-subproject React/Vite/Expo repo.

## Quick Start
- Node 22.12.0 (see .nvmrc)
- npm install
- npm run dev / lint / build

## Subproject Context
- Always run lint/tests/build in the relevant subproject folder (mobile/, shared/, web/).
- Detect context from file path, PR tags, or changed files.
- Examples:
  - cd mobile && npm run lint
  - cd shared && npm test
  - cd web && npm run build

## Skip Folders
- Never scan or modify:
  - node_modules/
  - build/
  - dist/
  - .expo/
  - android/**/build/
  - ios/**/build/
  - .git/

## Conventions
- Use ParkingDataProvider/useParkingData() for data access.
- Keep CORS proxy for external fetches.
- Normalize timestamps with replace(' ', 'T').
- Store theme in localStorage key parking_theme.
- Never hardcode secrets or Google Form IDs.

## Coding Delivery
- All code must pass lint and unit tests in the correct subproject before merge.
- Do not finish until all lint and unit test errors are fixed.
- Fix root causes, not just silence errors.
- Update or add tests and docs for changed behavior.
- If unsure, ask for clarification or open an issue.
- PRs must have clear descriptions, related issues, and test steps.

## Automation & PR Policy
- Models/agents must NOT create branches, push commits, open PRs, or merge automatically.
- Do NOT offer or auto-suggest PR creation unless using an approved cloud agent with explicit user opt-in.
- All model-generated suggestions are drafts and require human approval.