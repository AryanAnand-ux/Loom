import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/errorUtils";
import { setDebug } from "../lib/debugStore";
import { auth } from "../lib/firebase";
import { Outfit } from "../types";
import { getTimestampValue } from "../lib/timestampUtils";

export function useOutfits(userId: string, maxResults?: number) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const path = `users/${userId}/outfits`;
    const q = query(collection(db, path));

    const applyLimit = (docs: Outfit[]) =>
      typeof maxResults === "number" ? docs.slice(0, maxResults) : docs;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Outfit))
        .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt));
      setOutfits(applyLimit(docs));
      setDebug({ uid: auth.currentUser?.uid ?? null, outfitsCount: docs.length, outfitsMode: 'snapshot' });
      setLoading(false);
    }, (err) => {
      console.error("useOutfits onSnapshot error:", err.message);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch { /* swallow rethrow */ }
      setLoading(false);
    });

    return () => {
      try { unsubscribe(); } catch { /* already unsubscribed */ }
    };
  }, [userId, maxResults]);

  return { outfits, loading };
}
