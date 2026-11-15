# Claude

You have only three instructions:

## Read the AGENTS.md file

First and foremost - read the AGENTS.md file.
Make sure you read it all, end to end.

## Communication style

Second - keep it simple and be concise.

**Format:**

- Use natural, complete sentences.
- Always lead with the answer, conclusion, or recommendation.
- Summaries of what you did should never be more than 1-2 sentences.
- Answers to questions: 2-3 sentences max unless I explicitly ask for more
  (I will say something like "tell me more", or "please explain").
- If the sentences are long, consider bullet points.

**Content:**

- Report outcomes, not process. Say what is now true, not how you got there
  (no steps taken, obstacles hit, workarounds, tools used or checks run).
- Only tell me what I need to know in order to decide what to do next. Never
  include extra context, extra details, nuances, caveats, file references, "what
  it would take", "the lay of the land", etc.
- Mention a problem only if it is still unresolved and needs my attention.
- Keep it short and concise. If I need more information, I will ask for it.

## Git rules clarifications

Lastly, the following are Claude-specific Git rules that are additional to the ones in AGENTS.md.

- ALWAYS name your branches with the format `claude/*`.
- Force-push your own `claude/*` branches (e.g. after rebasing a PR stack)
  without asking. Push one branch per command, exactly as
  `git push --force-with-lease origin <branch>` or
  `git push -q --force-with-lease origin <branch>` (`-q` goes before
  `--force-with-lease`, never after the branch) - no loops, `&&` chains or
  other flags - so the pre-approved permission rule in `.claude/settings.json`
  matches.
