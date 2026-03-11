# Titan Challenge — Project TODO

## Phase 1: Database & Backend
- [x] Define database schema (game_sessions table)
- [x] Generate and apply database migration SQL
- [x] Add DB query helpers in server/db.ts
- [x] Add tRPC procedures: submitResult, getSessions, getAnalytics, sendSummaryEmail
- [x] Upload game image assets to CDN

## Phase 2: Game Integration
- [x] Create player login/welcome page (name + email form)
- [x] Integrate Titan Challenge game logic into React component
- [x] Wire game completion to auto-submit results to backend
- [x] Real-time score tracking and decision history

## Phase 3: Teacher Dashboard
- [x] Teacher dashboard page with sortable rankings table
- [x] Performance analytics (avg scores, completion rates, decision patterns)
- [x] CSV export functionality
- [x] Automated email summary to teacher on game completion
- [x] Protect dashboard with admin-only access

## Phase 4: Quality & Delivery
- [x] Write vitest tests for backend procedures (11 tests passing)
- [x] Verify all features in browser
- [x] Save checkpoint
- [x] Push to GitHub (ma-game repository)

## New Requests
- [x] Add password gate screen (password: MSAF7008) before registration
- [x] Add live ranking page shown at the end of the game (ranked by average of investor + ESG scores)
- [x] Update backend: expose a public endpoint for rankings (no admin required)
- [x] Make GitHub repository public

## Round 2 Requests
- [x] Add "View Ranking" button on the final summary page
- [x] Build dedicated /ranking projector page (full-screen, large fonts, auto-refresh, top-10 display)
- [x] Register /ranking route in App.tsx (no password required for teacher)

## Round 3 Requests
- [x] Redesign reveal section: combine player decisions with Unilever reality in a per-chapter contrast layout

## Round 4 Requests
- [x] Redesign chapter outcome screen: apply per-decision contrast layout (player vs Unilever) to each chapter's "what actually happened" section

## Round 5 Requests
- [ ] Create GitHub Pages index.html landing page as gateway to the game
- [ ] Enable GitHub Pages on the repository (gh-pages branch or docs/ folder)
- [ ] Push landing page to GitHub
