import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, gameSessions, InsertGameSession, GameSession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Game Session Helpers ──────────────────────────────────────────────────────

export async function insertGameSession(session: InsertGameSession): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(gameSessions).values(session);
  return (result[0] as any).insertId as number;
}

export async function getAllGameSessions(): Promise<GameSession[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gameSessions).orderBy(desc(gameSessions.completedAt));
}

export async function getGameAnalytics() {
  const db = await getDb();
  if (!db) return null;

  const sessions = await db.select().from(gameSessions).orderBy(desc(gameSessions.completedAt));
  const total = sessions.length;
  if (total === 0) return { total: 0, avgInvestor: 0, avgEsg: 0, completionRate: 0, gameOverRate: 0, recentSessions: [] };

  const completed = sessions.filter(s => !s.gameOver);
  const avgInvestor = Math.round(sessions.reduce((a, s) => a + s.investorScore, 0) / total);
  const avgEsg = Math.round(sessions.reduce((a, s) => a + s.esgScore, 0) / total);
  const completionRate = Math.round((completed.length / total) * 100);
  const gameOverRate = Math.round(((total - completed.length) / total) * 100);

  return { total, avgInvestor, avgEsg, completionRate, gameOverRate, recentSessions: sessions.slice(0, 5) };
}
