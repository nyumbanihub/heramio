import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  addComment as addCommentApi,
  cancelStayBooking,
  createListing as createListingApi,
  createPost as createPostApi,
  createStayBooking,
  ensureUserReady,
  fetchComments,
  fetchConversations,
  fetchDirectory,
  fetchEvents,
  fetchFollowing,
  fetchGuestBookings,
  fetchHostBookings,
  fetchHostListings,
  fetchLikedProfileIds,
  fetchMessages,
  fetchPosts,
  fetchSavedPostIds,
  fetchSocial,
  fetchVenues,
  fetchWallet,
  findOrCreateConversation,
  recordProfileView,
  releaseStayPayout,
  sendMessage as sendMessageApi,
  setAttendance,
  setFollow,
  setLike,
  setProfileLike,
  setSavedPost,
  setUserRole,
  updatePayoutDetails,
  updateProfileFields,
  saveUserPreferences,
  uploadAvatar,
  uploadPostImage,
  verifyStayMeet,
  withdrawFunds,
} from "@/lib/dataApi";
import type {
  AccountRole,
  ActivityItem,
  AppEvent,
  AppUser,
  ChatMessage,
  Conversation,
  FeedPost,
  LikeItem,
  NearbyPerson,
  NewListingInput,
  PostComment,
  StayBooking,
  Transaction,
  UserPreferences,
  Venue,
  ViewerItem,
  WalletSummary,
} from "@/lib/types";

interface AppDataValue {
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  meId: string;
  me: AppUser | null;
  members: AppUser[];
  getUser: (id: string) => AppUser | undefined;
  nearby: NearbyPerson[];
  following: string[];
  isFollowing: (id: string) => boolean;
  toggleFollow: (id: string) => Promise<void>;
  posts: FeedPost[];
  likedIds: string[];
  commentsFor: (postId: string) => PostComment[];
  toggleLike: (postId: string) => Promise<void>;
  isSaved: (postId: string) => boolean;
  toggleSave: (postId: string) => Promise<void>;
  savedPostIds: string[];
  isProfileLiked: (id: string) => boolean;
  toggleProfileLike: (id: string) => Promise<void>;
  viewProfile: (id: string) => void;
  addComment: (postId: string, body: string) => Promise<void>;
  createPost: (input: {
    file: File | null;
    caption: string;
    location: string;
    aspect: "square" | "portrait";
  }) => Promise<boolean>;
  myPostImages: string[];
  events: AppEvent[];
  attending: string[];
  toggleAttend: (eventId: string) => Promise<void>;
  venues: Venue[];
  getVenue: (id: string) => Venue | undefined;
  getEvent: (id: string) => AppEvent | undefined;
  conversations: Conversation[];
  getConversation: (id: string) => Conversation | undefined;
  messagesFor: (conversationId: string) => ChatMessage[];
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  startConversation: (userId: string) => Promise<string | null>;
  activityItems: ActivityItem[];
  likesYou: LikeItem[];
  profileViewers: ViewerItem[];
  wallet: WalletSummary;
  transactions: Transaction[];
  role: AccountRole;
  setRole: (role: AccountRole) => Promise<void>;
  myBookings: StayBooking[];
  hostListings: Venue[];
  hostBookings: StayBooking[];
  createBooking: (input: {
    venue: Venue;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    driverAddon: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  releasePayout: (booking: StayBooking) => Promise<boolean>;
  verifyMeet: (booking: StayBooking, code: string) => Promise<{ ok: boolean; released?: boolean; error?: string }>;
  withdraw: (amount: number, method: string) => Promise<number>;
  addListing: (input: NewListingInput) => Promise<boolean>;
  savePayoutDetails: (method: string, number: string) => Promise<boolean>;
  updateAccount: (patch: {
    displayName?: string;
    bio?: string;
    estate?: string;
    county?: string;
    country?: string;
  }) => Promise<boolean>;
  changeAvatar: (file: File) => Promise<boolean>;
  savePreferences: (prefs: UserPreferences) => Promise<boolean>;
  cancelBooking: (booking: StayBooking) => Promise<boolean>;
}

const EMPTY_WALLET: WalletSummary = { currency: "KES", available: 0, pending: 0, lifetimeEarnings: 0 };

const AppDataContext = createContext<AppDataValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const email = user?.email ?? undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [likedProfileIds, setLikedProfileIds] = useState<string[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [attending, setAttending] = useState<string[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, ChatMessage[]>>({});
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [likesYou, setLikesYou] = useState<LikeItem[]>([]);
  const [profileViewers, setProfileViewers] = useState<ViewerItem[]>([]);
  const [wallet, setWallet] = useState<WalletSummary>(EMPTY_WALLET);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myBookings, setMyBookings] = useState<StayBooking[]>([]);
  const [hostListings, setHostListings] = useState<Venue[]>([]);
  const [hostBookings, setHostBookings] = useState<StayBooking[]>([]);

  const load = useCallback(async () => {
    if (!meId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await ensureUserReady(
        meId,
        email,
        typeof user?.user_metadata?.role === "string" ? (user.user_metadata.role as string) : undefined,
      );

      const [
        directory,
        followingIds,
        savedPostIds,
        likedProfileIds,
        postData,
        commentData,
        eventData,
        venueData,
        social,
        walletData,
        convos,
        guestBookings,
        hostBookingsData,
        hostListingsData,
      ] = await Promise.all([
        fetchDirectory(),
        fetchFollowing(meId),
        fetchSavedPostIds(meId),
        fetchLikedProfileIds(meId),
        fetchPosts(meId),
        fetchComments(),
        fetchEvents(meId),
        fetchVenues(),
        fetchSocial(meId),
        fetchWallet(meId),
        fetchConversations(meId),
        fetchGuestBookings(meId),
        fetchHostBookings(meId),
        fetchHostListings(meId),
      ]);

      setUsers(directory);
      setFollowing(followingIds);
      setSavedIds(savedPostIds);
      setLikedProfileIds(likedProfileIds);
      setPosts(postData.posts);
      setLikedIds(postData.likedIds);
      setComments(commentData);
      setEvents(eventData.events);
      setAttending(eventData.attending);
      setVenues(venueData);
      setActivityItems(social.activity);
      setLikesYou(social.likesYou);
      setProfileViewers(social.profileViewers);
      setWallet(walletData.wallet);
      setTransactions(walletData.transactions);
      setMyBookings(guestBookings);
      setHostBookings(hostBookingsData);
      setHostListings(hostListingsData);

      const onlineMap = new Map(directory.map((u) => [u.id, u.online]));
      setConversations(convos.map((c) => ({ ...c, online: onlineMap.get(c.userId) ?? false })));

      const messageMap = await fetchMessages(convos.map((c) => c.id));
      setMessagesByConv(messageMap);
    } catch {
      setError("We couldn't load your data right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [meId, email]);

  useEffect(() => {
    load();
  }, [load]);
  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);
  const me = useMemo(() => users.find((u) => u.id === meId) ?? null, [users, meId]);
  const role: AccountRole = me?.role ?? "dater";
  const members = useMemo(() => users.filter((u) => u.id !== meId), [users, meId]);

  const nearby = useMemo<NearbyPerson[]>(
    () =>
      members.map((m) => ({
        id: `n_${m.id}`,
        userId: m.id,
        estate: m.estate,
        city: m.city,
        country: m.country,
        distanceKm: m.distanceKm,
        online: m.online,
        lastSeen: m.online ? "Online now" : "Active recently",
        intent: m.interests.slice(0, 2).join(" · ") || "Open to meet",
      })),
    [members],
  );

  const commentsByPost = useMemo(() => {
    const grouped: Record<string, PostComment[]> = {};
    comments.forEach((c) => {
      if (!grouped[c.postId]) grouped[c.postId] = [];
      grouped[c.postId].push(c);
    });
    return grouped;
  }, [comments]);

  const myPostImages = useMemo(
    () => posts.filter((p) => p.authorId === meId).map((p) => p.image),
    [posts, meId],
  );

  const isFollowing = useCallback((id: string) => following.includes(id), [following]);

  const toggleFollow = useCallback(
    async (id: string) => {
      if (!meId || id === meId) return;
      const next = !following.includes(id);
      setFollowing((prev) => (next ? [...prev, id] : prev.filter((f) => f !== id)));
      try {
        await setFollow(meId, id, next);
      } catch {
        setFollowing((prev) => (next ? prev.filter((f) => f !== id) : [...prev, id]));
      }
    },
    [meId, following],
  );

  const commentsFor = useCallback((postId: string) => commentsByPost[postId] ?? [], [commentsByPost]);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!meId) return;
      const liked = likedIds.includes(postId);
      setLikedIds((prev) => (liked ? prev.filter((p) => p !== postId) : [...prev, postId]));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, liked: !liked, likes: p.likes + (liked ? -1 : 1) } : p,
        ),
      );
      try {
        await setLike(meId, postId, !liked);
      } catch {
        setLikedIds((prev) => (liked ? [...prev, postId] : prev.filter((p) => p !== postId)));
      }
    },
    [meId, likedIds],
  );

  const isSaved = useCallback((postId: string) => savedIds.includes(postId), [savedIds]);

  const toggleSave = useCallback(
    async (postId: string) => {
      if (!meId) return;
      const next = !savedIds.includes(postId);
      setSavedIds((prev) => (next ? [...prev, postId] : prev.filter((p) => p !== postId)));
      try {
        await setSavedPost(meId, postId, next);
      } catch {
        setSavedIds((prev) => (next ? prev.filter((p) => p !== postId) : [...prev, postId]));
      }
    },
    [meId, savedIds],
  );

  const isProfileLiked = useCallback(
    (id: string) => likedProfileIds.includes(id),
    [likedProfileIds],
  );

  const toggleProfileLike = useCallback(
    async (id: string) => {
      if (!meId || id === meId) return;
      const next = !likedProfileIds.includes(id);
      setLikedProfileIds((prev) => (next ? [...prev, id] : prev.filter((p) => p !== id)));
      try {
        await setProfileLike(meId, id, next);
      } catch {
        setLikedProfileIds((prev) => (next ? prev.filter((p) => p !== id) : [...prev, id]));
      }
    },
    [meId, likedProfileIds],
  );

  const viewProfile = useCallback(
    (id: string) => {
      if (!meId) return;
      recordProfileView(meId, id).catch(() => undefined);
    },
    [meId],
  );

  const addComment = useCallback(
    async (postId: string, body: string) => {
      if (!meId || !body.trim()) return;
      const created = await addCommentApi(postId, meId, body.trim());
      setComments((prev) => [...prev, created]);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
    },
    [meId],
  );

  const createPost = useCallback(
    async (input: {
      file: File | null;
      caption: string;
      location: string;
      aspect: "square" | "portrait";
    }) => {
      if (!meId) return false;
      let imageUrl: string | null = null;
      if (input.file) {
        imageUrl = await uploadPostImage(meId, input.file);
        if (!imageUrl) return false;
      }
      await createPostApi({
        meId,
        imageUrl,
        caption: input.caption,
        location: input.location,
        aspect: input.aspect,
      });
      const postData = await fetchPosts(meId);
      setPosts(postData.posts);
      setLikedIds(postData.likedIds);
      return true;
    },
    [meId],
  );

  const toggleAttend = useCallback(
    async (eventId: string) => {
      if (!meId) return;
      const next = !attending.includes(eventId);
      setAttending((prev) => (next ? [...prev, eventId] : prev.filter((e) => e !== eventId)));
      try {
        await setAttendance(eventId, meId, next);
      } catch {
        setAttending((prev) => (next ? prev.filter((e) => e !== eventId) : [...prev, eventId]));
      }
    },
    [meId, attending],
  );

  const getVenue = useCallback((id: string) => venues.find((v) => v.id === id), [venues]);
  const getEvent = useCallback((id: string) => events.find((e) => e.id === id), [events]);
  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );
  const messagesFor = useCallback(
    (conversationId: string) => messagesByConv[conversationId] ?? [],
    [messagesByConv],
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      if (!meId || !text.trim()) return;
      const created = await sendMessageApi(conversationId, meId, text.trim());
      setMessagesByConv((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), created],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, lastMessage: text.trim(), time: "now" } : c,
        ),
      );
    },
    [meId],
  );

  const startConversation = useCallback(
    async (userId: string) => {
      if (!meId) return null;
      const existing = conversations.find((c) => c.userId === userId);
      if (existing) return existing.id;
      const id = await findOrCreateConversation(meId, userId);
      if (id) {
        const convos = await fetchConversations(meId);
        const onlineMap = new Map(users.map((u) => [u.id, u.online]));
        setConversations(convos.map((c) => ({ ...c, online: onlineMap.get(c.userId) ?? false })));
        const messageMap = await fetchMessages([id]);
        setMessagesByConv((prev) => ({ ...prev, ...messageMap }));
      }
      return id;
    },
    [meId, conversations, users],
  );

  const setRole = useCallback(
    async (next: AccountRole) => {
      if (!meId) return;
      setUsers((prev) => prev.map((u) => (u.id === meId ? { ...u, role: next } : u)));
      await setUserRole(meId, next);
    },
    [meId],
  );

  const createBooking = useCallback(
    async (input: {
      venue: Venue;
      checkIn: string;
      checkOut: string;
      guests: number;
      nights: number;
      driverAddon: boolean;
    }) => {
      if (!meId) return { ok: false, error: "You're not signed in." };
      const result = await createStayBooking({ meId, guestName: me?.name ?? "Guest", ...input });
      if (result.ok) {
        const [bookings, walletData] = await Promise.all([fetchGuestBookings(meId), fetchWallet(meId)]);
        setMyBookings(bookings);
        setWallet(walletData.wallet);
        setTransactions(walletData.transactions);
      }
      return result;
    },
    [meId, me],
  );

  const releasePayout = useCallback(
    async (booking: StayBooking) => {
      if (!meId) return false;
      const ok = await releaseStayPayout(booking, meId);
      if (ok) {
        const [host, walletData] = await Promise.all([fetchHostBookings(meId), fetchWallet(meId)]);
        setHostBookings(host);
        setWallet(walletData.wallet);
        setTransactions(walletData.transactions);
      }
      return ok;
    },
    [meId],
  );

  const verifyMeet = useCallback(
    async (booking: StayBooking, code: string) => {
      if (!meId) return { ok: false, error: "You're not signed in." };
      const result = await verifyStayMeet(booking.id, code);
      if (result.ok) {
        const [guest, host, walletData] = await Promise.all([
          fetchGuestBookings(meId),
          fetchHostBookings(meId),
          fetchWallet(meId),
        ]);
        setMyBookings(guest);
        setHostBookings(host);
        setWallet(walletData.wallet);
        setTransactions(walletData.transactions);
      }
      return result;
    },
    [meId],
  );

  const withdraw = useCallback(
    async (amount: number, method: string) => {
      if (!meId) return 0;
      const amt = await withdrawFunds(meId, amount, method);
      if (amt > 0) {
        const walletData = await fetchWallet(meId);
        setWallet(walletData.wallet);
        setTransactions(walletData.transactions);
      }
      return amt;
    },
    [meId],
  );

  const addListing = useCallback(
    async (input: NewListingInput) => {
      if (!meId) return false;
      const ok = await createListingApi(meId, me?.name ?? "Host", input);
      if (ok) {
        const [venuesData, listings] = await Promise.all([fetchVenues(), fetchHostListings(meId)]);
        setVenues(venuesData);
        setHostListings(listings);
      }
      return ok;
    },
    [meId, me],
  );

  const savePayoutDetails = useCallback(
    async (method: string, number: string) => {
      if (!meId) return false;
      return updatePayoutDetails(meId, method, number);
    },
    [meId],
  );

  const updateAccount = useCallback(
    async (patch: {
      displayName?: string;
      bio?: string;
      estate?: string;
      county?: string;
      country?: string;
    }) => {
      if (!meId) return false;
      const ok = await updateProfileFields(meId, {
        ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
        ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
        ...(patch.estate !== undefined ? { estate: patch.estate } : {}),
        ...(patch.county !== undefined ? { county: patch.county } : {}),
        ...(patch.country !== undefined ? { country: patch.country } : {}),
      });
      if (ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === meId
              ? {
                  ...u,
                  ...(patch.displayName !== undefined ? { name: patch.displayName } : {}),
                  ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
                  ...(patch.estate !== undefined ? { estate: patch.estate } : {}),
                  ...(patch.county !== undefined ? { county: patch.county, city: patch.county } : {}),
                  ...(patch.country !== undefined ? { country: patch.country } : {}),
                }
              : u,
          ),
        );
      }
      return ok;
    },
    [meId],
  );

  const changeAvatar = useCallback(
    async (file: File) => {
      if (!meId) return false;
      const url = await uploadAvatar(meId, file);
      if (!url) return false;
      const ok = await updateProfileFields(meId, { avatar_url: url });
      if (ok) {
        setUsers((prev) => prev.map((u) => (u.id === meId ? { ...u, avatar: url } : u)));
      }
      return ok;
    },
    [meId],
  );

  const savePreferences = useCallback(
    async (prefs: UserPreferences) => {
      if (!meId) return false;
      const ok = await saveUserPreferences(meId, prefs);
      if (ok) {
        setUsers((prev) => prev.map((u) => (u.id === meId ? { ...u, prefs } : u)));
      }
      return ok;
    },
    [meId],
  );

  const cancelBooking = useCallback(
    async (booking: StayBooking) => {
      if (!meId) return false;
      const ok = await cancelStayBooking(booking.id, meId);
      if (ok) {
        const bookings = await fetchGuestBookings(meId);
        setMyBookings(bookings);
      }
      return ok;
    },
    [meId],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      loading,
      error,
      refresh: load,
      meId,
      me,
      members,
      getUser,
      nearby,
      following,
      isFollowing,
      toggleFollow,
      posts,
      likedIds,
      commentsFor,
      toggleLike,
      isSaved,
      toggleSave,
      savedPostIds: savedIds,
      isProfileLiked,
      toggleProfileLike,
      viewProfile,
      addComment,
      createPost,
      myPostImages,
      events,
      attending,
      toggleAttend,
      venues,
      getVenue,
      getEvent,
      conversations,
      getConversation,
      messagesFor,
      sendMessage,
      startConversation,
      activityItems,
      likesYou,
      profileViewers,
      wallet,
      transactions,
      role,
      setRole,
      myBookings,
      hostListings,
      hostBookings,
      createBooking,
      releasePayout,
      verifyMeet,
      withdraw,
      addListing,
      savePayoutDetails,
      updateAccount,
      changeAvatar,
      savePreferences,
      cancelBooking,
    }),
    [
      loading,
      error,
      load,
      meId,
      me,
      members,
      getUser,
      nearby,
      following,
      isFollowing,
      toggleFollow,
      posts,
      likedIds,
      commentsFor,
      toggleLike,
      isSaved,
      toggleSave,
      savedIds,
      isProfileLiked,
      toggleProfileLike,
      viewProfile,
      addComment,
      createPost,
      myPostImages,
      events,
      attending,
      toggleAttend,
      venues,
      getVenue,
      getEvent,
      conversations,
      getConversation,
      messagesFor,
      sendMessage,
      startConversation,
      activityItems,
      likesYou,
      profileViewers,
      wallet,
      transactions,
      role,
      setRole,
      myBookings,
      hostListings,
      hostBookings,
      createBooking,
      releasePayout,
      verifyMeet,
      withdraw,
      addListing,
      savePayoutDetails,
      updateAccount,
      changeAvatar,
      savePreferences,
      cancelBooking,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}