# PR Template Example

Below is an example PR description for the changes we made. Use this as a template at Vulcan.

---

## Add request validation and test coverage for Graph API

### Summary
- Added input validation (bounds checking) to Graph API endpoints
- Added 26 new tests (12 validation + 14 integration)
- Set up CI/CD pipeline with GitHub Actions
- Fixed ESLint errors blocking frontend build

### Changes

**Backend validation** (`backend/app/api/routes/graph.py`, `backend/app/schemas/legal.py`)
- Added `ge=1` (greater than or equal) bounds to `limit`, `depth`, `skip` params
- Added `max_length` constraints to string params (`search`, `jurisdiction`, `center_node_id`)
- Created `GraphExploreRequest` Pydantic schema for future use

**Test coverage** (`backend/tests/`)
- `test_graph_validation.py`: 12 tests for boundary validation (rejects bad input)
- `test_graph_integration.py`: 14 tests for business logic (returns correct data)
- `test_health.py`: 2 tests for health endpoints

**CI/CD** (`.github/workflows/ci.yml`)
- Frontend: lint → typecheck → build
- Backend: ruff lint → ruff format → mypy → pytest

**Frontend fixes**
- Fixed unescaped entities in `page.tsx` and `ComplianceChecker.tsx`
- Added `.eslintrc.json` config

### Why

Without input validation, users could:
- Request `limit=999999` and crash the server or cause OOM
- Pass negative values causing unexpected behavior
- Send extremely long strings bloating memory

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaks existing clients | Low | Only adds constraints, doesn't change defaults |
| Performance impact | None | Validation happens before DB queries |
| Breaking change | Low | Clients sending valid values unaffected |

### Test Plan

```bash
# Run all backend tests
cd backend && DEMO_MODE=true python3 -m pytest tests/ -v

# Expected: 28 passed
```

### Rollout Plan

1. Merge to main
2. CI runs automatically
3. Deploy to staging
4. Verify `/api/graph/explore?limit=1` works
5. Verify `/api/graph/explore?limit=1000` returns 422
6. Deploy to production

### Checklist

- [x] Tests pass locally
- [x] No lint errors
- [x] Type check passes
- [x] Reviewed my own diff
- [ ] Tested in staging (N/A - no staging yet)

---

## Key Sections Explained

### Summary
2-4 bullet points. What did you do? A busy reviewer should understand the PR from this alone.

### Changes
Group by area. Link to specific files. Be specific about what changed.

### Why
Business justification. Why does this matter? What problem does it solve?

### Risk Assessment
Shows you thought about what could go wrong. Builds trust with reviewers.

### Test Plan
How can someone verify this works? Include actual commands.

### Rollout Plan
How will this get to production safely? Shows operational maturity.

### Checklist
Quick verification that you did your due diligence.
