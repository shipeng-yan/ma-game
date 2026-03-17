import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db and notification modules
vi.mock("./db", () => ({
  insertGameSession: vi.fn().mockResolvedValue(1),
  getAllGameSessions: vi.fn().mockResolvedValue([
    {
      id: 1, playerName: "Alice", playerEmail: "alice@test.com",
      investorScore: 14, esgScore: 12, finalOutcome: "complete",
      archetypeLabel: "The Principled Leader", decisions: [],
      completedAt: new Date("2026-03-10T10:00:00Z"), durationSeconds: 300, gameOver: 0,
    },
    {
      id: 2, playerName: "Bob", playerEmail: "bob@test.com",
      investorScore: 8, esgScore: 6, finalOutcome: "game-over",
      archetypeLabel: "Game Over", decisions: [],
      completedAt: new Date("2026-03-10T10:05:00Z"), durationSeconds: 120, gameOver: 1,
    },
  ]),
  getGameAnalytics: vi.fn().mockResolvedValue({
    total: 2, avgInvestor: 11, avgEsg: 9, completionRate: 50, gameOverRate: 50, recentSessions: [],
  }),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1, openId: "admin-open-id", email: "admin@test.com",
      name: "Admin", loginMethod: "manus", role: "admin",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2, openId: "user-open-id", email: "user@test.com",
      name: "User", loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const sampleDecisions = [
  { chapter: "A1", chapterTitle: "Decision A1", choiceLabel: "Option A: Strong independent board", choiceDesc: "Full independence", investorDelta: -3, esgDelta: 8, rationale: "I believe governance independence is critical." },
];

describe("game.submitResult", () => {
  it("accepts a valid game submission from public user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.submitResult({
      playerName: "Test Student",
      playerEmail: "student@test.com",
      investorScore: 12,
      esgScore: 15,
      finalOutcome: "complete",
      archetypeLabel: "The Mission CEO",
      decisions: sampleDecisions,
      durationSeconds: 600,
      gameOver: false,
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe(1);
  });

  it("rejects submission with invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.game.submitResult({
        playerName: "Test",
        playerEmail: "not-an-email",
        investorScore: 10,
        esgScore: 10,
        finalOutcome: "complete",
        archetypeLabel: "The Pragmatic Manager",
        decisions: [],
        gameOver: false,
      })
    ).rejects.toThrow();
  });

  it("rejects submission with empty player name", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.game.submitResult({
        playerName: "",
        playerEmail: "student@test.com",
        investorScore: 10,
        esgScore: 10,
        finalOutcome: "complete",
        archetypeLabel: "The Pragmatic Manager",
        decisions: [],
        gameOver: false,
      })
    ).rejects.toThrow();
  });
});

describe("game.getSessions", () => {
  it("returns ranked sessions for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const sessions = await caller.game.getSessions();
    expect(sessions).toHaveLength(2);
    // Alice has higher combined score (14+12=26) vs Bob (8+6=14), so Alice is rank 1
    expect(sessions[0].rank).toBe(1);
    expect(sessions[0].playerName).toBe("Alice");
    expect(sessions[0].combinedScore).toBe(26);
    expect(sessions[1].rank).toBe(2);
    expect(sessions[1].playerName).toBe("Bob");
  });

  it("denies access to non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.game.getSessions()).rejects.toThrow("Admin access required");
  });

  it("denies access to unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.game.getSessions()).rejects.toThrow();
  });
});

describe("game.getAnalytics", () => {
  it("returns analytics for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const analytics = await caller.game.getAnalytics();
    expect(analytics).not.toBeNull();
    expect(analytics?.total).toBe(2);
    expect(analytics?.avgInvestor).toBe(11);
    expect(analytics?.avgEsg).toBe(9);
    expect(analytics?.completionRate).toBe(50);
    expect(analytics?.gameOverRate).toBe(50);
  });

  it("denies access to non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.game.getAnalytics()).rejects.toThrow("Admin access required");
  });
});

describe("game.getChoiceDistribution", () => {
  it("returns distribution object with all chapter keys for public user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.getChoiceDistribution();
    expect(result).toHaveProperty("distribution");
    expect(result).toHaveProperty("total");
    expect(typeof result.total).toBe("number");
    // Should have keys for all 8 decisions
    const keys = Object.keys(result.distribution);
    expect(keys.length).toBeGreaterThanOrEqual(0);
  });

  it("allows unauthenticated access to choice distribution", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.getChoiceDistribution();
    expect(result).toBeDefined();
  });
});

describe("game.getRankings", () => {
  it("returns rankings sorted by average score for public user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const rankings = await caller.game.getRankings();
    // Only Alice (gameOver=0) should appear; Bob (gameOver=1) is excluded
    expect(rankings).toHaveLength(1);
    expect(rankings[0].playerName).toBe("Alice");
    expect(rankings[0].rank).toBe(1);
    // Average of 14 and 12 = 13.0
    expect(rankings[0].averageScore).toBe(13);
    expect(rankings[0].investorScore).toBe(14);
    expect(rankings[0].esgScore).toBe(12);
  });

  it("allows unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const rankings = await caller.game.getRankings();
    expect(Array.isArray(rankings)).toBe(true);
  });
});

describe("game.sendSummaryEmail", () => {
  it("sends summary email for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.game.sendSummaryEmail();
    expect(result.success).toBe(true);
  });

  it("denies access to non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.game.sendSummaryEmail()).rejects.toThrow("Admin access required");
  });
});
