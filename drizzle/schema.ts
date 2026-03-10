import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, float } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  playerName: varchar("playerName", { length: 255 }).notNull(),
  playerEmail: varchar("playerEmail", { length: 320 }).notNull(),
  investorScore: int("investorScore").notNull().default(0),
  esgScore: int("esgScore").notNull().default(0),
  finalOutcome: varchar("finalOutcome", { length: 64 }).notNull().default(""),
  archetypeLabel: varchar("archetypeLabel", { length: 128 }).notNull().default(""),
  decisions: json("decisions").notNull().$type<DecisionRecord[]>().default([]),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  durationSeconds: int("durationSeconds").default(0),
  gameOver: int("gameOver").notNull().default(0),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

export type DecisionRecord = {
  chapter: string;
  chapterTitle: string;
  choiceLabel: string;
  choiceDesc: string;
  investorDelta: number;
  esgDelta: number;
};
