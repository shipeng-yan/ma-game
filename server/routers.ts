import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { insertGameSession, getAllGameSessions, getGameAnalytics } from "./db";
import { notifyOwner } from "./_core/notification";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

const DecisionSchema = z.object({
  chapter: z.string(),
  chapterTitle: z.string(),
  choiceLabel: z.string(),
  choiceDesc: z.string(),
  investorDelta: z.number(),
  esgDelta: z.number(),
  rationale: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  game: router({
    // Public: submit a completed game session
    submitResult: publicProcedure
      .input(z.object({
        playerName: z.string().min(1),
        playerEmail: z.string().email(),
        investorScore: z.number(),
        esgScore: z.number(),
        finalOutcome: z.string(),
        archetypeLabel: z.string(),
        decisions: z.array(DecisionSchema),
        durationSeconds: z.number().optional(),
        gameOver: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await insertGameSession({
          playerName: input.playerName,
          playerEmail: input.playerEmail,
          investorScore: input.investorScore,
          esgScore: input.esgScore,
          finalOutcome: input.finalOutcome,
          archetypeLabel: input.archetypeLabel,
          decisions: input.decisions,
          durationSeconds: input.durationSeconds ?? 0,
          gameOver: input.gameOver ? 1 : 0,
          completedAt: new Date(),
        });

        // Notify owner after each submission
        const analytics = await getGameAnalytics();
        if (analytics) {
          await notifyOwner({
            title: `🎮 Titan Challenge: ${input.playerName} completed the game`,
            content: `**Player:** ${input.playerName} (${input.playerEmail})\n**Investor Score:** ${input.investorScore} | **ESG Score:** ${input.esgScore}\n**Outcome:** ${input.archetypeLabel}\n\n**Class Summary:** ${analytics.total} submissions total | Avg Investor: ${analytics.avgInvestor} | Avg ESG: ${analytics.avgEsg} | Completion rate: ${analytics.completionRate}%`,
          });
        }

        return { success: true, id };
      }),

    // Public: get rankings (average of investor + esg scores, no admin required)
    getRankings: publicProcedure.query(async () => {
      const sessions = await getAllGameSessions();
      const completed = sessions.filter(s => !s.gameOver);
      return completed
        .map(s => ({
          id: s.id,
          playerName: s.playerName,
          investorScore: s.investorScore,
          esgScore: s.esgScore,
          averageScore: Math.round(((s.investorScore + s.esgScore) / 2) * 10) / 10,
          archetypeLabel: s.archetypeLabel,
          completedAt: s.completedAt,
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .map((s, i) => ({ ...s, rank: i + 1 }));
    }),

    // Public: get choice distribution per decision key (for classmate aggregate)
    getChoiceDistribution: publicProcedure.query(async () => {
      const sessions = await getAllGameSessions();
      const completed = sessions.filter(s => !s.gameOver);
      // decision keys: A1, A2, B1, B2, C1, C2, D1, D2
      const keys = ['A1','A2','B1','B2','C1','C2','D1','D2'];
      const dist: Record<string, Record<string, number>> = {};
      for (const key of keys) dist[key] = {};
      for (const session of completed) {
        let decisions: Array<{ chapter: string; choiceLabel: string }> = [];
        try { decisions = typeof session.decisions === 'string' ? JSON.parse(session.decisions) : session.decisions; } catch {}
        for (const d of decisions) {
          if (!keys.includes(d.chapter)) continue;
          // Extract option letter from choiceLabel like "Option A: ..."
          const match = d.choiceLabel.match(/^Option ([A-Z])/);
          if (!match) continue;
          const opt = match[1];
          dist[d.chapter][opt] = (dist[d.chapter][opt] || 0) + 1;
        }
      }
      return { distribution: dist, total: completed.length };
    }),

    // Admin: get all sessions with rankings
    getSessions: adminProcedure.query(async () => {
      const sessions = await getAllGameSessions();
      // Rank by combined score (investor + esg)
      const ranked = sessions
        .map((s, i) => ({ ...s, combinedScore: s.investorScore + s.esgScore }))
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .map((s, i) => ({ ...s, rank: i + 1 }));
      return ranked;
    }),

    // Admin: get analytics summary
    getAnalytics: adminProcedure.query(async () => {
      return await getGameAnalytics();
    }),

    // Admin: send manual email summary to teacher
    sendSummaryEmail: adminProcedure.mutation(async () => {
      const analytics = await getGameAnalytics();
      if (!analytics) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not fetch analytics" });

      await notifyOwner({
        title: `📊 Titan Challenge - Class Summary Report`,
        content: `**Total Submissions:** ${analytics.total}\n**Avg Investor Score:** ${analytics.avgInvestor}\n**Avg ESG Score:** ${analytics.avgEsg}\n**Completion Rate:** ${analytics.completionRate}%\n**Game Over Rate:** ${analytics.gameOverRate}%`,
      });

      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
