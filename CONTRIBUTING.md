# Contributing

Sofrana is built by two people. We work like a real team so the Git history tells the story.

## Workflow

1. Pick an issue from the project board and assign it to yourself.
2. Update `main` and create a branch:
   ```bash
   git switch main
   git pull
   git switch -c feat/<short-name>
   ```
   - `feat/<short-name>` for features (`feat/servings-scaling`)
   - `fix/<short-name>` for bugs
   - `docs/<short-name>` for documentation
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/):
   ```text
   feat(core): scale spices non-linearly
   fix(kitchen): keep the screen awake after returning to the tab
   docs: add voice test results to README
   ```
4. Push and open a pull request using the template. Link the issue (`Closes #12`) and request a review from the other person.
5. The reviewer checks the code and the Vercel preview link. CI must be green and one approval is required.
6. Squash and merge, then delete the branch.

## Rules

- `main` is protected: no direct pushes, one approval and a green CI are required.
- Keep pull requests small (ideally under 400 changed lines).
- Review within one working day.
- Every change to `src/lib/core` comes with tests.
- UI changes include a screenshot or a short screen recording in the PR.
- If Claude helped, explain the change in your own words in the PR description.
- Start each working day with `git pull` on `main` to avoid conflicts.

## Local checks before pushing

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Weekly rhythm

- **Monday:** 15 minutes to agree on the week's issues on the project board
- **During the week:** small PRs, reviews within a day
- **Friday:** each person demos what they finished; short notes go to [`docs/weekly-notes.md`](docs/weekly-notes.md)

## Labels

| Label | Use |
| --- | --- |
| `epic` | One of the six core features |
| `feature` | A piece of an epic |
| `bug` | Something broken |
| `idea` | Not planned before week 10 |
| `owner:a` / `owner:b` | Who owns it |
| `week:1`, `week:2`, … | Planned week |
