# Component Refactoring Plan
## Breaking Down Large Components for Better Maintainability

**Date:** November 6, 2025
**Status:** In Progress 🚧
**Priority:** HIGH 🔴

---

## 📋 Overview

Refactoring 7 large components (>500 lines each) into smaller, reusable, testable components.

**Goal:** Improve maintainability, testability, and developer experience.

---

## 🎯 Components to Refactor (Priority Order)

### 1. AgentDashboardPage.tsx (819 lines) ⚠️ URGENT
**Location:** `src/frontend/src/pages/Agents/AgentDashboardPage.tsx`

**Current Structure:**
- Multiple useState hooks (8+)
- Data loading functions (3)
- Action handlers (2)
- Utility functions (2)
- Complex tabbed interface
- Charts and tables
- Modals for task assignment

**Proposed Breakdown:**

```
AgentDashboardPage.tsx (100-150 lines) - Main container
├── AgentOverviewTab.tsx (100-120 lines)
│   ├── AgentStatsCards.tsx (60-80 lines)
│   └── AgentLoadChart.tsx (40-60 lines)
├── AgentListTab.tsx (80-100 lines)
│   ├── AgentTable.tsx (60-80 lines)
│   └── AgentCard.tsx (40-50 lines)
├── AgentMetricsTab.tsx (100-120 lines)
│   ├── AgentPerformanceChart.tsx (50-70 lines)
│   └── AgentActivityChart.tsx (50-70 lines)
├── TasksTab.tsx (80-100 lines)
│   └── TaskTable.tsx (60-80 lines)
├── TaskAssignmentModal.tsx (80-100 lines)
│   └── TaskForm.tsx (50-70 lines)
└── CoordinationModal.tsx (80-100 lines)
    └── CoordinationForm.tsx (50-70 lines)
```

**Reusable Hooks to Extract:**
- `useAgentDashboard.ts` - Main data management
- `useTaskAssignment.ts` - Task assignment logic
- `useCoordination.ts` - Coordination logic

**Benefits:**
- Each component < 150 lines
- Easier to test
- Reusable across different pages
- Clear separation of concerns

---

### 2. RiskAnalyticsDashboard.tsx (804 lines) ⚠️ URGENT
**Location:** `src/frontend/src/pages/Risk/RiskAnalyticsDashboard.tsx`

**Proposed Breakdown:**

```
RiskAnalyticsDashboard.tsx (100-150 lines)
├── RiskOverview.tsx (80-100 lines)
│   ├── RiskSummaryCards.tsx (50-70 lines)
│   └── RiskTrendChart.tsx (40-60 lines)
├── RiskTable.tsx (100-120 lines)
│   ├── RiskFilters.tsx (50-70 lines)
│   └── RiskDataGrid.tsx (60-80 lines)
├── RiskCharts.tsx (120-150 lines)
│   ├── RiskDistributionChart.tsx (50-70 lines)
│   ├── RiskTimelineChart.tsx (50-70 lines)
│   └── RiskHeatmap.tsx (50-70 lines)
└── RiskAlerts.tsx (60-80 lines)
    └── AlertCard.tsx (30-40 lines)
```

**Reusable Hooks:**
- `useRiskAnalytics.ts` - Risk data management
- `useRiskFilters.ts` - Filter state management
- `useRiskCharts.ts` - Chart data preparation

---

### 3. PureStrandsInterface.tsx (680 lines)
**Location:** `src/frontend/src/pages/AI/PureStrandsInterface.tsx`

**Proposed Breakdown:**

```
PureStrandsInterface.tsx (100-120 lines)
├── ChatInterface.tsx (150-180 lines)
│   ├── MessageList.tsx (80-100 lines)
│   │   └── MessageBubble.tsx (40-50 lines)
│   ├── InputArea.tsx (60-80 lines)
│   │   └── FileAttachment.tsx (40-50 lines)
│   └── TypingIndicator.tsx (20-30 lines)
├── FileUploadPanel.tsx (80-100 lines)
│   ├── FileDropzone.tsx (50-60 lines)
│   └── FileList.tsx (40-50 lines)
├── AgentSelector.tsx (60-80 lines)
│   └── AgentCard.tsx (30-40 lines)
└── SessionInfo.tsx (40-60 lines)
```

**Reusable Hooks:**
- `useChat.ts` - Chat message management (already proposed in Quick Wins)
- `usePureStrands.ts` - Strands API integration
- `useFileAttachment.ts` - File attachment handling

---

### 4. CreditAssessmentPage.tsx (643 lines)
**Location:** `src/frontend/src/pages/Credit/CreditAssessmentPage.tsx`

**Proposed Breakdown:**

```
CreditAssessmentPage.tsx (80-100 lines)
├── AssessmentForm.tsx (150-180 lines)
│   ├── ApplicantInfo.tsx (60-80 lines)
│   ├── FinancialInfo.tsx (60-80 lines)
│   └── CollateralInfo.tsx (50-70 lines)
├── AssessmentResults.tsx (120-150 lines)
│   ├── RiskScore.tsx (40-60 lines)
│   ├── RiskFactors.tsx (60-80 lines)
│   └── Recommendations.tsx (40-60 lines)
└── AssessmentHistory.tsx (80-100 lines)
    └── HistoryTable.tsx (60-80 lines)
```

**Reusable Hooks:**
- `useCreditAssessment.ts` - Assessment logic
- `useFormValidation.ts` - Form validation (generic)

---

### 5. SystemDashboard.tsx (585 lines)
**Location:** `src/frontend/src/pages/System/SystemDashboard.tsx`

**Proposed Breakdown:**

```
SystemDashboard.tsx (80-100 lines)
├── HealthMetrics.tsx (100-120 lines)
│   ├── ServiceStatusCards.tsx (50-70 lines)
│   └── HealthChart.tsx (40-60 lines)
├── ServiceStatus.tsx (100-120 lines)
│   ├── ServiceTable.tsx (60-80 lines)
│   └── ServiceDetails.tsx (40-60 lines)
├── AlertPanel.tsx (80-100 lines)
│   └── AlertList.tsx (50-70 lines)
└── PerformanceMetrics.tsx (100-120 lines)
    ├── CPUChart.tsx (40-50 lines)
    ├── MemoryChart.tsx (40-50 lines)
    └── NetworkChart.tsx (40-50 lines)
```

**Reusable Hooks:**
- `useSystemHealth.ts` - System health monitoring
- `usePerformanceMetrics.ts` - Performance data

---

### 6. KnowledgeBasePage.tsx (563 lines)
**Location:** `src/frontend/src/pages/Knowledge/KnowledgeBasePage.tsx`

**Proposed Breakdown:**

```
KnowledgeBasePage.tsx (80-100 lines)
├── SearchPanel.tsx (100-120 lines)
│   ├── SearchBar.tsx (40-60 lines)
│   └── SearchFilters.tsx (50-70 lines)
├── UploadPanel.tsx (100-120 lines)
│   ├── DocumentUpload.tsx (60-80 lines)
│   └── UploadProgress.tsx (40-50 lines)
├── ResultsList.tsx (120-150 lines)
│   ├── ResultCard.tsx (50-70 lines)
│   └── DocumentPreview.tsx (60-80 lines)
└── KnowledgeStats.tsx (60-80 lines)
```

**Reusable Hooks:**
- `useKnowledgeSearch.ts` - Search logic
- `useDocumentUpload.ts` - Document upload (similar to useFileUpload but specialized)

---

### 7. ComplianceResult.tsx (449 lines)
**Location:** `src/frontend/src/pages/Compliance/ComplianceResult.tsx` (assumed)

**Proposed Breakdown:**

```
ComplianceResult.tsx (60-80 lines)
├── ComplianceHeader.tsx (40-60 lines)
│   ├── StatusBadge.tsx (20-30 lines)
│   └── ConfidenceScore.tsx (20-30 lines)
├── ComplianceDetails.tsx (120-150 lines)
│   ├── DocumentAnalysis.tsx (60-80 lines)
│   ├── ViolationsList.tsx (60-80 lines)
│   └── RecommendationsList.tsx (50-70 lines)
└── ComplianceActions.tsx (40-60 lines)
    └── ActionButtons.tsx (20-30 lines)
```

**Reusable Hooks:**
- Already using `useCompliance` from Quick Wins ✅

---

## 📊 Refactoring Metrics

### Before
- **7 large files:** 5,117 total lines
- **Average file size:** 731 lines
- **Largest file:** 819 lines
- **Testability:** Low (too complex)
- **Reusability:** Low (everything in one file)

### After (Target)
- **35-40 smaller files:** ~80-150 lines each
- **Average file size:** ~80 lines
- **Largest file:** ~180 lines
- **Testability:** High (focused components)
- **Reusability:** High (composable)

---

## 🎯 Implementation Strategy

### Phase 1: AgentDashboardPage (Days 1-2)
1. Extract utility functions and types
2. Create custom hook `useAgentDashboard`
3. Split into tab components
4. Extract modals
5. Test each component
6. Replace original file

### Phase 2: RiskAnalyticsDashboard (Days 3-4)
1. Extract data processing logic
2. Create `useRiskAnalytics` hook
3. Split charts into components
4. Create filter components
5. Test and integrate

### Phase 3: PureStrandsInterface (Day 5)
1. Extract chat logic into `useChat`
2. Split chat interface
3. Create file upload components
4. Test messaging flow

### Phase 4: Remaining Components (Days 6-7)
1. Apply similar patterns
2. Reuse common components
3. Test thoroughly

---

## 🧩 Common Reusable Components

These components will be used across multiple pages:

```
src/frontend/src/components/common/
├── DataTable/
│   ├── DataTable.tsx (generic table)
│   └── DataTableFilters.tsx
├── Charts/
│   ├── GenericLineChart.tsx
│   ├── GenericBarChart.tsx
│   └── GenericPieChart.tsx
├── Forms/
│   ├── FormField.tsx
│   ├── FormSection.tsx
│   └── FormActions.tsx
├── Modals/
│   ├── ConfirmModal.tsx
│   └── FormModal.tsx
└── Cards/
    ├── StatCard.tsx
    ├── InfoCard.tsx
    └── ActionCard.tsx
```

---

## ✅ Success Criteria

### Per Component
- ✅ No file > 200 lines
- ✅ Single responsibility principle
- ✅ Reusable and composable
- ✅ Fully typed (TypeScript)
- ✅ Unit tests for hooks
- ✅ Component tests for UI

### Overall
- ✅ All 7 components refactored
- ✅ No duplicated code
- ✅ Improved performance (code splitting)
- ✅ Better developer experience
- ✅ Easier onboarding for new devs

---

## 🚀 Getting Started

### Step 1: Start with AgentDashboardPage
This is the most urgent and will set the pattern for others.

**Commands:**
```bash
# Create component directories
mkdir -p src/frontend/src/components/Agent/{Overview,List,Metrics,Tasks,Modals}

# Create hook file
touch src/frontend/src/hooks/useAgentDashboard.ts

# Start refactoring
# ... (see detailed plan below)
```

---

## 📝 Next Actions

1. **Create component directories** ✅ (Next)
2. **Extract types to shared files**
3. **Create useAgentDashboard hook**
4. **Build AgentStatsCards component**
5. **Build AgentTable component**
6. **Continue with remaining components**

---

**Status:** Ready to Start
**Est. Time:** 1-2 weeks (7-10 days)
**Team:** VPBank K-MULT Development Team
**Priority:** HIGH 🔴

---

*Updated: November 6, 2025*
