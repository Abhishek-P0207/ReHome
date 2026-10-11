/**
 * ReHome Service Layer Interfaces.
 *
 * Screens and components interact EXCLUSIVELY with these service interfaces.
 * When real backend services (Supabase/AWS) are plugged in later, only
 * the services/ implementation changes.
 */
import type {
  Item,
  Profile,
  Organization,
  Conversation,
  Message,
  DonationRequest,
  ListingType,
  AiEstimate,
  Condition,
  ProfileStats,
} from '@/types';

// ─── Auth Service ────────────────────────────────────────────────────────────

export interface SignUpParams {
  name: string;
  email: string;
  password?: string;
  city: string;
  role: 'user' | 'ngo';
  orgName?: string;
  registrationNo?: string;
}

export interface LogInParams {
  email: string;
  password?: string;
}

export interface AuthService {
  signUp(params: SignUpParams): Promise<Profile>;
  logIn(params: LogInParams): Promise<Profile>;
  logOut(): Promise<void>;
  getCurrentUser(): Promise<Profile | null>;
  switchPersona(personaId: string): Promise<Profile>;
}

// ─── Items Service ───────────────────────────────────────────────────────────

export interface ListItemsFilter {
  type?: ListingType;
  query?: string;
  city?: string;
}

export interface CreateItemDraft {
  title: string;
  description: string;
  category: string;
  condition: Condition;
  listingType: ListingType;
  price?: number;
  ai?: AiEstimate;
  images: string[];
  city: string;
}

export interface ItemsService {
  list(filter?: ListItemsFilter): Promise<Item[]>;
  get(id: string): Promise<Item>;
  create(draft: CreateItemDraft): Promise<Item>;
  listMine(): Promise<Item[]>;
  markCompleted(id: string): Promise<Item>;
  remove(id: string): Promise<void>;
}

// ─── AI Service ──────────────────────────────────────────────────────────────

export interface AnalyzeItemParams {
  photos: string[];
  hint?: string;
}

export interface AiAnalysisResult {
  safe: boolean;
  labels: string[];
  identification: {
    title: string;
    brand?: string;
    model?: string;
    category: string;
    condition: Condition;
    description: string;
  };
  estimate: AiEstimate;
  moderationReason?: string;
}

export interface AiService {
  analyzeItem(params: AnalyzeItemParams): Promise<AiAnalysisResult>;
}

// ─── Chat Service ────────────────────────────────────────────────────────────

export interface SendOfferParams {
  conversationId: string;
  amount: number;
}

export interface RespondOfferParams {
  messageId: string;
  conversationId: string;
  accept: boolean;
}

export interface ChatService {
  listConversations(): Promise<Conversation[]>;
  getOrCreateConversation(itemId: string): Promise<Conversation>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendText(conversationId: string, text: string): Promise<Message>;
  sendOffer(params: SendOfferParams): Promise<Message>;
  respondToOffer(params: RespondOfferParams): Promise<Message>;
  markCompleted(conversationId: string): Promise<void>;
  subscribe(conversationId: string, cb: (msg: Message) => void): () => void;
}

// ─── Exchange Service ────────────────────────────────────────────────────────

export interface ProposeExchangeParams {
  conversationId: string;
  myItemId: string;
  theirItemId: string;
}

export interface ExchangeService {
  propose(params: ProposeExchangeParams): Promise<Message>;
  respond(messageId: string, conversationId: string, accept: boolean): Promise<Message>;
}

// ─── Donations Service ───────────────────────────────────────────────────────

export interface DonationsService {
  listOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization>;
  requestItem(itemId: string): Promise<DonationRequest>;
  listRequestsForItem(itemId: string): Promise<DonationRequest[]>;
  respond(requestId: string, accept: boolean): Promise<DonationRequest>;
}

// ─── Profile Service ─────────────────────────────────────────────────────────

export type { ProfileStats };

export interface ProfileService {
  getStats(userId?: string): Promise<ProfileStats>;
  getProfile(userId?: string): Promise<Profile>;
  getOrganization(orgId: string): Promise<Organization | null>;
}

// ─── Root Services Container ─────────────────────────────────────────────────

export interface Services {
  auth: AuthService;
  items: ItemsService;
  ai: AiService;
  chat: ChatService;
  exchange: ExchangeService;
  donations: DonationsService;
  profile: ProfileService;
}
