# AGENTS.md — Ellina Yatsenyuk portfolio site

## Agent workflow (owner-approved 2026-10-29)

Every coding request here follows **[IULink-App/ai-tools WORKFLOW.md](https://github.com/IULink-App/ai-tools/blob/main/WORKFLOW.md)**.
If older text in this file disagrees about who builds or reviews, WORKFLOW.md wins. In short:

- **Builders, one per area:** Claude (lead): money/payments, auth/logins, database/migrations, production, multi-repo work.
  Codex: well-scoped backend/TMS tasks + tests. Kimi (Kimi Code Pro, K3.1 Pro): front-end/design lanes and repo-wide
  audits, never IULink money/auth/DB code. Local Ollama models: private/offline jobs only, never production code.
- **Build** in your own Orca worktree/branch, run the tests, open a PR, and always post its clickable link.
- **Review by a different model:** normal PR → Codex (a Codex-built PR → Claude reviews). Money/auth/DB PR → Codex + Grok.
  UI PR → also before/after screenshots at 390×844 and 1440. Fix every finding and record a disposition for each.
- **Merge only on green CI** via `scripts/safe-merge.sh <pr> [owner/repo]` (tms-app). Never push to main, never merge in the
  GitHub UI. DB changes are tested on a throwaway schema snapshot first. Reviewer silent >20 min → go ahead on CI + Claude
  review and note it on the PR.
- **Owner only:** keys/secrets, money, production approvals, uploads. Commit only your own files; never print secrets.
