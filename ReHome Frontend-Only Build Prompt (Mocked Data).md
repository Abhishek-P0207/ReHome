# ReHome: Frontend-Only Build Prompt (Mocked Data)

You are a senior React Native engineer and product designer. Build ONLY the frontend of ReHome, a mobile app where people sell, swap, or donate unused household items. Every feature runs on mocked data. There is no backend, no Supabase, no AWS, no network call, and no API key anywhere in this task.

The result must look and feel like a finished, beautiful app that I can demo on a phone in Expo Go. Later I will replace the mocks with real services, so the code must be structured so that only the `services/` folder changes at that point.

## 1. Hard constraints

- **Stack:** Expo (latest stable SDK), React Native, TypeScript in strict mode, Expo Router, React Native Paper (Material 3) as the base with a custom theme, `react-native-reanimated`, `react-native-gesture-handler`, `expo-image`, `expo-haptics`, `expo-image-picker`, `@expo/vector-icons`, `@expo-google-fonts/plus-jakarta-sans`, `zustand` for the mock store, `date-fns`. Do not add other libraries without noting why in `docs/DECISIONS.md`.
- **No real backend or network.** Everything is served by mock services with simulated latency.
- **Light theme only,** but build every color from design tokens so dark mode could be added later.
- **Runs in Expo Go** on iOS and Android. `npx expo start --web` should also load without crashing (best effort, not a priority).
- **Currency and locale:** INR (₹), formatted with `en-IN`.
- **Persistence:** keep mock state in memory, and optionally persist it with AsyncStorage so a reload keeps the demo state. Always provide a Reset demo data button (section 8).
- **Images:** do not depend on remote image URLs. Build an `ItemImage` component that shows a local asset when one exists in `app/assets/mock/` (mapped in `mock/images.ts`), and otherwise shows a tasteful category-colored placeholder with a large category icon. I will drop real photos in later.

## 2. Architecture rules (so the backend can be plugged in later)

```
app/
  app/                    Expo Router routes (screens only, thin)
    (auth)/welcome.tsx, login.tsx, signup.tsx
    (tabs)/index.tsx, post.tsx, inbox.tsx, donate.tsx, profile.tsx
    item/[id].tsx
    chat/[conversationId].tsx
    ngo/[id].tsx
    my-items.tsx
    demo-controls.tsx
  src/
    theme/                tokens.ts, theme.ts (Paper theme), typography.ts
    components/           reusable UI (section 4)
    features/             feature-specific components and hooks
    services/             THE ONLY LAYER THAT TOUCHES DATA
      index.ts            exports the active implementation
      types.ts            service interfaces
      mock/               mock implementations + seed data
    store/                zustand stores used by the mock services
    lib/                  exchange.ts (pure logic), format.ts, constants.ts
    types/                domain types (below)
  docs/DECISIONS.md
  README.md
```

Rules:

- Screens and components **never import mock data directly**. They call hooks that call `services/`.
- Every service function is `async`, resolves after a simulated 300 to 900 ms delay, and can throw a typed `AppError`. Failures only happen when the Demo Controls toggle Simulate errors is on.
- `services/index.ts` picks the implementation from `EXPO_PUBLIC_USE_MOCKS` (default `true`). Only the mock implementation exists for now.
- Keep business rules (exchange top-up, offer thresholds) in `lib/` as pure functions with unit tests.

### Domain types (`src/types`)

These mirror the future database, so keep the names.

```ts
export type ListingType = 'sell' | 'exchange' | 'donate';
export type Condition = 'new' | 'like_new' | 'good' | 'fair';
export type ItemStatus = 'active' | 'reserved' | 'completed' | 'removed';
export type Confidence = 'low' | 'medium' | 'high';

export interface Profile { id: string; displayName: string; city: string; role: 'user' | 'ngo'; avatarColor: string; }
export interface Organization { id: string; ownerId: string; name: string; description: string; city: string; registrationNo: string; verified: boolean; itemsReceived: number; }
export interface AiEstimate { min: number; max: number; confidence: Confidence; brand?: string; model?: string; reasoning: string; mock: true; }
export interface Item {
  id: string; ownerId: string; title: string; description: string; category: string;
  condition: Condition; listingType: ListingType; price?: number; ai?: AiEstimate;
  images: string[]; city: string; status: ItemStatus; claimedByOrgId?: string; createdAt: string;
}
export interface Conversation { id: string; itemId: string; buyerId: string; sellerId: string; }
export interface Message {
  id: string; conversationId: string; senderId: string;
  kind: 'text' | 'offer' | 'exchange' | 'system';
  body?: string; amount?: number; offeredItemId?: string;
  topupAmount?: number; topupPayerId?: string;
  status?: 'pending' | 'accepted' | 'declined'; createdAt: string;
}
export interface DonationRequest { id: string; itemId: string; orgId: string; status: 'pending' | 'accepted' | 'declined'; createdAt: string; }
```

### Service interfaces (`services/types.ts`)

- `auth`: `signUp`, `logIn`, `logOut`, `getCurrentUser`, `switchPersona` (mock only)
- `items`: `list({ type?, query?, city? })`, `get(id)`, `create(draft)`, `listMine()`, `markCompleted(id)`, `remove(id)`
- `ai`: `analyzeItem({ photos, hint? })` returning `{ safe, labels, identification, estimate }`
- `chat`: `listConversations()`, `getOrCreateConversation(itemId)`, `getMessages(id)`, `sendText`, `sendOffer`, `respondToOffer`, `subscribe(conversationId, cb)` (the mock emits scripted replies)
- `exchange`: `propose({ conversationId, myItemId, theirItemId })`, `respond(messageId, accept)`
- `donations`: `listOrganizations()`, `getOrganization(id)`, `requestItem(itemId)`, `listRequestsForItem(itemId)`, `respond(requestId, accept)`
- `profile`: `getStats()` (items listed, deals done, items donated)

## 3. Design system

The app must feel warm, trustworthy, and modern: friendly, not corporate. Think fresh marketplace, big photos, soft shapes.

**Color tokens** (define in `theme/tokens.ts`, adjust slightly if contrast fails)

| Token | Value | Use |
| --- | --- | --- |
| primary | `#1F9D7A` | Primary buttons, active tab, links |
| primaryDark | `#0F6E56` | Pressed state, headings on tinted surfaces |
| primarySoft | `#E1F5EE` | Tinted backgrounds, selected chips |
| background | `#F7F8F6` | App background |
| surface | `#FFFFFF` | Cards, sheets |
| textPrimary | `#17211D` | Main text |
| textSecondary | `#5B6B64` | Secondary text |
| border | `#E3E8E5` | Hairlines |
| sell | `#1F9D7A` on `#E1F5EE` | Sell tag |
| exchange | `#B7660B` on `#FDF1DC` | Exchange tag |
| donate | `#B0306A` on `#FCE8F1` | Donate tag |
| success / warning / danger | `#2E7D32` / `#B7660B` / `#C62828` | Status chips, errors |

**Typography:** Plus Jakarta Sans. Scale: display 28/34 bold, title 22/28 semibold, heading 18/24 semibold, body 15/22 regular, caption 13/18 regular, label 12/16 medium. Two weights plus semibold at most.

**Shape and spacing:** 8-point grid. Card radius 16, button radius 14, chip radius 999, bottom sheet top radius 24. Soft elevation only (one subtle shadow style), no heavy borders.

**Motion and feedback:** use Reanimated for list entrance (`FadeInDown`, staggered by index, max 8 items), press scale (0.97) on cards and buttons, animated tab icon, and a spring on bottom sheets. Fire a light haptic on primary actions (post, send offer, accept) and a success haptic when a deal or swap is accepted. Respect reduced motion.

**Accessibility:** touch targets at least 44 by 44, text contrast at least 4.5:1, every touchable has an `accessibilityLabel`, images have alt labels, and font scaling does not break layouts.

## 4. Reusable components (build first, in Phase 0)

Build each with props typed and states handled, then show them all on a hidden Design System screen (reachable from Demo Controls) so I can review them in one place.

- `Button` (primary, secondary, ghost, danger; loading and disabled states)
- `TypeTag` (Sell, Exchange, Donate), `StatusChip` (Reserved, Completed, Pending, Verified), `ConfidenceBadge` (Low, Medium, High)
- `ItemCard` (grid card: photo with 4:5 ratio, type tag overlay, title, price or Free or Swap, city) and `ItemRow` (list version)
- `ItemImage` (asset or placeholder), `ImageCarousel` (swipe plus dots), `Avatar` (initials on a color)
- `PriceText` (₹ with en-IN grouping), `AiEstimateCard`
- `SearchBar`, `FilterChips` (single-select, horizontally scrollable)
- `BottomSheet` (spring animation, drag to dismiss, keyboard aware)
- `ChatBubble`, `OfferCard`, `ExchangeCard`, `SystemMessage`, `TypingIndicator`
- `VerifiedBadge`, `NgoCard`
- `EmptyState` (icon, title, one line, optional action), `SkeletonCard`, `ErrorState` (message plus Retry)
- `Stepper` (progress dots for the Post flow), `SectionHeader`, `Snackbar` wrapper

## 5. Screens and behavior

### Auth

- **Welcome:** brand mark and name, a one-line value statement ('Give your stuff a second life'), a soft illustration made from simple shapes and icons (no images), Log in and Create account buttons.
- **Sign up:** name, email, password, city, then a clear two-card choice, I am an individual or I represent an NGO. NGO choice reveals NGO name and registration number fields and shows a note that verification is needed before claiming donations. Inline validation, friendly errors, keyboard-aware layout.
- **Log in:** email and password. Mock login accepts anything, but also shows three quick-login chips (Ravi the buyer, Asha the seller, Priya from an NGO) to switch personas fast.

### Tab bar

Home, Post (center, raised, highlighted), Inbox (with an unread count badge), Donate, Profile. Animated active state.

### Home (feed)

- Header with greeting and city chip, search bar, filter chips: All, Sell, Exchange, Donate.
- Two-column masonry-like grid of `ItemCard`s, staggered entrance, pull to refresh, skeleton cards during first load (about 700 ms), and an empty state when a filter or search has no results ('Nothing here yet. Be the first to post.').
- Search filters by title and category as you type (debounced 250 ms).
- Tapping a card opens Item detail with a shared fade or scale transition if feasible, otherwise a standard push.

### Item detail

- Swipeable image carousel with dots, a back button and a share icon overlay.
- Title, type tag, price (or Free or Open to swap), condition chip, city, posted time.
- **AI estimate card** (when present): 'AI estimate ₹1,200 to ₹1,800', a confidence badge, one-line reasoning, and a small info line ('An estimate, not a guaranteed price').
- Description, seller row (avatar, name, city, a small rating placeholder), and a donor impact line for donate items.
- **Sticky bottom action, context-aware:**
  - Own item: Edit (disabled with a toast, out of scope) and Mark as completed.
  - Sell item, other user: Chat with seller and Make an offer.
  - Exchange item, other user: Propose a swap and Chat.
  - Donate item, individual user: Chat with donor.
  - Donate item, verified NGO: **Request this item**.
  - Donate item, unverified NGO: a disabled button with a banner 'Verification pending. You can claim items once approved.'
  - Reserved or completed items show a status chip and disable actions.
- If the viewer owns a donate item with pending NGO requests, show a **Requests** section with each NGO card and Accept or Decline buttons.

### Post flow (4-step stepper, full screen modal)

1. **Photos:** add 1 to 3 photos from the camera or gallery with `expo-image-picker`. Also a Use sample photos button (placeholder images) so it works on simulators. Thumbnails with remove buttons.
2. **AI analysis:** an animated screen, about 2.5 seconds, with three checks completing in sequence ('Checking photos are safe', 'Identifying your item', 'Estimating a fair value'). Then it shows the result. Results depend on the AI scenario in section 7. For the flagged scenario, show a friendly blocking message and a button to choose different photos.
3. **Details:** editable title, brand, category (chip picker), condition (segmented), description. Fields prefilled from the AI result with a small 'AI suggested' badge that disappears when edited. If confidence is Low, show a hint card ('Add a model name or more photos for a better estimate').
4. **Type and price:** a three-card choice of Sell, Exchange, Donate. Sell shows a price input prefilled with the AI midpoint, a live 'Fair range' bar showing where the price sits inside the AI range, and a warning if far outside it. Exchange shows the estimated value that will be used for swap comparison. Donate shows a note that only verified NGOs can claim the item. A Publish button leads to a success screen with a check animation, a success haptic, and buttons View my listing and Post another.

The published item appears at the top of Home and in My items immediately.

### Inbox

Conversation rows with item thumbnail, the other person, last message preview, time, unread dot, and a status chip when an offer or swap is pending. Empty state for no conversations. Swipe to archive is optional.

### Chat

- Header with the other person's name and a tappable item mini-card (thumbnail, title, price) that opens Item detail.
- Message list (inverted), bubbles aligned by sender, timestamps grouped, a typing indicator when the mock replies.
- **Offer card:** amount, status chip (Pending, Accepted, Declined), and when the viewer is the seller and the offer is pending, Accept and Decline buttons.
- **Exchange card:** both items side by side with thumbnails and estimated values, the computed result ('Even swap' or 'Top-up ₹1,500 paid by Ravi'), a status chip, and Accept and Decline for the item owner.
- **System messages** (centered, muted): 'Offer accepted. This item is now reserved.' and 'Deal marked completed.'
- Input bar with a text field, a send button, and a plus button that opens a sheet with Make an offer and Propose a swap (when relevant).
- After an offer is accepted, show a banner with a **Mark deal completed** button. When the other side has also confirmed (mock auto-confirms after 2 seconds), the item shows Completed.

### Make an offer (bottom sheet)

Asking price shown, an amount field with quick chips (-10%, -20%, asking price), a validation message for zero or above-asking amounts, and a Send offer button.

### Propose a swap (bottom sheet)

- Horizontal list of the viewer's own active items (exchange and sell types) to pick from, with an empty state if none ('Post an item first to propose a swap').
- A preview card comparing the two items, each with the value used, and the computed result from `lib/exchange.ts`. If it is not an even swap, show who pays the top-up and the amount in a highlighted row.
- A note: 'Payment is settled at handover.' A Send proposal button creates an exchange message.

### Donate tab

- Top: a short banner about verified NGOs, then a horizontal chip row (All, Verified, Pending).
- List of `NgoCard`s: name, city, description snippet, `VerifiedBadge` (green) or 'Pending verification' (muted), and items received count.
- Below, an 'Items you can donate to' strip of donate-type items for quick browsing.
- **NGO detail:** header, verified status explanation, description, registration number, items received, and a grid of donate items currently available.

### Profile

- Avatar, name, city, role chip, and for NGO users the verification status card (Verified, or Pending with an explainer).
- Stats row: Listed, Deals done, Donated.
- Rows: My items, Demo controls, Log out.
- **My items:** tabs Active, Reserved, Completed. Each row has quick actions (Mark completed, Remove). Empty states for each tab.

## 6. Business rules to implement in the UI

**Exchange top-up (`lib/exchange.ts`, pure function with unit tests)**

- The value of an item is its owner-set price if present, otherwise the midpoint of its AI range.
- `diff = |vA - vB|` and `tolerance = 10% of max(vA, vB)`.
- If `diff <= tolerance` the result is an even swap. Otherwise the owner of the lower-valued item pays `diff`.
- Return `{ even, topupAmount, payerId, valueA, valueB }`. Test at least: an even swap, a tie at exactly 10%, each side paying, and a missing AI value.

**Offers**

- Amount must be above zero and not above the asking price.
- Accepting an offer sets the item to `reserved` and adds a system message. Only the seller can accept or decline.

**Donations**

- Only organizations with `verified = true` can request a donate item. An unverified NGO sees the disabled state (enforced in the mock service too, which throws `NOT_VERIFIED`).
- The donor accepts one request. The item becomes `completed` with `claimedByOrgId` set, the NGO's received count increases, and other pending requests are declined.

## 7. Mock data

**Personas (switchable in Demo Controls). Default on first launch: Ravi.**

| Name | Role | City | Notes |
| --- | --- | --- | --- |
| Ravi | Individual (buyer) | Chennai | Default persona; owns the exchange items 7, 8, 13 |
| Asha | Individual (seller) | Chennai | Owns items 1, 2, 6, 9 |
| Meera | Individual | Bengaluru | Owns items 3, 5, 10 |
| Karthik | Individual | Mumbai | Owns items 4, 11, 12 |
| Priya | NGO user | Chennai | Runs Asha Kiran Trust (verified) |
| Dev | NGO user | Bengaluru | Runs Care Together (pending verification) |

**Organizations:** Asha Kiran Trust (verified, Chennai, 14 items received), Little Steps Foundation (verified, Bengaluru, 9 received, owned by a seeded NGO user), Care Together (pending, Bengaluru, 0 received).

**Items (13). Use realistic descriptions of 1 to 2 sentences each.**

| # | Title | Type | Price or value (₹) | AI range (₹) | Category | Condition | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Prestige 750W Mixer Grinder | Sell | 1,500 | 1,200 to 1,800 | Kitchen | Good | Asha |
| 2 | Nike Air Max running shoes (UK 9) | Sell | 2,800 | 2,200 to 3,200 | Footwear | Like new | Asha |
| 3 | Samsung Galaxy M31, 6GB/128GB | Sell | 6,500 | 5,500 to 7,500 | Phones | Good | Meera |
| 4 | Study table with drawer | Sell | 2,200 | 1,800 to 3,000 | Furniture | Fair | Karthik |
| 5 | Harry Potter box set (7 books) | Sell | 1,200 | 1,000 to 1,800 | Books | Good | Meera |
| 6 | Yamaha acoustic guitar | Exchange | 4,500 | 3,800 to 5,500 | Music | Good | Asha |
| 7 | Philips air fryer | Exchange | none (AI midpoint 3,000) | 2,500 to 3,500 | Kitchen | Like new | Ravi |
| 8 | Levi's denim jacket (M) | Exchange | none (AI midpoint 1,500) | 1,200 to 1,800 | Clothing | Good | Ravi |
| 9 | Children's storybooks (25 books) | Donate | none | 500 to 900 | Books | Good | Asha |
| 10 | Winter blankets (set of 4) | Donate | none | 1,200 to 2,000 | Home | Good | Meera |
| 11 | Wooden school desk | Donate | none | 800 to 1,400 | Furniture | Fair | Karthik |
| 12 | Dell laptop, i5 with 8GB RAM | Donate | none | 8,000 to 12,000 | Electronics | Fair | Karthik |
| 13 | Sony wireless headphones | Exchange | 2,500 | 2,000 to 3,000 | Electronics | Good | Ravi |

Give items 1, 2, 3, 6, 7, 12 and 13 a brand and a High or Medium confidence. Give items 4, 8, 9, 10 and 11 a Low confidence (unbranded).

**Seeded conversations (so Inbox is never empty for Ravi)**

1. Ravi and Asha on item 1: Ravi's offer of ₹1,300 is pending. (Switch to Asha to accept it.)
2. Ravi and Meera on item 3: Ravi's offer of ₹6,000 was accepted, so item 3 is Reserved, with the system message and the Mark deal completed banner.
3. Ravi and Asha on item 6: Ravi proposes his air fryer (item 7) for the guitar. The result is a top-up of ₹1,500 paid by Ravi, status Pending.

**Seeded donation request:** Asha Kiran Trust has a pending request on item 9 (Asha sees it in the Requests section).

**AI scenarios (the `ai` mock, selectable in Demo Controls)**

- `auto` (default): cycles High, then Medium, then Low across successive posts.
- `high`: branded item such as 'Prestige Mixer Grinder', a narrow range, High confidence.
- `medium`: brand known, model unknown, a wider range, Medium confidence.
- `low`: unbranded, a wide range, Low confidence with the hint card.
- `flagged`: moderation fails with the friendly block message.

## 8. Mock behaviors and Demo Controls

**Simulated behaviors**

- **Offer replies:** after a buyer sends an offer, show a typing indicator for 1 second, then the mock seller responds 2 seconds later. At or above 90% of the asking price: accept. Between 70% and 90%: counter with 95% of the asking price, rounded to the nearest ₹50. Below 70%: decline with a polite text message.
- **Swap replies:** when Auto-respond is on, the mock owner accepts a swap proposal 3 seconds later.
- **Deal completion:** after the user taps Mark deal completed, the mock other party confirms 2 seconds later and the item becomes Completed.
- **NGO requests:** a verified NGO's request is created as Pending and stays that way until the donor persona accepts it.

**Demo Controls screen (`/demo-controls`, linked from Profile)**

- Persona switcher (all six personas)
- AI scenario selector
- Toggles: Auto-respond, Simulate errors, Slow network (doubles latency)
- Reset demo data (restores the seed and clears persisted state)
- Link to the Design System screen

## 9. Build phases

Work phase by phase. After each phase: run `npx tsc --noEmit` and the unit tests, fix problems, commit with a clear message, then print a short CHECKPOINT summary (what works, how I test it, anything I must do) and **wait for my go-ahead**.

**F0: Scaffold and design system.** Create the Expo app, install dependencies, set up folders, tokens, theme, fonts, and every component in section 4. Build the Design System screen. *Acceptance:* the app boots in Expo Go and the Design System screen shows every component and state.

**F1: Types, mock services, and store.** Add domain types, service interfaces, the mock implementation with seed data, latency simulation, and the zustand store. Implement `lib/exchange.ts` and its tests. *Acceptance:* tests pass, and a throwaway debug screen can list items and conversations through services only.

**F2: Navigation and auth.** Expo Router groups, the tab bar, Welcome, Sign up (with NGO choice), Log in with persona chips, and auth-gated routing. *Acceptance:* sign up, log in, switch persona, and log out all work, and the state survives a reload.

**F3: Home and Item detail.** Feed with filters, search, skeletons, empty states, and pull to refresh, plus Item detail with every context-aware action state. *Acceptance:* every item type shows the correct bottom action for each persona.

**F4: Post flow.** The four steps, all five AI scenarios, success screen, and the new item appearing in Home and My items. *Acceptance:* a post with each scenario behaves as described, including the flagged block.

**F5: Inbox and Chat with offers.** Conversations, chat, offer cards, the Make an offer sheet, mock replies, the reserved state, and Mark deal completed. *Acceptance:* the three seeded conversations render correctly and the offer reply rules work.

**F6: Exchange.** The Propose a swap sheet, the exchange card, accept and decline, and the reserved state for both items. *Acceptance:* the seeded guitar swap shows a ₹1,500 top-up paid by Ravi, and a new proposal computes correctly.

**F7: Donate and NGO flows.** Donate tab, NGO detail, Request this item for verified NGOs, the disabled state for unverified NGOs, and the donor's Requests section with Accept and Decline. *Acceptance:* Priya can request an item and Dev cannot, and the donor can accept a request, after which the item shows Completed and the NGO's count increases.

**F8: Profile, Demo Controls, and polish.** My items, stats, Demo Controls, an animation and haptics pass, an empty, loading, and error states audit, an accessibility pass, `README.md` with run steps and a 3-minute demo script, and a screenshot checklist. *Acceptance:* section 10 is fully checked.

## 10. Definition of done

- [ ] The app runs in Expo Go with no red screens or yellow-box warnings on the main flows
- [ ] Every screen in section 5 exists with loading, empty, and error states
- [ ] All five AI scenarios work, and the flagged scenario blocks publishing
- [ ] The three seeded conversations and the seeded donation request behave as described
- [ ] Offer, swap, deal completion, and NGO request simulations all follow section 8
- [ ] `lib/exchange.ts` has passing unit tests, and `tsc --noEmit` is clean
- [ ] No screen imports mock data directly, and no network call exists anywhere
- [ ] Design tokens are used everywhere, with no hardcoded colors in screens
- [ ] `README.md` explains setup, personas, Demo Controls, and how to swap in real services later
- [ ] A 3-minute demo script is written: sign in as Ravi, browse and make an offer, propose the swap, post an item with AI, then switch to Priya for the donation flow

## 11. What you must not do

- Do not add a backend, Supabase, AWS, authentication libraries, or any API call.
- Do not hardcode colors, fonts, or spacing in screens. Use tokens.
- Do not add features outside this prompt (payments, maps, push notifications, ratings, delivery).
- Do not leave placeholder text such as 'Lorem ipsum' or 'TODO' in any screen.
- If something is ambiguous, choose the simplest option that looks good, record it in `docs/DECISIONS.md`, and continue. Ask me only if you are truly blocked.
- If you cannot run commands, write the files and give me the exact commands to run.
