# Quick Cleanup Checklist - Priority Actions

## PHASE 1: IMMEDIATE (Critical - Do This First)
These can be done immediately and will reduce repo size/clutter.

### Critical Removals
- [ ] **Delete backup archive:** `/vpbank-kmult-backup-20251106-140530.tar.gz` (274 KB)
- [ ] **Delete old API file:** `/src/frontend/src/services/api.ts.old` (740 lines, 21 KB)
- [ ] **Delete unused Dockerfile:** `/src/backend/app/mutil_agent/Dockerfile`
- [ ] **Remove node_modules:** `rm -rf deployments/infrastructure/cdk/node_modules/` (51 MB!)
- [ ] **Delete legacy backup:** `/src/tools/backup/backup/` directory

### Commands (Ready to Run)
```bash
cd /home/ubuntu/multi-agent-hackathon

# Remove backup archive
rm -f vpbank-kmult-backup-20251106-140530.tar.gz

# Remove old API file
rm -f src/frontend/src/services/api.ts.old

# Remove nested Dockerfile
rm -f src/backend/app/mutil_agent/Dockerfile

# Remove node_modules from CDK
rm -rf deployments/infrastructure/cdk/node_modules/

# Move legacy backup directory
mkdir -p backups/archive
mv src/tools/backup backups/archive/legacy_tools_backup

# Commit these changes
git add -A
git commit -m "cleanup: Remove backup files, unused code, and node_modules from version control"
git rm --cached -r deployments/infrastructure/cdk/node_modules/
```

**Estimated Size Reduction:** 50+ MB (mostly node_modules)

---

## PHASE 2: INVESTIGATION (Need Decisions)
Before proceeding, investigate which versions are actually in use.

### Backend - Strands System
Need to determine: Which is primary?
- `src/backend/app/mutil_agent/agents/pure_strands_vpbank_system.py` (1,226 lines)
- `src/backend/app/mutil_agent/agents/pure_strands_vpbank_system_with_wrappers.py` (365 lines)

**Action Items:**
- [ ] Check `main.py` to see which is imported
- [ ] Check git blame/history to understand why both exist
- [ ] Decide: Keep primary, delete alternative
- [ ] Update imports if needed

### Backend - Routes
Need to determine: Are both sets of routes active?
- `src/backend/app/mutil_agent/routes/pure_strands_routes.py`
- `src/backend/app/mutil_agent/routes/v1/strands_agent_routes.py`

**Action Items:**
- [ ] Check `main.py` routes initialization
- [ ] Verify no duplicate endpoint definitions
- [ ] Consolidate into single location (prefer v1/)

### Backend - Services
Need to determine: Which bedrock service is current?
- `src/backend/app/mutil_agent/services/bedrock_service.py`
- `src/backend/app/mutil_agent/services/enhanced_bedrock_service.py`

**Action Items:**
- [ ] Check which is actually imported/used
- [ ] Check git history for evolution
- [ ] Delete deprecated version

---

## PHASE 3: SCRIPT REORGANIZATION (Medium Priority)

Current: 26+ scattered scripts  
Target: Organized, categorized scripts

### Current Script Variants
**Setup Scripts (6 variants):**
- setup-github-inline-buildspec.sh
- setup-github-safe.sh
- setup-github-token-secret.sh
- setup-github-credentials.sh
- setup-github-codebuild.sh
- setup-public-github.sh

**Deploy Scripts (6+ variants):**
- deploy.sh
- deploy-local-build.sh
- deploy-with-codebuild.sh
- deploy-pipeline.sh
- deploy-s3-inline-buildspec.sh
- deploy-s3-source.sh

### Proposed Organization
```
scripts/
├── setup/
│   ├── local.sh          # Consolidate local setup
│   ├── aws.sh            # Consolidate AWS setup
│   ├── github.sh         # Consolidate GitHub setup
│   └── README.md         # Document each script
├── deploy/
│   ├── local.sh
│   ├── aws.sh
│   ├── github.sh
│   └── README.md
├── monitor/
│   ├── pipeline.sh
│   ├── logs.sh
│   └── README.md
├── production/           # Keep well-organized
├── database/             # Keep well-organized
└── build.sh, run.sh      # Core utilities
```

**Actions:**
- [ ] Review each variant to understand purpose
- [ ] Consolidate similar scripts with environment variables
- [ ] Create comparison matrix documenting differences
- [ ] Document which script to use for what

---

## PHASE 4: CONFIGURATION CONSOLIDATION (Medium Priority)

### Docker Compose Files
Current:
- `/docker-compose.yml`
- `/docker-compose.prod.yml`
- `/config/docker-compose.yml`

**Action Items:**
- [ ] Check if `/config/docker-compose.yml` differs from root
- [ ] If identical, delete and document reason for having two
- [ ] If different, document differences clearly
- [ ] Consider if both dev/prod are needed

### Task Definition Files
Current (in `/config/`):
- `task-definition.json` (primary)
- `task-definition-updated.json` (?)
- `task-definition-fixed.json` (?)

**Action Items:**
- [ ] Determine which is current
- [ ] Keep primary, delete variants OR document their use
- [ ] Check git history for evolution

---

## PHASE 5: DOCUMENTATION CLEANUP (Low Priority)

### Root-Level Documentation Files
These should be archived or consolidated:
- API_ENDPOINTS.md
- API_FRONTEND_MAPPING.md
- BUGFIX_SUMMARY.md
- CODE_OPTIMIZATION_REPORT.md
- COMPREHENSIVE_TEST_REPORT.md
- OPTIMIZATION_SUMMARY.md
- REAL_INTEGRATION_STATUS.md

**Action Items:**
- [ ] Determine which are still relevant
- [ ] Move dated status reports to `/docs/archive/status-reports/`
- [ ] Keep only essential references at root
- [ ] Create `/docs/INDEX.md` with organization guide

---

## DECISION MATRIX

### Items Requiring Decisions

| Item | Owner | Decision | Impact |
|------|-------|----------|--------|
| Strands system (v1 vs with_wrappers) | Backend Lead | Keep primary | Can delete ~1 file |
| Route files (pure_strands vs v1) | Backend Lead | Consolidate | Can delete 1 file, refactor 1 |
| Bedrock services | Backend Lead | Keep current | Can delete old version |
| Script variants | DevOps/Release | Consolidate | Can delete 15+ files |
| Docker compose versions | Infra Lead | Decide primary | Can delete 1 file |
| Task definitions | Infra Lead | Decide current | Can delete 2 files |

---

## ESTIMATED IMPACT

### Phase 1: IMMEDIATE
- Files to delete: 5
- Size reduction: 50+ MB
- Time: 5 minutes
- Risk: Very Low (all clearly obsolete)

### Phase 2: INVESTIGATION
- Files to potentially delete: 3-5
- Size reduction: 200-500 KB
- Time: 30 minutes (investigation + decision)
- Risk: Low (need to verify usage first)

### Phase 3: SCRIPT REORGANIZATION
- Files to consolidate: 15+
- Size reduction: Minimal (same total size, better organized)
- Time: 2-4 hours (testing reorganized scripts)
- Risk: Medium (need to test all scripts)

### Phase 4: CONFIG CONSOLIDATION
- Files to delete: 2-3
- Size reduction: Minimal
- Time: 30 minutes (decisions + cleanup)
- Risk: Low

### Phase 5: DOCUMENTATION
- Files to archive: 7-10
- Size reduction: Minimal (already small)
- Time: 1 hour
- Risk: Very Low

---

## TOTAL IMPACT
- **Total files to remove/consolidate:** 30+
- **Total size reduction:** 50+ MB
- **Time investment:** 4-6 hours (mostly testing)
- **Overall complexity:** Medium

---

## NOTES FOR TEAM

1. **Git History is Your Friend:** Use `git log -p -- <file>` to understand why files exist
2. **Test Before Deleting:** Especially for code files (strands, routes, services)
3. **Document Decisions:** Add comments to git commits explaining consolidations
4. **One Phase at a Time:** Do Phase 1 first, get approval, then continue
5. **Keep Backups:** The cleanup script exists for a reason!

---

## NEXT STEPS

1. Run Phase 1 immediately (safe cleanup)
2. Schedule Phase 2 decisions with backend team
3. Plan Phase 3 reorganization with DevOps team
4. Execute remaining phases in order

