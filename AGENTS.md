# AGENTS.md

<!--
This file lives in the PROJECT repo (not the workspace repo).
Copy it into the root of each project, replace autolist-1, then run:
    ln -s AGENTS.md CLAUDE.md
Keep this file thin. Knowledge lives in the workspace repo, not here.
-->

This project's full context lives in the workspace repo at
`~/workspace/projects/autolist-1/`.

## Session start (required — do this before anything else)

1. Read `~/workspace/projects/autolist-1/CONTEXT.md` — stack, codebase map,
   conventions, cross-project links. The codebase map replaces exploration:
   DO NOT crawl the repo to orient yourself. If something you need isn't on
   the map, ask.
2. Read `~/workspace/projects/autolist-1/STATUS.md` — the latest session-log
   entry is the handoff. Continue on the branch it names. DO NOT create a
   new branch, worktree, or workspace unless the entry or the user says to.
3. Skim `docs/adr/` titles; read any ADR relevant to the task. Do not
   re-litigate recorded decisions — propose a new ADR if you disagree.
4. State your plan in 3-5 lines BEFORE editing anything. If your plan
   includes "explore the project structure", stop — re-read the codebase
   map instead.

## Session end (required — this is part of "done")

Update `STATUS.md` in the workspace repo with a new session-log entry that
lets a brand-new session continue WITHOUT exploring. Use the exact format
in STATUS.md, filling every line:

- Branch (and "continue here" marker)
- Files in play, each with its state
- Decided (+ ADR ref) / Related (cross-project links)
- Unverified (untested or unreviewed code)
- Next step (the very next concrete action)
- Trap (anything that will waste the next session's time)

If a non-obvious decision was made, add an ADR
(`docs/adr/NNNN-short-title.md`). If something portfolio-worthy happened,
add 2-3 lines to `portfolio.md`. Commit the workspace repo:
`ws(autolist-1): <summary>`.

## Session hygiene

- Prefer short, scoped sessions: one task, one session.
- If context grows past roughly 150K tokens AND the task is still in
  flight, compact/summarize in place. If the task is done or has changed
  shape, write the handoff and tell the user to start fresh.
- Never paste secrets or .env contents into the workspace repo.
