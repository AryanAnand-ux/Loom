import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { setDebug } from "../lib/debugStore";
import { auth } from "../lib/firebase";
import { ClosetItem } from "../types";
import { handleFirestoreError, OperationType } from "../lib/errorUtils";
import { getTimestampValue } from "../lib/timestampUtils";

export function useCloset(userId: string) {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const path = `users/${userId}/closet`;
    const q = query(collection(db, path));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ClosetItem))
        .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt));
      
      setDebug({ uid: auth.currentUser?.uid ?? null, closetCount: docs.length, closetMode: 'snapshot' });
      setItems(docs);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("useCloset onSnapshot error:", err.message);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch {
        // swallow rethrow
      }
      setError(err?.message || String(err));
      setLoading(false);
    });

    return () => {
      try { unsubscribe(); } catch { /* already unsubscribed */ }
    };
  }, [userId]);

  return { items, loading, error };
}
