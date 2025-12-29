I have an existing React web project and I want to restructure it and gradually convert it to a mobile app using React Native / Expo. I want a phase-based, iterative plan for this migration, output as a Markdown file that can serve as a persistent roadmap (MIGRATION_PLAN.md). Progress should be trackable with checkboxes and allow pausing/resuming without losing context.

Target repository structure
repo-web/ → existing React Web app (with current workflows and configs, e.g., GitHub Actions)
repo-mobile/ → new React Native app (iOS + Android, using Expo)
shared/ → npm package containing core logic (plain JavaScript, no React or framework dependencies), fully separate repo
Phases
Phase 1 — Reposition web repo and setup shared logic

Audit current web project structure, dependencies, and CI/CD workflows.
Identify core logic that can be moved to shared/.
Create shared/ as a standalone npm package in its own repo.
Adjust repo-web to import shared logic from the npm package.
Ensure .github/workflows and CI/CD pipelines continue to work after moving code.
Use an iterative approach: small, testable commits with clear notes and checklists.
Phase 2 — Mobile app MVP

Create new Expo React Native project in repo-mobile.
Set up minimal configuration (TypeScript support, linting, formatting).
Connect shared/ npm package to repo-mobile.
Implement minimal MVP functions from the web app step by step.
Ensure the app runs on both Android and iOS simulators/emulators.
Continue iterative delivery with small working steps, testable after each iteration, maintaining mobile repo fully separate from web repo.
Requirements for Copilot
Generate a step-by-step, iterative plan for each phase.
Output as Markdown with:
Clear headings for phases and steps
Numbered steps with checkboxes [ ] to track progress
Sections for notes, potential blockers, and iteration logs
Include specific file/folder changes, configuration updates, and dependency considerations
Suggest best practices for shared/ as an npm package for full repo independence
Maintain web and mobile repos fully separate, including CI/CD pipelines
Each step should be small, actionable, and testable, so progress can pause and resume easily
Output should be ready to save as MIGRATION_PLAN.md and serve as a persistent, iterative roadmap for the migration.

