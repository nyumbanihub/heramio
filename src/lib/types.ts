export type Gender = "man" | "woman";
export type AccountRole = "dater" | "host";
export type StayStatus =
  | "upcoming"
  | "past"
  | "cancelled"
  | "pending"
  | "released"
  | "verified"
  | "paid"
  | "confirmed"
  | "checked_in"
  | "completed";

export interface UserPreferences {
  notifyLikes: boolean;
  notifyMessages: boolean;
  notifyFollows: boolean;
  notifyMarketing: boolean;
  privacyShowOnline: boolean;
  privacyAllowMessages: boolean;
  privacyDiscoverable: boolean;
  language: string;
  currency: string;
  [key: string]: any;
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  gender: Gender;
  city: string;
  country: string;
  county: string;
  estate: string;
  online: boolean;
  distanceKm: number;
  bio: string;
  followers: string;
  following: string;
  interests: string[];
  languages: string[];
  rating: number;
  role: AccountRole;
  prefs: UserPreferences;
  payoutMethod: string;
  payoutNumber: string;
  [key: string]: any;
}

export interface NearbyPerson {
  id: string;
  userId: string;
  distanceKm: number;
  online: boolean;
  estate?: string;
  lastSeen?: string;
  intent?: string;
  [key: string]: any;
}

export interface ExploreItem {
  id: string;
  image: string;
  label: string;
  tall: boolean;
  [key: string]: any;
}

export interface VerificationBadge {
  key: string;
  label: string;
  icon: string;
  done: boolean;
  [key: string]: any;
}

export interface FeedPost {
  id: string;
  userId?: string;
  authorId?: string;
  userName?: string;
  userAvatar?: string;
  caption?: string;
  image?: string;
  location?: string;
  createdAt?: string;
  time?: string;
  likes?: number;
  comments?: number;
  saved?: boolean;
  liked?: boolean;
  aspect?: "square" | "portrait";
  [key: string]: any;
}

export interface PostComment {
  id: string;
  postId?: string;
  userId?: string;
  name?: string;
  avatar?: string;
  body?: string;
  text?: string;
  createdAt?: string;
  username?: string;
  [key: string]: any;
}

export interface AppEvent {
  id: string;
  title?: string;
  image?: string;
  date?: string;
  time?: string;
  city?: string;
  venue?: string;
  estate?: string;
  venueName?: string;
  attendees?: number;
  capacity?: number;
  category?: string;
  price?: number;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  estate: string;
  country?: string;
  image: string;
  secondImage?: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  meetupReady: boolean;
  rating: number;
  reviews: number;
  hostId?: string;
  hostName?: string;
  description?: string;
  distanceKm?: number;
  location?: string;
  hostAvatar?: string;
  type?: string;
  highlights?: string[];
  houseRules?: string[];
  lat?: number;
  lng?: number;
  [key: string]: any;
}

export interface NewListingInput {
  title?: string;
  description?: string;
  city?: string;
  estate?: string;
  country?: string;
  pricePerNight?: number;
  maxGuests?: number;
  amenities?: string[];
  image?: string;
  imageUrl?: string;
  meetupReady?: boolean;
  name?: string;
  type?: string;
  [key: string]: any;
}

export interface WalletSummary {
  currency: string;
  available: number;
  pending: number;
  lifetimeEarnings: number;
  [key: string]: any;
}

export interface Transaction {
  id: string;
  type?: "deposit" | "withdrawal" | "booking" | "payout" | "refund";
  title?: string;
  amount?: number;
  status: "pending" | "completed" | "failed" | "Completed" | "Pending" | "Held" | "Refunded";
  createdAt?: string;
  description?: string;
  subtitle?: string;
  date?: string;
  icon?: string;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  userId?: string;
  otherUserId?: string;
  lastMessage?: string;
  updatedAt?: string;
  unread?: number;
  online?: boolean;
  time?: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId?: string;
  body?: string;
  createdAt?: string;
  mine?: boolean;
  image?: string;
  text?: string;
  time?: string;
  [key: string]: any;
}

export interface ActivityItem {
  id: string;
  type: "follow" | "like" | "comment" | "booking" | "meet" | "status";
  title?: string;
  subtitle?: string;
  createdAt?: string;
  userId?: string;
  text?: string;
  time?: string;
  thumb?: string;
  [key: string]: any;
}

export interface LikeItem {
  id: string;
  userId?: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
  matchup?: number;
  time?: string;
  [key: string]: any;
}

export interface ViewerItem {
  id: string;
  userId?: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
  time?: string;
  [key: string]: any;
}

export interface StayBooking {
  id: string;
  venueId: string;
  userId?: string;
  hostId?: string;
  venueName?: string;
  title?: string;
  hostName?: string;
  guestName?: string;
  payoutStatus?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  total?: number;
  status: StayStatus;
  createdAt?: string;
  meetCode?: string;
  released?: boolean;
  driverAddon?: boolean;
  confirmed?: boolean;
  guestConfirmed?: boolean;
  hostConfirmed?: boolean;
  paymentMethod?: string;
  payout?: number;
  hostPayout?: number;
  [key: string]: any;
}

export interface AuthMember {
  id: string;
  name: string;
  avatar: string;
  [key: string]: any;
}
