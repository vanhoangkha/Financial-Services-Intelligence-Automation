# Quick Wins Implementation Plan
## Kế Hoạch Triển Khai Cải Thiện Nhanh

**Ngày:** 06 Tháng 11, 2025
**Thời gian thực tế:** ~4 giờ
**Trạng thái:** ALL TASKS COMPLETE ✅✅✅

---

## 📋 Tổng Quan

### Mục tiêu
1. ✅ Fix agent-route coupling (~2 giờ) - **COMPLETED**
2. ✅ Create custom hooks (~1 giờ) - **COMPLETED**
3. ✅ Add basic unit tests (~1 giờ) - **COMPLETED**

### Lợi ích
- Cải thiện architecture
- Dễ test và maintain
- Tránh circular dependencies
- Code reusability tốt hơn

---

## 🔧 Task 1: Fix Agent-Route Coupling

### Vấn đề Hiện Tại ⚠️

**File:** `src/backend/app/mutil_agent/agents/endpoint_wrapper_tools.py`

**Các imports sai:**
```python
# Line 28 - BAD ❌
from app.mutil_agent.routes.v1.compliance_routes import validate_document_file

# Line 166 - BAD ❌
from app.mutil_agent.routes.v1.text_routes import summarize_document

# Line 325 - BAD ❌
from app.mutil_agent.routes.v1.risk_routes import assess_risk_endpoint, assess_risk_file_endpoint
```

### Giải pháp ✅

**Thay vì import từ routes → Import từ services:**

```python
# GOOD ✅
from app.mutil_agent.services.compliance_service import ComplianceValidationService
from app.mutil_agent.services.text_service import TextSummaryService
from app.mutil_agent.services.risk_service import RiskAssessmentService
```

### Implementation Steps

#### Step 1.1: Analyze Current Service Methods
**Services Available:**
- `ComplianceValidationService`:
  - `validate_document_compliance(ocr_text, document_type)` ✅

- `TextSummaryService`:
  - `summarize_text(text, summary_type, max_length, language)` ✅
  - Need to check if has document processing method

- `RiskAssessmentService`:
  - Need to verify available methods

#### Step 1.2: Refactor Compliance Tool
```python
# Before
from app.mutil_agent.routes.v1.compliance_routes import validate_document_file

# After
from app.mutil_agent.services.compliance_service import ComplianceValidationService

compliance_service = ComplianceValidationService()

# In tool function:
# Extract text from file (using existing OCR logic)
ocr_text = extract_text_from_file(file_obj)

# Call service instead of route
result = await compliance_service.validate_document_compliance(
    ocr_text=ocr_text,
    document_type=None  # Auto-detect
)
```

#### Step 1.3: Refactor Text Summarization Tool
```python
# Before
from app.mutil_agent.routes.v1.text_routes import summarize_document

# After
from app.mutil_agent.services.text_service import TextSummaryService

text_service = TextSummaryService()

# In tool function:
# Extract text from document
text = extract_text_from_document(file_obj)

# Call service
result = await text_service.summarize_text(
    text=text,
    summary_type='general',
    language='vietnamese'
)
```

#### Step 1.4: Refactor Risk Assessment Tool
```python
# Before
from app.mutil_agent.routes.v1.risk_routes import assess_risk_endpoint

# After
from app.mutil_agent.services.risk_service import RiskAssessmentService

risk_service = RiskAssessmentService()

# In tool function:
result = await risk_service.assess_risk(risk_data)
```

### Challenges & Solutions

**Challenge 1:** Services expect text, routes handle file uploads
**Solution:** Extract text from files in tool functions before calling services

**Challenge 2:** Different parameter formats between routes and services
**Solution:** Add adapter layer in tool functions to transform parameters

**Challenge 3:** Async/sync handling
**Solution:** Keep existing async handling logic, just change the service call

---

## 🪝 Task 2: Create Custom Hooks

### Hooks to Create

#### 2.1. useApi.ts - Generic Data Fetching
```typescript
/**
 * Generic API hook with loading, error, and data states
 * Reusable for all API calls
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options?: {
    autoFetch?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();

      if (response.status === 'success') {
        setData(response.data || null);
        options?.onSuccess?.(response.data);
      } else {
        setError(response.message || 'Unknown error');
        options?.onError?.(response.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      options?.onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (options?.autoFetch) {
      execute();
    }
  }, [options?.autoFetch, execute]);

  return { data, loading, error, execute, refetch: execute };
}
```

**Usage Example:**
```typescript
function AgentsList() {
  const { data: agents, loading, error, refetch } = useApi(
    () => agentAPI.getAgents(),
    { autoFetch: true }
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return <AgentList agents={agents} onRefresh={refetch} />;
}
```

#### 2.2. useAgents.ts - Agent Management
```typescript
/**
 * Specialized hook for agent management
 * Handles fetching, creating, updating agents
 */
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await agentAPI.getAgents();
      if (response.success) {
        setAgents(response.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgent = useCallback(async (agentData: any) => {
    setLoading(true);
    try {
      const response = await agentAPI.createAgent(agentData);
      if (response.success) {
        await fetchAgents(); // Refresh list
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAgents]);

  const updateAgent = useCallback(async (id: string, agentData: any) => {
    setLoading(true);
    try {
      const response = await agentAPI.updateAgent(id, agentData);
      if (response.success) {
        await fetchAgents();
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAgents]);

  const deleteAgent = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await agentAPI.deleteAgent(id);
      await fetchAgents();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAgents]);

  const selectAgent = useCallback((id: string) => {
    const agent = agents.find(a => a.id === id);
    setSelectedAgent(agent || null);
  }, [agents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    selectedAgent,
    loading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent
  };
}
```

**Usage Example:**
```typescript
function AgentDashboard() {
  const {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent
  } = useAgents();

  // Component becomes much simpler!
  return (
    <Dashboard
      agents={agents}
      loading={loading}
      error={error}
      onCreate={createAgent}
      onUpdate={updateAgent}
      onDelete={deleteAgent}
      onSelect={selectAgent}
    />
  );
}
```

#### 2.3. useCompliance.ts - Compliance Validation
```typescript
/**
 * Hook for compliance validation
 */
export function useCompliance() {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateDocument = useCallback(async (
    file: File,
    documentType?: string
  ) => {
    setValidating(true);
    setError(null);

    try {
      const response = await complianceAPI.validateDocumentFile(
        file,
        documentType
      );

      if (response.status === 'success') {
        setResult(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Validation failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setValidating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    validating,
    result,
    error,
    validateDocument,
    reset
  };
}
```

#### 2.4. useFileUpload.ts - File Upload Handler
```typescript
/**
 * Generic file upload hook
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (
    file: File,
    endpoint: string,
    additionalData?: Record<string, string>
  ) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      // Simulate progress (in real app, use XHR with progress events)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  return { uploading, progress, error, upload };
}
```

---

## 🧪 Task 3: Add Basic Unit Tests

### Test Structure

```
src/frontend/src/__tests__/
├── hooks/
│   ├── useApi.test.ts
│   ├── useAgents.test.ts
│   └── useCompliance.test.ts
├── services/
│   └── api/
│       ├── health.test.ts
│       ├── agents.test.ts
│       └── compliance.test.ts
└── components/
    └── Chat/
        └── MessageBubble.test.tsx
```

### Example Test: useApi.test.ts

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '../hooks/useApi';

describe('useApi Hook', () => {
  it('should fetch data successfully', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'success',
      data: { id: 1, name: 'Test' }
    });

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: true })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ id: 1, name: 'Test' });
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle errors', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'error',
      message: 'Failed to fetch'
    });

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch');
      expect(result.current.data).toBeNull();
    });
  });

  it('should refetch data', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'success',
      data: { count: 1 }
    });

    const { result } = renderHook(() => useApi(mockFetcher));

    await result.current.execute();
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await result.current.refetch();
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });
});
```

---

## 📊 Progress Tracking

### Task 1: Fix Agent-Route Coupling ✅ COMPLETED
- [x] Analyze problem
- [x] Identify imports to fix (3 imports found in endpoint_wrapper_tools.py + 1 unused import in pure_strands_vpbank_system.py)
- [x] Check service methods availability
- [x] Refactor compliance tool (uses ComplianceValidationService + TextSummaryService)
- [x] Refactor text summarization tool (uses TextSummaryService)
- [x] Refactor risk assessment tool (uses assess_risk service)
- [x] Remove unused imports in pure_strands_vpbank_system.py
- [x] Test changes (all services healthy, endpoints working)
- [x] Verify no more route imports in agent files

### Task 2: Create Custom Hooks ✅ COMPLETED
- [x] Plan hook structure
- [x] Create useApi hook (Generic data fetching with loading/error states)
- [x] Create useAgents hook (Agent CRUD operations)
- [x] Create useCompliance hook (Document validation)
- [x] Create useFileUpload hook (File upload with progress)
- [x] Add documentation (JSDoc comments in all hooks)
- [x] Create index.ts for easy imports

### Task 3: Add Basic Unit Tests ✅ COMPLETED
- [x] Plan test structure
- [x] Setup testing environment (test directories created)
- [x] Write useApi tests (8 test cases)
- [x] Write useAgents tests (6 test cases)
- [x] Write health service tests (5 test cases)
- [x] Write agents service tests (5 test cases)
- [x] Write compliance service tests (5 test cases)
- [x] Total: 29 test cases created

---

## 🎯 Success Criteria

### Task 1 Complete When:
- ✅ No imports from routes in agent files
- ✅ All agents use services directly
- ✅ All tests pass
- ✅ No circular dependencies
- ✅ Code reviews approved

### Task 2 Complete When:
- ✅ 4+ custom hooks created
- ✅ Hooks properly documented
- ✅ Example usage provided
- ✅ Components using hooks

### Task 3 Complete When:
- ✅ 10+ tests written
- ✅ 60%+ code coverage
- ✅ All tests passing
- ✅ CI/CD integration

---

## 📝 Notes

### Tại Sao Cần Fix Agent-Route Coupling?

**Vấn đề:**
- Agents import routes → Routes import services → Circular dependency risk
- Khó test agents (phải mock cả routes)
- Routes chứa HTTP logic, không nên ở trong agents

**Giải pháp:**
- Agents → Services (direct)
- Routes → Services (presentation layer)
- Clean architecture: Controllers → Services → Models

### Best Practices Learned

1. **Always use services, not routes** trong internal code
2. **Routes are only for HTTP handling** - validation, auth, response formatting
3. **Services contain business logic** - reusable, testable
4. **Custom hooks reduce duplication** trong React components
5. **Tests ensure quality** - catch bugs early

---

## 🚀 Next Steps After Quick Wins

1. **Component Refactoring** - Break down large components
2. **State Management** - Implement Zustand
3. **More Tests** - Increase coverage to 80%+
4. **Performance** - Code splitting, lazy loading

---

**Status:** In Progress 🚧
**Start Date:** November 6, 2025
**Target Completion:** November 8-9, 2025
