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

## Phase F1: Types, Mock Services, and State Store

### 1. Pure Service Layer Abstraction
- All screens and UI features exclusively interface with `src/services/` (types defined in `src/services/types.ts`).
- `services/index.ts` determines active implementation based on `EXPO_PUBLIC_USE_MOCKS` (defaults to `true`). Real backends can be swapped in without modifying any UI screens.
- Every mock service function is asynchronous and simulates network latency (300ms–900ms, doubled if slowNetwork is enabled in Demo Controls).
- Injected error simulations trigger typed `AppError` when `simulateErrors` is enabled.

### 2. Pure Business Logic (`src/lib/exchange.ts`)
- Exchange top-up calculation implements the 10% maximum tolerance rule.
- Full unit test suite implemented in `src/lib/__tests__/exchange.test.ts` with 9 passing tests covering even swaps, exact 10% tolerance boundary, asymmetric values, and missing price/AI values.

### 3. State Management & Persistence (`src/store/`)
- `demoStore.ts`: Controls demo persona (default: Ravi), AI scenario, auto-respond, simulated errors, and slow network flags.
- `mockDataStore.ts`: Manages items, conversations, messages, requests, and profiles in-memory with AsyncStorage persistence and full seed reset capabilities.

## Phase F2: Navigation and Authentication

### 1. Route Organization & Auth-Gating
- Organized routes into `app/(auth)` and `app/(tabs)` route groups.
- `app/index.tsx` functions as a clean auth gate: redirects authenticated users directly to `/(tabs)` and logged-out users to `/(auth)/welcome`.
- State persists across reloads via `AsyncStorage` through `AuthProvider` and `useDemoStore`.

### 2. Tab Bar Design
- Custom tab bar implemented in `app/(tabs)/_layout.tsx`:
  - 5 tabs: Home, Donate, Post (center raised, highlighted with primary color `#1F9D7A` and elevated circle), Inbox (with unread notification badge), Profile.
  - Animated feedback and light haptics integrated into tab interactions.

### 3. Authentication & Persona Switching
- Welcome screen features pure geometric illustration without remote images.
- Sign Up provides two-card interactive selection (Individual vs NGO), where selecting NGO dynamically presents NGO organization name, registration number fields, and verification notices.
- Login screen provides quick-login chips for Ravi (Buyer), Asha (Seller), and Priya (NGO) for fast persona testing.
- Profile and Demo Controls screens allow switching between all 6 seeded personas seamlessly.

## Phase F3: Home Feed and Item Detail

### 1. Two-Column Grid & Debounced Feed
- `HomeScreen` uses `useDebounce` (250ms) to ensure smooth real-time filtering without lag.
- Feed cards wrap into a true 2-column grid (`50%` width), matching the design specification on both mobile and web.
- Includes 700ms initial skeleton loading, pull-to-refresh with haptics, and friendly empty states.

### 2. Context-Aware Item Detail Actions
- Implemented in `app/item/[id].tsx` with sticky bottom actions dynamically determined by:
  1. **Own Item:** Shows "Edit" (toast disabled) and "Mark as completed".
  2. **Sell Item (other user):** Shows "Chat" and "Make an offer" (opens `MakeOfferSheet`).
  3. **Exchange Item (other user):** Shows "Chat" and "Propose a swap".
  4. **Donate Item (individual):** Shows "Chat with donor".
  5. **Donate Item (verified NGO, e.g. Priya):** Shows active "Request this item" action.
  6. **Donate Item (unverified NGO, e.g. Dev):** Shows disabled button with verification pending banner.
  7. **Reserved / Completed Items:** Replaces actions with status banner and disables interactive modifications.
- **Donor Requests Management:** Donors viewing their own donate items with pending requests (e.g. Asha viewing Item 9) see a Requests section with NGO details and one-tap Accept / Decline actions.

### 3. Make an Offer Bottom Sheet (`MakeOfferSheet.tsx`)
- Calculates quick discount chips (-10%, -20%, asking price) and enforces strictly positive offers within asking price limits.

## Phase F4: Post Flow

### 1. 4-Step Modal Stepper Architecture (`app/post.tsx`)
- Encapsulated within a full-screen modal presentation route in `app/post.tsx`, reachable via the elevated center tab button.
- Clean 4-step stepper (`Stepper` component) showing progression across `Photos -> AI Valuation -> Details -> Type & Price -> Success`.

### 2. Multi-Source Photos & Simulator Support
- Integrates `expo-image-picker` with camera capture (`launchCameraAsync`), device gallery (`launchImageLibraryAsync`), and a dedicated "Use sample photos" utility for simulator / web demo testing.
- Supports 1 to 3 photos with 4:5 aspect ratio thumbnails and individual deletion controls.

### 3. Animated Multi-Stage AI Valuation
- Simulates realistic 2.5-second three-stage analysis (`Checking photos are safe`, `Identifying item & features`, `Estimating fair valuation`).
- Connects directly to `aiService.analyzeItem` and honors active AI scenarios (`high`, `medium`, `low`, `flagged`, `auto`).
- **Safety Moderation:** In the `flagged` scenario, displays a friendly blocking screen with moderation rationale and a one-tap action to select different photos.
- **Pristine Field Tracking:** Prefilled fields show an emerald "AI suggested" tag that dynamically vanishes when edited by the user.
- **Low Confidence Guidance:** Renders an informational tip card suggesting additional details or photos when confidence is low.

### 4. Dynamic Listing Types & Live Fair Range
- **Sell:** Prefills price with AI midpoint and renders a live Fair Range visual bar indicating market position with instant feedback (within range vs above/below).
- **Exchange:** Displays estimated swap valuation used by the 10% tolerance exchange engine.
- **Donate:** Highlights verified NGO eligibility note and inbox review expectations.
- **Publish & Success:** Newly created items prepend immediately to the in-memory feed via `itemsService.create`, updating Home and My Items instantly, and route to a celebratory confirmation screen with options to View Listing, Post Another, or return Home.

