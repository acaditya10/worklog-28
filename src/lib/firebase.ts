import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";
import type { Entry, Summary, ParsedEntry } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- Entries ---

export async function saveEntries(
  rawInput: string,
  parsed: ParsedEntry[],
): Promise<void> {
  const now = Timestamp.now();
  const batch = parsed.map((entry) =>
    addDoc(collection(db, "entries"), {
      rawInput,
      task: entry.task,
      description: entry.description,
      category: entry.category,
      duration: entry.duration,
      createdAt: now,
      updatedAt: now,
    }),
  );
  await Promise.all(batch);
}

export async function getEntries(
  startDate?: Date,
  endDate?: Date,
): Promise<Entry[]> {
  let q;
  if (startDate && endDate) {
    q = query(
      collection(db, "entries"),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      orderBy("createdAt", "desc"),
    );
  } else {
    q = query(
      collection(db, "entries"),
      orderBy("createdAt", "desc"),
      limit(200),
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      rawInput: data.rawInput,
      task: data.task,
      description: data.description,
      category: data.category,
      duration: data.duration,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Entry;
  });
}

export async function getTodayEntries(): Promise<Entry[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return getEntries(start, end);
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<Entry, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, "entries", id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, "entries", id));
}

// --- Summaries ---

export async function getSummary(
  type: Summary["type"],
): Promise<Summary | null> {
  const id = getSummaryId(type);
  const snap = await getDoc(doc(db, "summaries", id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    type: data.type,
    rangeStart: data.rangeStart.toDate(),
    rangeEnd: data.rangeEnd.toDate(),
    content: data.content,
    generatedAt: data.generatedAt.toDate(),
  } as Summary;
}

export async function saveSummary(
  type: Summary["type"],
  content: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<void> {
  const id = getSummaryId(type);
  await setDoc(doc(db, "summaries", id), {
    type,
    content,
    rangeStart: Timestamp.fromDate(rangeStart),
    rangeEnd: Timestamp.fromDate(rangeEnd),
    generatedAt: Timestamp.now(),
  });
}

export function getSummaryId(type: Summary["type"], customDate?: Date): string {
  const now = customDate || new Date();
  switch (type) {
    case "day":
      return `day_${now.toISOString().split("T")[0]}`;
    case "week": {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return `week_${d.toISOString().split("T")[0]}`;
    }
    case "month":
      return `month_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    case "all":
      return "all";
  }
}