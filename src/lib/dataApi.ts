import { supabase } from "@/lib/supabase";
import type {
  ActivityItem,
  AppEvent,
  AppUser,
  ChatMessage,
  Conversation,
  FeedPost,
  Gender,
  LikeItem,
  NewListingInput,
  PostComment,
  StayBooking,
  StayStatus,
  Transaction,
  UserPreferences,
  Venue,
  ViewerItem,
  WalletSummary,
} from "@/lib/types";

export const SERVICE_FEE_KES = 130;
export const DRIVER_FEE_KES = 2500;
export const CURRENCY = "KES";

export const DEFAULT_AVATAR =
  "https://readdy.ai/api/search-image?query=Warm%20minimal%20portrait%20silhouette%20on%20soft%20cream%20background%2C%20neutral%20placeholder%20avatar%2C%20editorial%20style%2C%20high%20detail&width=400&height=400&seq=heramio-default-avatar-v1&orientation=squarish";

const DEMO = {
  lucas: "11111111-1111-1111-1111-111111111101",
  sofia: "11111111-1111-1111-1111-111111111102",
  kwame: "11111111-1111-1111-1111-111111111103",
  nadia: "11111111-1111-1111-1111-111111111107",
  daniel: "11111111-1111-1111-1111-111111111108",
  ella: "11111111-1111-1111-1111-111111111109",
  omar: "11111111-1111-1111-1111-111111111110",
  grace: "11111111-1111-1111-1111-111111111111",
  tunde: "11111111-1111-1111-1111-111111111112",
  amani: "11111111-1111-1111-1111-111111111113",
};

export function formatCount(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `${value}`;
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "now";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ProfileRow {
  user_id: string;
  role: string | null;
  display_name: string | null;
  username: string | null;
  gender: string | null;
  country: string | null;
  county: string | null;
  estate: string | null;
  bio: string | null;
  avatar_url: string | null;
  online: boolean | null;
  is_verified: boolean | null;
  followers_count: number | null;
  following_count: number | null;
  rating: number | null;
  distance_km: number | null;
  interests: string[] | null;
  languages: string[] | null;
  notify_likes: boolean | null;
  notify_messages: boolean | null;
  notify_follows: boolean | null;
  notify_marketing: boolean | null;
  privacy_show_online: boolean | null;
  privacy_allow_messages: boolean | null;
  privacy_discoverable: boolean | null;
  pref_language: string | null;
  pref_currency: string | null;
  payout_method: string | null;
  payout_number: string | null;
}

export const PROFILE_COLUMNS =
  "user_id, role, display_name, username, gender, country, county, estate, bio, avatar_url, online, is_verified, followers_count, following_count, rating, distance_km, interests, languages, notify_likes, notify_messages, notify_follows, notify_marketing, privacy_show_online, privacy_allow_messages, privacy_discoverable, pref_language, pref_currency, payout_method, payout_number";

export function mapPreferences(row: ProfileRow): UserPreferences {
  return {
    notifyLikes: row.notify_likes !== false,
    notifyMessages: row.notify_messages !== false,
    notifyFollows: row.notify_follows !== false,
    notifyMarketing: row.notify_marketing === true,
    privacyShowOnline: row.privacy_show_online !== false,
    privacyAllowMessages: row.privacy_allow_messages !== false,
    privacyDiscoverable: row.privacy_discoverable !== false,
    language: row.pref_language || "en",
    currency: row.pref_currency || "KES",
  };
}

function mapUser(row: ProfileRow): AppUser {
  const gender: Gender = row.gender === "man" ? "man" : "woman";
  return {
    id: row.user_id,
    name: row.display_name || row.username || "Member",
    username: row.username || "member",
    avatar: row.avatar_url || DEFAULT_AVATAR,
    verified: Boolean(row.is_verified),
    gender,
    city: row.county || "",
    country: row.country || "",
    county: row.county || "",
    estate: row.estate || "",
    online: Boolean(row.online),
    distanceKm: Number(row.distance_km ?? 0),
    bio: row.bio || "",
    followers: formatCount(Number(row.followers_count ?? 0)),
    following: formatCount(Number(row.following_count ?? 0)),
    interests: row.interests ?? [],
    languages: row.languages ?? [],
    rating: Number(row.rating ?? 5),
    role: row.role === "host" ? "host" : "dater",
    prefs: mapPreferences(row),
    payoutMethod: row.payout_method || "M-Pesa Paybill",
    payoutNumber: row.payout_number || "",
  };
}

/** Ensures a profile row exists for the signed-in member and seeds their demo data once. */
export async function ensureUserReady(
  meId: string,
  email?: string,
  role?: string,
): Promise<void> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", meId)
    .maybeSingle();

  if (!existing) {
    const local = (email || "member").split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "") || "member";
    const pretty = local.charAt(0).toUpperCase() + local.slice(1);
    await supabase.from("profiles").insert({
      user_id: meId,
      role: role === "host" ? "host" : "dater",
      display_name: pretty,
      username: `${local}${Math.floor(1000 + Math.random() * 8999)}`,
      gender: "woman",
      country: "Kenya",
      county: "Nairobi",
      estate: "Kilimani",
      bio: "New to Heramio. Say hi and let's see where it goes.",
      is_verified: false,
      online: true,
      interests: [],
      languages: [],
      distance_km: 0,
    });
  }

  const { data: seeded } = await supabase
    .from("user_seeded")
    .select("user_id")
    .eq("user_id", meId)
    .maybeSingle();
  if (seeded) return;

  await seedUserData(meId);
  await supabase.from("user_seeded").insert({ user_id: meId });
}

async function seedUserData(meId: string): Promise<void> {
  const now = Date.now();
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60000).toISOString();

  const threads: { user: string; last: string; mins: number; messages: { from: string; text: string; mins: number }[] }[] = [
    {
      user: DEMO.lucas,
      last: "Perfect, see you Friday at 8?",
      mins: 2,
      messages: [
        { from: DEMO.lucas, text: "Hey! Loved your post about the coffee place", mins: 14 },
        { from: meId, text: "Thank you! It's my favourite hideout in the city", mins: 12 },
        { from: DEMO.lucas, text: "I have to try it. What's it called?", mins: 10 },
        { from: meId, text: "Here, this one — you'll love it", mins: 8 },
        { from: DEMO.lucas, text: "Saving that. We should go together sometime", mins: 5 },
        { from: DEMO.lucas, text: "Perfect, see you Friday at 8?", mins: 2 },
      ],
    },
    {
      user: DEMO.sofia,
      last: "Haha okay you win that one",
      mins: 26,
      messages: [
        { from: DEMO.sofia, text: "Your gallery recommendations were spot on", mins: 30 },
        { from: meId, text: "Told you! I have a sixth sense for good art", mins: 28 },
        { from: DEMO.sofia, text: "Haha okay you win that one", mins: 26 },
      ],
    },
    {
      user: DEMO.nadia,
      last: "Sent you the playlist 🎧",
      mins: 60,
      messages: [
        { from: meId, text: "What are you listening to lately?", mins: 75 },
        { from: DEMO.nadia, text: "Sent you the playlist 🎧", mins: 60 },
      ],
    },
    {
      user: DEMO.kwame,
      last: "The gallery shoot went so well",
      mins: 240,
      messages: [
        { from: DEMO.kwame, text: "The gallery shoot went so well", mins: 250 },
        { from: meId, text: "Knew it would! Send me the highlights", mins: 240 },
      ],
    },
    {
      user: DEMO.ella,
      last: "You: Sounds like a plan",
      mins: 1440,
      messages: [
        { from: DEMO.ella, text: "Brunch this weekend?", mins: 1450 },
        { from: meId, text: "Sounds like a plan", mins: 1440 },
      ],
    },
    {
      user: DEMO.omar,
      last: "Let me check my calendar",
      mins: 2880,
      messages: [
        { from: DEMO.omar, text: "Want to join the networking dinner?", mins: 2900 },
        { from: meId, text: "Possibly! When is it?", mins: 2890 },
        { from: DEMO.omar, text: "Let me check my calendar", mins: 2880 },
      ],
    },
  ];

  for (const thread of threads) {
    const { data: convo } = await supabase
      .from("conversations")
      .insert({ user_a: meId, user_b: thread.user, last_message: thread.last, last_time: iso(thread.mins) })
      .select("id")
      .single();
    if (convo?.id) {
      await supabase.from("messages").insert(
        thread.messages.map((m) => ({
          conversation_id: convo.id,
          sender_id: m.from,
          body: m.text,
          created_at: iso(m.mins),
        })),
      );
    }
  }

  await supabase.from("activity").insert([
    { user_id: meId, actor_id: DEMO.lucas, type: "like", text: "liked your photo", created_at: iso(12) },
    { user_id: meId, actor_id: DEMO.sofia, type: "view", text: "viewed your profile", created_at: iso(48) },
    { user_id: meId, actor_id: DEMO.kwame, type: "follow", text: "started following you", created_at: iso(120) },
    { user_id: meId, actor_id: DEMO.nadia, type: "comment", text: 'commented: "This is such a beautiful shot"', created_at: iso(180) },
    { user_id: meId, actor_id: DEMO.ella, type: "like", text: "and 24 others liked your post", created_at: iso(300) },
    { user_id: meId, actor_id: DEMO.omar, type: "view", text: "viewed your profile", created_at: iso(420) },
    { user_id: meId, actor_id: DEMO.daniel, type: "follow", text: "started following you", created_at: iso(540) },
    { user_id: meId, actor_id: DEMO.lucas, type: "comment", text: 'commented: "Saving this spot for next time"', created_at: iso(1440) },
    { user_id: meId, actor_id: DEMO.sofia, type: "like", text: "liked your photo", created_at: iso(1500) },
    { user_id: meId, actor_id: DEMO.kwame, type: "view", text: "viewed your profile", created_at: iso(2880) },
  ]);

  await supabase.from("profile_likes").insert([
    { liker_id: DEMO.lucas, liked_id: meId, matchup: 92, created_at: iso(12) },
    { liker_id: DEMO.omar, liked_id: meId, matchup: 88, created_at: iso(180) },
    { liker_id: DEMO.daniel, liked_id: meId, matchup: 85, created_at: iso(540) },
    { liker_id: DEMO.kwame, liked_id: meId, matchup: 81, created_at: iso(1440) },
  ]);

  await supabase.from("profile_views").insert([
    { viewer_id: DEMO.sofia, viewed_id: meId, created_at: iso(48) },
    { viewer_id: DEMO.nadia, viewed_id: meId, created_at: iso(120) },
    { viewer_id: DEMO.ella, viewed_id: meId, created_at: iso(360) },
    { viewer_id: DEMO.omar, viewed_id: meId, created_at: iso(420) },
    { viewer_id: DEMO.kwame, viewed_id: meId, created_at: iso(2880) },
  ]);

  await supabase.from("wallets").insert({
    user_id: meId,
    currency: "$",
    available: 2480.75,
    pending: 320,
    lifetime_earnings: 8640.5,
  });

  await supabase.from("transactions").insert([
    { user_id: meId, title: "Meetup booking", subtitle: "Dinner meetup · with Lucas M.", amount: -120, status: "Completed", icon: "ri-calendar-check-line", created_at: iso(60) },
    { user_id: meId, title: "Earnings released", subtitle: "Coffee meetup · from Sofia A.", amount: 180, status: "Completed", icon: "ri-arrow-down-line", created_at: iso(300) },
    { user_id: meId, title: "Protected payment held", subtitle: "Weekend meetup · with Nadia H.", amount: 320, status: "Held", icon: "ri-lock-2-line", created_at: iso(420) },
    { user_id: meId, title: "Withdrawal to M-Pesa", subtitle: "Payout · •••• 4471", amount: -500, status: "Pending", icon: "ri-bank-card-line", created_at: iso(2880) },
    { user_id: meId, title: "Platform fee", subtitle: "Service fee · 10%", amount: -20, status: "Completed", icon: "ri-percent-line", created_at: iso(4320) },
    { user_id: meId, title: "Refund issued", subtitle: "Cancelled meetup · with Omar F.", amount: 95, status: "Refunded", icon: "ri-refund-2-line", created_at: iso(7200) },
    { user_id: meId, title: "Earnings released", subtitle: "Gallery walk · from Kwame B.", amount: 240, status: "Completed", icon: "ri-arrow-down-line", created_at: iso(10080) },
    { user_id: meId, title: "Meetup booking", subtitle: "Brunch meetup · with Ella N.", amount: -75, status: "Completed", icon: "ri-calendar-check-line", created_at: iso(10080) },
  ]);
}

export async function fetchDirectory(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("distance_km", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as ProfileRow[]).map(mapUser);
}

export async function fetchFollowing(meId: string): Promise<string[]> {
  const { data, error } = await supabase.from("follows").select("following_id").eq("follower_id", meId);
  if (error) throw error;
  return (data ?? []).map((row) => row.following_id as string);
}

export async function fetchPosts(meId: string): Promise<{ posts: FeedPost[]; likedIds: string[] }> {
  const [{ data: postRows }, { data: likeRows }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, user_id, image_url, caption, location, aspect, likes_count, comments_count, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("post_likes").select("post_id").eq("user_id", meId),
  ]);

  const likedIds = (likeRows ?? []).map((row) => row.post_id as string);
  const likedSet = new Set(likedIds);

  const posts: FeedPost[] = (postRows ?? []).map((row) => ({
    id: row.id as string,
    authorId: (row.user_id as string) || meId,
    image: (row.image_url as string) || DEFAULT_AVATAR,
    aspect: row.aspect === "portrait" ? "portrait" : "square",
    caption: (row.caption as string) || "",
    location: (row.location as string) || "",
    time: timeAgo(row.created_at as string),
    likes: Number(row.likes_count ?? 0),
    comments: Number(row.comments_count ?? 0),
    liked: likedSet.has(row.id as string),
    saved: false,
  }));

  return { posts, likedIds };
}

export async function fetchComments(): Promise<PostComment[]> {
  const { data } = await supabase
    .from("comments")
    .select("id, post_id, user_id, body, created_at")
    .order("created_at", { ascending: true })
    .limit(300);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    postId: row.post_id as string,
    userId: row.user_id as string,
    username: "",
    body: (row.body as string) || "",
    time: timeAgo(row.created_at as string),
  }));
}

export async function fetchEvents(meId: string): Promise<{ events: AppEvent[]; attending: string[] }> {
  const [{ data: eventRows }, { data: attendance }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: true }),
    supabase.from("event_attendees").select("event_id").eq("user_id", meId),
  ]);

  const events: AppEvent[] = (eventRows ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) || "",
    venueId: (row.venue_id as string) || "",
    venueName: (row.venue_name as string) || "",
    city: (row.city as string) || "",
    estate: (row.estate as string) || "",
    date: (row.date as string) || "",
    time: (row.time as string) || "",
    price: Number(row.price ?? 0),
    attendees: Number(row.attendees ?? 0),
    capacity: Number(row.capacity ?? 0),
    category: (row.category as string) || "",
    image: (row.image_url as string) || "",
    description: (row.description as string) || "",
    host: (row.host as string) || "",
  }));

  return { events, attending: (attendance ?? []).map((row) => row.event_id as string) };
}

function mapVenue(row: Record<string, unknown>): Venue {
  return {
    id: row.id as string,
    name: (row.name as string) || "",
    type: row.type === "airbnb" ? "airbnb" : "hotel",
    city: (row.city as string) || "",
    estate: (row.estate as string) || "",
    country: (row.country as string) || "",
    rating: Number(row.rating ?? 5),
    reviews: Number(row.reviews ?? 0),
    pricePerNight: Number(row.price_per_night ?? 0),
    image: (row.image_url as string) || "",
    secondImage: (row.second_image_url as string) || "",
    amenities: (row.amenities as string[]) ?? [],
    description: (row.description as string) || "",
    maxGuests: Number(row.max_guests ?? 2),
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    meetupReady: Boolean(row.meetup_ready),
    hostId: (row.host_id as string) ?? null,
    hostName: (row.host_name as string) || "Heramio Partner",
    highlights: (row.highlights as string[]) ?? [],
    houseRules: (row.house_rules as string[]) ?? [],
    foodAvailable: Boolean(row.food_available),
  };
}

export async function fetchVenues(): Promise<Venue[]> {
  const { data } = await supabase.from("venues").select("*").order("created_at", { ascending: true });
  return ((data ?? []) as Record<string, unknown>[]).map(mapVenue);
}

export async function fetchHostListings(meId: string): Promise<Venue[]> {
  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("host_id", meId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(mapVenue);
}

export async function fetchConversations(meId: string): Promise<Conversation[]> {
  const { data } = await supabase
    .from("conversations")
    .select("id, user_a, user_b, last_message, last_time")
    .or(`user_a.eq.${meId},user_b.eq.${meId}`)
    .order("last_time", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: row.user_a === meId ? (row.user_b as string) : (row.user_a as string),
    lastMessage: (row.last_message as string) || "",
    time: timeAgo(row.last_time as string),
    unread: 0,
    online: false,
  }));
}

export async function fetchMessages(conversationIds: string[]): Promise<Record<string, ChatMessage[]>> {
  const grouped: Record<string, ChatMessage[]> = {};
  conversationIds.forEach((id) => {
    grouped[id] = [];
  });
  if (conversationIds.length === 0) return grouped;

  const { data } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, image_url, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: true });

  (data ?? []).forEach((row) => {
    const cid = row.conversation_id as string;
    if (!grouped[cid]) grouped[cid] = [];
    grouped[cid].push({
      id: row.id as string,
      senderId: (row.sender_id as string) || "",
      text: (row.body as string) || "",
      time: clockTime((row.created_at as string) || new Date().toISOString()),
      image: (row.image_url as string) || undefined,
    });
  });

  return grouped;
}

export async function fetchSocial(
  meId: string,
): Promise<{ activity: ActivityItem[]; likesYou: LikeItem[]; profileViewers: ViewerItem[] }> {
  const [{ data: activityRows }, { data: likeRows }, { data: viewRows }] = await Promise.all([
    supabase.from("activity").select("*").eq("user_id", meId).order("created_at", { ascending: false }),
    supabase.from("profile_likes").select("*").eq("liked_id", meId).order("created_at", { ascending: false }),
    supabase.from("profile_views").select("*").eq("viewed_id", meId).order("created_at", { ascending: false }),
  ]);

  return {
    activity: (activityRows ?? []).map((row) => ({
      id: row.id as string,
      type: row.type as ActivityItem["type"],
      userId: (row.actor_id as string) || "",
      text: (row.text as string) || "",
      time: timeAgo(row.created_at as string),
      thumb: (row.thumb_url as string) || undefined,
    })),
    likesYou: (likeRows ?? []).map((row) => ({
      id: row.id as string,
      userId: (row.liker_id as string) || "",
      matchup: Number(row.matchup ?? 80),
      time: timeAgo(row.created_at as string),
    })),
    profileViewers: (viewRows ?? []).map((row) => ({
      id: row.id as string,
      userId: (row.viewer_id as string) || "",
      time: timeAgo(row.created_at as string),
    })),
  };
}

export async function fetchWallet(
  meId: string,
): Promise<{ wallet: WalletSummary; transactions: Transaction[] }> {
  const [{ data: walletRow }, { data: txRows }] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", meId).maybeSingle(),
    supabase.from("transactions").select("*").eq("user_id", meId).order("created_at", { ascending: false }),
  ]);

  const wallet: WalletSummary = {
    currency: (walletRow?.currency as string) || "$",
    available: Number(walletRow?.available ?? 0),
    pending: Number(walletRow?.pending ?? 0),
    lifetimeEarnings: Number(walletRow?.lifetime_earnings ?? 0),
  };

  const transactions: Transaction[] = (txRows ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) || "",
    subtitle: (row.subtitle as string) || "",
    amount: Number(row.amount ?? 0),
    status: (row.status as Transaction["status"]) || "Completed",
    date: timeAgo(row.created_at as string),
    icon: (row.icon as string) || "ri-exchange-line",
  }));

  return { wallet, transactions };
}

export async function setLike(meId: string, postId: string, liked: boolean): Promise<void> {
  if (liked) {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: meId });
  } else {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", meId);
  }
}

export async function addComment(postId: string, meId: string, body: string): Promise<PostComment> {
  const { data } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: meId, body })
    .select("id, user_id, body, created_at")
    .single();
  return {
    id: (data?.id as string) || `c-${Date.now()}`,
    postId,
    userId: meId,
    username: "",
    body,
    time: "now",
  };
}

export async function uploadPostImage(meId: string, file: File): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `${meId}/post-${Date.now()}.${safeExt}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });
  if (error) return null;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function createPost(input: {
  meId: string;
  imageUrl: string | null;
  caption: string;
  location: string;
  aspect: "square" | "portrait";
}): Promise<void> {
  await supabase.from("posts").insert({
    user_id: input.meId,
    image_url: input.imageUrl,
    caption: input.caption,
    location: input.location,
    aspect: input.aspect,
  });
}

export async function setAttendance(eventId: string, meId: string, attending: boolean): Promise<void> {
  if (attending) {
    await supabase.from("event_attendees").insert({ event_id: eventId, user_id: meId });
  } else {
    await supabase.from("event_attendees").delete().eq("event_id", eventId).eq("user_id", meId);
  }
}

export async function setFollow(meId: string, targetId: string, following: boolean): Promise<void> {
  if (following) {
    await supabase.from("follows").insert({ follower_id: meId, following_id: targetId });
  } else {
    await supabase.from("follows").delete().eq("follower_id", meId).eq("following_id", targetId);
  }
}

export async function fetchSavedPostIds(meId: string): Promise<string[]> {
  const { data } = await supabase.from("saved_posts").select("post_id").eq("user_id", meId);
  return (data ?? []).map((row) => row.post_id as string);
}

export async function setSavedPost(meId: string, postId: string, saved: boolean): Promise<void> {
  if (saved) {
    await supabase
      .from("saved_posts")
      .upsert({ user_id: meId, post_id: postId }, { onConflict: "user_id,post_id", ignoreDuplicates: true });
  } else {
    await supabase.from("saved_posts").delete().eq("user_id", meId).eq("post_id", postId);
  }
}

export async function fetchLikedProfileIds(meId: string): Promise<string[]> {
  const { data } = await supabase.from("profile_likes").select("liked_id").eq("liker_id", meId);
  return (data ?? []).map((row) => row.liked_id as string);
}

export async function setProfileLike(meId: string, targetId: string, liked: boolean): Promise<void> {
  if (liked) {
    await supabase
      .from("profile_likes")
      .upsert({ liker_id: meId, liked_id: targetId }, { onConflict: "liker_id,liked_id", ignoreDuplicates: true });
  } else {
    await supabase.from("profile_likes").delete().eq("liker_id", meId).eq("liked_id", targetId);
  }
}

export async function recordProfileView(meId: string, targetId: string): Promise<void> {
  if (!meId || !targetId || meId === targetId) return;
  await supabase
    .from("profile_views")
    .upsert(
      { viewer_id: meId, viewed_id: targetId },
      { onConflict: "viewer_id,viewed_id", ignoreDuplicates: true },
    );
}

export async function sendMessage(conversationId: string, meId: string, body: string): Promise<ChatMessage> {
  const { data } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: meId, body })
    .select("id, created_at")
    .single();
  await supabase
    .from("conversations")
    .update({ last_message: body, last_time: new Date().toISOString() })
    .eq("id", conversationId);
  return {
    id: (data?.id as string) || `m-${Date.now()}`,
    senderId: meId,
    text: body,
    time: clockTime(new Date().toISOString()),
  };
}

export async function findOrCreateConversation(meId: string, otherId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(user_a.eq.${meId},user_b.eq.${otherId}),and(user_a.eq.${otherId},user_b.eq.${meId})`,
    )
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created } = await supabase
    .from("conversations")
    .insert({ user_a: meId, user_b: otherId, last_message: "Say hi 👋", last_time: new Date().toISOString() })
    .select("id")
    .single();
  return (created?.id as string) || null;
}

const BOOKING_BASE_COLUMNS =
  "id, venue_id, venue_name, user_id, guest_name, host_id, host_name, check_in, check_out, nights, guests, currency, subtotal, service_fee, driver_addon, driver_fee, total, host_payout, amount, status, payout_status, guest_confirmed_at, host_confirmed_at, checked_in_at, created_at";

// Guests only ever receive their own code; the host's code is never sent to the client.
const GUEST_BOOKING_COLUMNS = `${BOOKING_BASE_COLUMNS}, guest_meet_code`;
const HOST_BOOKING_COLUMNS = `${BOOKING_BASE_COLUMNS}, host_meet_code`;

function mapBooking(row: Record<string, unknown>, myCode?: string): StayBooking {
  return {
    id: row.id as string,
    venueId: (row.venue_id as string) || "",
    venueName: (row.venue_name as string) || "",
    guestId: (row.user_id as string) || "",
    guestName: (row.guest_name as string) || "Guest",
    hostId: (row.host_id as string) ?? null,
    hostName: (row.host_name as string) || "Heramio Partner",
    checkIn: (row.check_in as string) || "",
    checkOut: (row.check_out as string) || "",
    nights: Number(row.nights ?? 1),
    guests: Number(row.guests ?? 1),
    currency: (row.currency as string) || CURRENCY,
    subtotal: Number(row.subtotal ?? 0),
    serviceFee: Number(row.service_fee ?? SERVICE_FEE_KES),
    driverAddon: Boolean(row.driver_addon),
    driverFee: Number(row.driver_fee ?? 0),
    total: Number(row.total ?? 0),
    hostPayout: Number(row.host_payout ?? 0),
    status: (row.status as StayStatus) || "confirmed",
    payoutStatus: row.payout_status === "released" ? "released" : "held",
    meetCode: myCode || (row.guest_meet_code as string) || (row.host_meet_code as string) || "",
    guestConfirmed: Boolean(row.guest_confirmed_at),
    hostConfirmed: Boolean(row.host_confirmed_at),
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}

export async function fetchGuestBookings(meId: string): Promise<StayBooking[]> {
  const { data } = await supabase
    .from("stay_bookings")
    .select(GUEST_BOOKING_COLUMNS)
    .eq("user_id", meId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map((row) =>
    mapBooking(row, (row.guest_meet_code as string) || ""),
  );
}

export async function fetchHostBookings(meId: string): Promise<StayBooking[]> {
  const { data } = await supabase
    .from("stay_bookings")
    .select(HOST_BOOKING_COLUMNS)
    .eq("host_id", meId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map((row) =>
    mapBooking(row, (row.host_meet_code as string) || ""),
  );
}

export interface MeetVerifyResult {
  ok: boolean;
  released?: boolean;
  guestConfirmed?: boolean;
  hostConfirmed?: boolean;
  error?: string;
}

/** Submits the other party's 6-digit code. When both sides have confirmed, the host is paid. */
export async function verifyStayMeet(
  bookingId: string,
  code: string,
): Promise<MeetVerifyResult> {
  const { data, error } = await supabase.functions.invoke("stay-verify", {
    body: { bookingId, code },
  });
  if (error) {
    return { ok: false, error: "We couldn't reach the verification service. Please try again." };
  }
  return (data as MeetVerifyResult) ?? { ok: false, error: "Unexpected response." };
}

export async function createStayBooking(input: {
  meId: string;
  guestName: string;
  venue: Venue;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  driverAddon: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const subtotal = input.nights * input.venue.pricePerNight;
  const driverFee = input.driverAddon ? DRIVER_FEE_KES : 0;
  const total = subtotal + driverFee;
  const hostPayout = Math.max(0, subtotal - SERVICE_FEE_KES);
  const { error } = await supabase.from("stay_bookings").insert({
    venue_id: input.venue.id,
    venue_name: input.venue.name,
    user_id: input.meId,
    guest_name: input.guestName,
    host_id: input.venue.hostId,
    host_name: input.venue.hostName,
    check_in: input.checkIn,
    check_out: input.checkOut,
    nights: input.nights,
    guests: input.guests,
    currency: CURRENCY,
    subtotal,
    service_fee: SERVICE_FEE_KES,
    driver_addon: input.driverAddon,
    driver_fee: driverFee,
    total,
    host_payout: hostPayout,
    amount: total,
    status: "confirmed",
    payout_status: "held",
  });
  if (error) return { ok: false, error: error.message };
  await supabase.from("transactions").insert({
    user_id: input.meId,
    title: "Stay booking",
    subtitle: `${input.venue.name} · ${input.nights} night${input.nights > 1 ? "s" : ""}`,
    amount: -total,
    status: "Held",
    icon: "ri-hotel-line",
  });
  return { ok: true };
}

export async function releaseStayPayout(booking: StayBooking, meId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("stay_bookings")
    .update({ status: "completed", payout_status: "released", checked_in_at: now })
    .eq("id", booking.id)
    .eq("host_id", meId);
  if (error) return false;

  const { data: wallet } = await supabase
    .from("wallets")
    .select("available, lifetime_earnings")
    .eq("user_id", meId)
    .maybeSingle();
  const available = Number(wallet?.available ?? 0) + booking.hostPayout;
  const lifetime = Number(wallet?.lifetime_earnings ?? 0) + booking.hostPayout;
  if (wallet) {
    await supabase
      .from("wallets")
      .update({ available, lifetime_earnings: lifetime, updated_at: now })
      .eq("user_id", meId);
  } else {
    await supabase
      .from("wallets")
      .insert({ user_id: meId, currency: CURRENCY, available, pending: 0, lifetime_earnings: lifetime });
  }
  await supabase.from("transactions").insert({
    user_id: meId,
    title: "Stay earnings released",
    subtitle: `${booking.venueName} · ${booking.nights} night${booking.nights > 1 ? "s" : ""}`,
    amount: booking.hostPayout,
    status: "Completed",
    icon: "ri-arrow-down-line",
  });
  return true;
}

export async function withdrawFunds(meId: string, amount: number, method: string): Promise<number> {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("available")
    .eq("user_id", meId)
    .maybeSingle();
  const available = Number(wallet?.available ?? 0);
  const amt = Math.max(0, Math.min(Math.floor(amount), available));
  if (amt <= 0) return 0;
  await supabase
    .from("wallets")
    .update({ available: available - amt, updated_at: new Date().toISOString() })
    .eq("user_id", meId);
  await supabase.from("transactions").insert({
    user_id: meId,
    title: `Withdrawal to ${method}`,
    subtitle: "Payout · •••• 4471",
    amount: -amt,
    status: "Pending",
    icon: "ri-bank-card-line",
  });
  return amt;
}

export async function createListing(
  meId: string,
  hostName: string,
  input: NewListingInput,
): Promise<boolean> {
  const { error } = await supabase.from("venues").insert({
    name: input.name,
    type: input.type,
    city: input.city,
    estate: input.estate,
    country: input.country,
    price_per_night: input.pricePerNight,
    max_guests: input.maxGuests,
    description: input.description,
    amenities: input.amenities,
    image_url: input.imageUrl,
    second_image_url: input.imageUrl,
    rating: 5,
    reviews: 0,
    meetup_ready: false,
    host_id: meId,
    host_name: hostName,
    lat: 0,
    lng: 0,
    food_available: false,
  });
  return !error;
}

export async function setUserRole(meId: string, role: "dater" | "host"): Promise<boolean> {
  const { error } = await supabase.from("profiles").update({ role }).eq("user_id", meId);
  return !error;
}

export async function updatePayoutDetails(
  meId: string,
  method: string,
  number: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ payout_method: method, payout_number: number })
    .eq("user_id", meId);
  return !error;
}

export async function updateProfileFields(
  meId: string,
  patch: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("user_id", meId);
  return !error;
}

export async function uploadAvatar(meId: string, file: File): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `${meId}/avatar-${Date.now()}.${safeExt}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (error) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveUserPreferences(
  meId: string,
  prefs: UserPreferences,
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({
      notify_likes: prefs.notifyLikes,
      notify_messages: prefs.notifyMessages,
      notify_follows: prefs.notifyFollows,
      notify_marketing: prefs.notifyMarketing,
      privacy_show_online: prefs.privacyShowOnline,
      privacy_allow_messages: prefs.privacyAllowMessages,
      privacy_discoverable: prefs.privacyDiscoverable,
      pref_language: prefs.language,
      pref_currency: prefs.currency,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", meId);
  return !error;
}

export async function cancelStayBooking(bookingId: string, meId: string): Promise<boolean> {
  const { error } = await supabase
    .from("stay_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("user_id", meId);
  return !error;
}