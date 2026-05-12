/**
 * Shared application-wide TypeScript types.
 * Import from here rather than defining types in individual components.
 */

/** A single clothing item stored in Firestore under users/{uid}/closet/{id}. */
export interface ClosetItem {
  id: string;
  imageUrl: string;
  storagePath?: string;
  category: string;
  colorPalette: string[];
  formalityScore: number;
  season: string;
  vibe: string;
  isDirty: boolean;
  isFavorite: boolean;
  createdAt: unknown; // Firestore Timestamp | ISO string | epoch ms
}

/** A saved outfit stored in Firestore under users/{uid}/outfits/{id}. */
export interface Outfit {
  id: string;
  ownerId: string;
  topId: string;
  bottomId: string;
  footwearId: string;
  stylistNote: string;
  scene: string;
  createdAt: unknown; // Firestore Timestamp | ISO string | epoch ms
}
