# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Vite Migration**: Initialized Vite + React + TypeScript project structure.
- **Components**: Created modular React components in `src/components/`.
    - `EvaluationCard`, `ScoreDashboard`, `ChartSection`, `PerformanceEvaluation`, etc.
- **Pages**: Added `TopPage` and `MenuPage` for better navigation flow.
- **Types**: Defined TypeScript interfaces in `src/types/index.ts`.
- **Data**: Extracted constants to `src/data/constants.ts`.
- **Styles**: Configured Tailwind CSS and added custom print styles in `src/index.css`.

### Changed
- **Architecture**: Refactored monolithic `index.html` into a component-based architecture.
- **Build System**: Switched from direct script imports (Babel standalone) to Vite build system.

### Deprecated
- Legacy `index.html` (Use `src/` files and build process instead).
