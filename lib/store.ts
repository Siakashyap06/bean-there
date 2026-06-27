"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TasteProfile, Cafe, PassportStamp, CoffeeMemory, FavoriteCollection } from "./types";

interface BeanThereStore {
  hasCompletedOnboarding: boolean;
  tasteProfile: TasteProfile | null;
  stamps: PassportStamp[];
  memories: CoffeeMemory[];
  collections: FavoriteCollection[];
  userLocation: { lat: number; lng: number } | null;
  nearbyPlaces: Cafe[];
  wantToTryIds: string[];
  cardProfile: { name: string; favSpotCafeName: string; favSpotCafeId: string; quote: string } | null;

  setOnboardingComplete: (val: boolean) => void;
  setTasteProfile: (profile: TasteProfile) => void;
  setCardProfile: (p: { name: string; favSpotCafeName: string; favSpotCafeId: string; quote: string }) => void;
  addStamp: (stamp: PassportStamp) => void;
  removeStamp: (id: string) => void;
  addMemory: (memory: CoffeeMemory) => void;
  removeMemory: (id: string) => void;
  addToCollection: (collectionId: string, cafeId: string) => void;
  removeFromCollection: (collectionId: string, cafeId: string) => void;
  createCollection: (collection: FavoriteCollection) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  setNearbyPlaces: (places: Cafe[]) => void;
  toggleWantToTry: (cafeId: string) => void;
  reset: () => void;
}

const DEFAULT_COLLECTIONS: FavoriteCollection[] = [
  { id: "want-to-try", name: "Want to Try", emoji: "🔖", cafeIds: [] },
  { id: "favorites", name: "Favourites", emoji: "♥", cafeIds: [] },
  { id: "hidden-gems", name: "Hidden Gems", emoji: "💎", cafeIds: [] },
  { id: "weekend-spots", name: "Weekend Spots", emoji: "☀️", cafeIds: [] },
  { id: "work-cafes", name: "Work Cafés", emoji: "💻", cafeIds: [] },
];

export const useBeanStore = create<BeanThereStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      tasteProfile: null,
      stamps: [],
      memories: [],
      collections: DEFAULT_COLLECTIONS,
      userLocation: null,
      nearbyPlaces: [],
      wantToTryIds: [],
      cardProfile: null,

      setOnboardingComplete: (val) => set({ hasCompletedOnboarding: val }),
      setTasteProfile: (profile) => set({ tasteProfile: profile }),
      setCardProfile: (p) => set({ cardProfile: p as { name: string; favSpotCafeName: string; favSpotCafeId: string; quote: string } }),
      addStamp: (stamp) =>
        set((s) => ({ stamps: [...s.stamps.filter((x) => x.cafeId !== stamp.cafeId), stamp] })),
      removeStamp: (id) => set((s) => ({ stamps: s.stamps.filter((x) => x.id !== id) })),
      addMemory: (memory) => set((s) => ({ memories: [memory, ...s.memories] })),
      removeMemory: (id) => set((s) => ({ memories: s.memories.filter((x) => x.id !== id) })),
      addToCollection: (collectionId, cafeId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId && !c.cafeIds.includes(cafeId)
              ? { ...c, cafeIds: [...c.cafeIds, cafeId] }
              : c
          ),
        })),
      removeFromCollection: (collectionId, cafeId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId ? { ...c, cafeIds: c.cafeIds.filter((id) => id !== cafeId) } : c
          ),
        })),
      createCollection: (collection) =>
        set((s) => ({ collections: [...s.collections, collection] })),
      setUserLocation: (loc) => set({ userLocation: loc }),
      setNearbyPlaces: (places) => set({ nearbyPlaces: places }),
      toggleWantToTry: (cafeId) =>
        set((s) => ({
          wantToTryIds: s.wantToTryIds.includes(cafeId)
            ? s.wantToTryIds.filter((id) => id !== cafeId)
            : [...s.wantToTryIds, cafeId],
        })),
      reset: () =>
        set({
          hasCompletedOnboarding: false,
          tasteProfile: null,
          stamps: [],
          memories: [],
          collections: DEFAULT_COLLECTIONS,
          userLocation: null,
          nearbyPlaces: [],
          wantToTryIds: [],
          cardProfile: null,
        }),
    }),
    { name: "bean-there-store-v3" }
  )
);
