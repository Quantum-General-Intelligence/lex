# Vulcan Trial Prep Checklist

Quick reference for your 4-day trial (Monday-Thursday).

---

## Day 1: First Hours

### Before Writing Any Code
- [ ] Clone repo, get it running locally
- [ ] Find the main config/settings file
- [ ] Identify their fallback/demo mode pattern (like `is_demo_mode()`)
- [ ] Read 2-3 API response schemas
- [ ] Trace one request: frontend → backend → database
- [ ] Find where tests live, run them
- [ ] Check CI/CD pipeline (`.github/workflows/`)

### Questions to Answer
| Question | Where to Look |
|----------|---------------|
| Where do they branch between production and fallback? | Near DB/API calls |
| What's their equivalent of `is_demo_mode()`? | Config/settings file |
| How do they structure API responses? | Schema/types folder |
| What state management pattern do they use? | Top-level providers, hooks |

---

## Before Every Change

### Read-First Loop
```
1. Read the file(s) you'll modify
2. Understand the existing patterns
3. Check for tests that cover this code
4. Only then start coding
```

### Small Change Loop
```
1. Make ONE small change
2. Run tests locally
3. Verify it works
4. Commit with clear message
5. Repeat
```

---

## When Writing Code

### Validation Checklist
- [ ] Added input validation (`ge=`, `le=`, `min_length`, `max_length`)
- [ ] Handles edge cases (empty, null, too large)
- [ ] Returns appropriate HTTP status codes
- [ ] Error messages are helpful

### Logging Checklist
- [ ] Log operation start with parameters
- [ ] Log operation completion with timing
- [ ] Log errors with context
- [ ] Use structured logging (key=value, not string interpolation)

```python
# Good
logger.info("query_started", query=query, user_id=user_id)

# Bad
logger.info(f"Starting query: {query}")
```

### Feature Flag Pattern
```python
from app.core.feature_flags import FeatureFlag, is_enabled

if is_enabled(FeatureFlag.NEW_FEATURE):
    # New code path
else:
    # Safe default
```

---

## Before Every Commit

### Pre-Commit Checklist
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Type check passes
- [ ] I've read my own diff
- [ ] Commit message explains WHY, not just WHAT

### Commit Message Format
```
<type>: <short description>

<body explaining why>

🤖 Generated with Claude Code
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

---

## Before Every PR

### PR Description Template
```markdown
## Summary
- Bullet points of what changed

## Why
- Business justification

## Changes
- File-by-file breakdown

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|

## Test Plan
- How to verify this works

## Rollout Plan
- How to deploy safely
```

### PR Checklist
- [ ] Small, focused PR (under 400 lines ideally)
- [ ] Has tests for new functionality
- [ ] No unrelated changes
- [ ] Description explains the change
- [ ] Linked to issue/ticket if applicable

---

## Questions to Ask the Team

### Day 1
1. "What's the most fragile part of the codebase?"
2. "What would you change if you could start over?"
3. "Where do most bugs come from?"

### When Stuck
1. "Is there an existing pattern for this?"
2. "Who owns this part of the system?"
3. "What's the deployment process?"

### Before Big Changes
1. "Does this approach make sense?"
2. "Are there edge cases I'm missing?"
3. "How should I test this?"

---

## Red Flags to Avoid

### Code Smells
- ❌ Hardcoded values (use config/env vars)
- ❌ No error handling
- ❌ No input validation
- ❌ Console.log instead of structured logging
- ❌ Copy-pasting code instead of abstracting

### Process Smells
- ❌ Pushing directly to main
- ❌ Skipping tests "just this once"
- ❌ Large PRs with multiple unrelated changes
- ❌ "Trust me it works" without proof
- ❌ Not asking questions when stuck

---

## Quick Reference: What You Built in Lex

| Pattern | File | What to Remember |
|---------|------|------------------|
| CI/CD | `.github/workflows/ci.yml` | lint → typecheck → test → build |
| Validation | `schemas/legal.py` | `Field(..., ge=1, le=100)` |
| Integration Tests | `tests/test_graph_integration.py` | Test business logic, not just validation |
| Structured Logging | `core/logging.py` | `logger.info("event", key=value)` |
| Feature Flags | `core/feature_flags.py` | `is_enabled(FeatureFlag.X)` |
| Audit Trail | `core/audit.py` | Record input/output/reasoning |

---

## Daily Standup Prep

### What to Say
```
Yesterday: [What you completed]
Today: [What you're working on]
Blockers: [What's stopping you, if anything]
```

### Keep It Short
- 30 seconds max
- Be specific ("Fixed auth bug in login.py" not "Worked on auth")
- Ask for help early if blocked

---

## Remember

1. **Ask questions early** - It's expected during a trial
2. **Small PRs are better** - Easier to review, faster to merge
3. **Tests are not optional** - They prove your code works
4. **Read before you write** - Understand the codebase first
5. **Document your reasoning** - In commits, PRs, and code comments

Good luck! 🚀
