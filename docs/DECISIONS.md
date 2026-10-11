# Architectural & Technical Decisions

This document records architectural, design, and library decisions made during the development of ReHome.

## Phase F0: Scaffolding and Design System

### 1. Expo Router V5 & SDK 57
- Configured Expo Router with standard file-based routing in the `app/` directory.
- Configured path alias `@/*` -> `src/*` for clean imports across the project.
- Strict TypeScript configuration (`strict: true`) matching specification.
- Installed `react-native-web`, `react-dom`, and `@expo/metro-runtime` to fulfill constraint: `npx expo start --web should also load without crashing`.

### 2. Design System and Theming
- Implemented tokens in `src/theme/tokens.ts` using strict 8-point spacing grid, Plus Jakarta Sans typography, and custom ReHome color palette (Primary `#1F9D7A`, Sell `#1F9D7A`, Exchange `#B7660B`, Donate `#B0306A`).
- Integrated React Native Paper Material 3 light theme using our tokens, wrapping in standard PaperProvider in `app/_layout.tsx`.
- Implemented reusable animated primitives (e.g. `PressableScale`) with `react-native-reanimated` for 0.97 press scale and spring motion.

### 3. Component Architecture
- Built all 22 required reusable components in `src/components/` with strict TypeScript props, accessibility labels, and zero direct dependencies on mock data.
- Built a comprehensive Design System gallery screen accessible via `/design-system` so every component, state, and variant can be verified in one place.
