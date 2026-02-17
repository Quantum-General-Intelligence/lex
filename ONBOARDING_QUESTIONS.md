# Codebase Onboarding Questions

Quick reference for navigating a new codebase on Day 1.

---

## Core Questions to Answer

### 1. Where do they branch between production and fallback?

**What to look for:**
- Environment variable checks (`DEMO_MODE`, `USE_MOCK`, `OFFLINE_MODE`)
- Feature flags or config toggles
- Try/catch blocks that fall back to cached or mock data
- Conditionals near database/API calls

**Example from Lex:**
```python
# backend/app/api/routes/query.py:30
if is_demo_mode():
    demo_store = get_demo_store()
    # ... use demo data
else:
    # ... use real ChromaDB + Neo4j
```

---

### 2. What's their equivalent of `is_demo_mode()`?

**What to look for:**
- A config/settings module with feature flags
- Functions like `is_offline()`, `use_fallback()`, `get_mode()`
- Environment-based switches in config class/file

**Example from Lex:**
```python
# backend/app/core/demo_data.py
def is_demo_mode() -> bool:
    return os.getenv("DEMO_MODE", "false").lower() == "true"
```

---

### 3. How do they structure API responses?

**What to look for:**
- Schema/model definitions (Pydantic, TypeScript interfaces, JSON Schema)
- Common response wrapper patterns: `{ data, meta, errors }`
- Whether they use envelope patterns or flat responses
- How they handle errors (inline vs exception-based)

**Example from Lex:**
```python
# backend/app/schemas/rag.py
class QueryResponse(BaseModel):
    query: str
    answer: str
    confidence_score: float
    citations: list[Citation]
    chain_of_thought: Optional[str]
    ambiguity_flags: list[str]
    processing_time_ms: float
```

---

### 4. What state management pattern do they use?

**What to look for:**
- Global stores: Redux (`/store`), Zustand, Jotai, MobX
- Context providers wrapping the app
- Custom hooks for data fetching (`useQuery`, `useSWR`)
- Whether they separate UI state from server state

**Example from Lex:**
```tsx
// React useState + useEffect, no global store
const [graphData, setGraphData] = useState({ nodes: [], links: [] })
const [loading, setLoading] = useState(true)
```

---

## Quick Reference Table

| Question | Where to Look | Red Flag if Missing |
|----------|---------------|---------------------|
| Fallback pattern | Near DB/API calls | No graceful degradation |
| Mode switching | Config/settings file | Hardcoded env checks everywhere |
| Response structure | Schema/types folder | Inconsistent API contracts |
| State management | Top-level providers, hooks | State scattered randomly |

---

## Day 1 Checklist

- [ ] Clone repo, run locally
- [ ] Find the main config/settings file
- [ ] Identify the fallback/demo mode pattern
- [ ] Read 2-3 API response schemas
- [ ] Trace one request from frontend → backend → database
- [ ] Note the state management approach
- [ ] Find where tests live and run them

---

## Follow-up Questions for Team

Once you've answered the core questions, ask the team:

1. "What's the most fragile part of the codebase?"
2. "What would you change if you could start over?"
3. "Where do most bugs come from?"
4. "What's the deployment process?"
5. "Who owns what parts of the system?"
