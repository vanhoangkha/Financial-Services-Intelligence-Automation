# Custom Hooks - Usage Guide
## How to Use the New React Hooks in Your Components

**Date:** November 6, 2025
**Location:** `src/frontend/src/hooks/`

---

## 🎯 Quick Start

All hooks are available from a single import:

```typescript
import { useApi, useAgents, useCompliance, useFileUpload } from './hooks';
```

---

## 📘 Hook 1: useApi - Generic API Hook

### Purpose
Universal hook for any API call with automatic loading/error handling.

### When to Use
- Any API endpoint
- Need loading states
- Need error handling
- Want to refetch data

### Basic Usage

```typescript
import { useApi } from './hooks';
import { healthAPI } from './services/api';

function HealthStatus() {
  const { data, loading, error, refetch } = useApi(
    () => healthAPI.checkHealth(),
    { autoFetch: true }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Health Status: {data.status}</h2>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Advanced Usage with Callbacks

```typescript
function AgentsList() {
  const { data, loading, execute } = useApi(
    () => agentAPI.getAgents(),
    {
      autoFetch: false,  // Manual control
      onSuccess: (agents) => {
        console.log(`Loaded ${agents.length} agents`);
        // Show success notification
      },
      onError: (error) => {
        console.error('Failed to load agents:', error);
        // Show error notification
      }
    }
  );

  return (
    <div>
      <button onClick={execute}>Load Agents</button>
      {loading && <Spinner />}
      {data && <AgentList agents={data} />}
    </div>
  );
}
```

### Type Safety

```typescript
interface Agent {
  id: string;
  name: string;
  type: string;
}

// Type-safe hook usage
const { data, loading, error } = useApi<Agent[]>(
  () => agentAPI.getAgents()
);

// data is automatically typed as Agent[] | null
```

---

## 🤖 Hook 2: useAgents - Agent Management

### Purpose
Specialized hook for managing agents with full CRUD operations.

### When to Use
- Agent dashboard
- Agent list/grid views
- Agent creation forms
- Agent editing

### Basic Usage

```typescript
import { useAgents } from './hooks';

function AgentDashboard() {
  const {
    agents,
    selectedAgent,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent
  } = useAgents();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Agents ({agents.length})</h1>
      <AgentGrid
        agents={agents}
        onSelect={(id) => selectAgent(id)}
      />
      {selectedAgent && (
        <AgentDetails agent={selectedAgent} />
      )}
    </div>
  );
}
```

### Creating a New Agent

```typescript
function CreateAgentForm() {
  const { createAgent, loading, error } = useAgents();
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newAgent = await createAgent(formData);
      console.log('Agent created:', newAgent);
      // Show success message
      // Redirect to agent page
    } catch (err) {
      console.error('Failed to create agent:', err);
      // Error already in state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Agent name"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Agent'}
      </button>
      {error && <ErrorMessage message={error} />}
    </form>
  );
}
```

### Updating an Agent

```typescript
function AgentEditor({ agentId }) {
  const { agents, updateAgent, loading } = useAgents();
  const agent = agents.find(a => a.id === agentId);

  const handleUpdate = async (updates) => {
    try {
      await updateAgent(agentId, updates);
      // Success! List automatically refreshed
    } catch (err) {
      // Error handling
    }
  };

  return (
    <div>
      <h2>Edit {agent?.name}</h2>
      <button onClick={() => handleUpdate({ status: 'active' })}>
        Activate
      </button>
    </div>
  );
}
```

---

## ⚖️ Hook 3: useCompliance - Document Validation

### Purpose
Validate documents and text against compliance regulations.

### When to Use
- Document upload forms
- Compliance checking
- Validation results display

### Validate a File

```typescript
import { useCompliance } from './hooks';

function ComplianceChecker() {
  const { validating, result, error, validateDocument, reset } = useCompliance();

  const handleFileUpload = async (file: File) => {
    const complianceResult = await validateDocument(file);

    if (complianceResult) {
      console.log('Status:', complianceResult.compliance_status);
      console.log('Score:', complianceResult.confidence_score);
    }
  };

  return (
    <div>
      <FileUploader onUpload={handleFileUpload} />

      {validating && <Spinner text="Validating document..." />}

      {result && (
        <div>
          <h3>Validation Result</h3>
          <p>Status: {result.compliance_status}</p>
          <p>Confidence: {(result.confidence_score * 100).toFixed(1)}%</p>
          <p>Document Type: {result.document_type}</p>

          {result.violations?.length > 0 && (
            <div>
              <h4>Violations Found:</h4>
              <ul>
                {result.violations.map((v, i) => (
                  <li key={i}>{v.description}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={reset}>Check Another Document</button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
```

### Validate Text

```typescript
function TextComplianceChecker() {
  const { validating, result, validateText } = useCompliance();
  const [text, setText] = useState('');

  const handleValidate = async () => {
    await validateText(text, 'letter_of_credit');
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste document text here..."
      />
      <button onClick={handleValidate} disabled={validating}>
        {validating ? 'Validating...' : 'Check Compliance'}
      </button>

      {result && (
        <ComplianceResultDisplay result={result} />
      )}
    </div>
  );
}
```

---

## 📤 Hook 4: useFileUpload - File Upload with Progress

### Purpose
Generic file upload with progress tracking for any endpoint.

### When to Use
- File uploads
- Need progress feedback
- Any document/image upload

### Basic Usage

```typescript
import { useFileUpload } from './hooks';

function DocumentUploader() {
  const { uploading, progress, error, upload } = useFileUpload();

  const handleUpload = async (file: File) => {
    try {
      const response = await upload(
        file,
        '/mutil_agent/api/v1/compliance/document',
        { document_type: 'invoice' }
      );

      console.log('Upload successful:', response);
      // Handle success
    } catch (err) {
      console.error('Upload failed:', err);
      // Error already in state
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />

      {uploading && (
        <div>
          <ProgressBar value={progress} />
          <p>Uploading: {progress}%</p>
        </div>
      )}

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
```

### With React Dropzone

```typescript
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from './hooks';

function DragDropUploader() {
  const { uploading, progress, upload } = useFileUpload();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    await upload(
      file,
      '/mutil_agent/api/v1/text/summary/document',
      {
        summary_type: 'general',
        language: 'vietnamese'
      }
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div {...getRootProps()} className={isDragActive ? 'active' : ''}>
      <input {...getInputProps()} />

      {uploading ? (
        <div>
          <Spinner />
          <p>Uploading {progress}%...</p>
        </div>
      ) : (
        <p>
          {isDragActive
            ? 'Drop the file here...'
            : 'Drag & drop a file, or click to select'
          }
        </p>
      )}
    </div>
  );
}
```

---

## 🔄 Combining Multiple Hooks

### Example: Complete Document Processing Flow

```typescript
function DocumentProcessor() {
  // Use multiple hooks together
  const { uploading, progress, upload } = useFileUpload();
  const { validating, result, validateDocument } = useCompliance();
  const [step, setStep] = useState<'upload' | 'validate' | 'done'>('upload');

  const handleFile = async (file: File) => {
    // Step 1: Upload
    setStep('upload');
    const uploadResponse = await upload(
      file,
      '/mutil_agent/api/v1/text/summary/document'
    );

    // Step 2: Validate
    setStep('validate');
    const complianceResult = await validateDocument(file);

    // Step 3: Done
    setStep('done');
  };

  return (
    <div>
      {step === 'upload' && (
        <div>
          <FileUploader onUpload={handleFile} />
          {uploading && <Progress value={progress} />}
        </div>
      )}

      {step === 'validate' && (
        <div>
          <Spinner />
          <p>Validating document compliance...</p>
        </div>
      )}

      {step === 'done' && result && (
        <div>
          <h2>Processing Complete!</h2>
          <ComplianceResult result={result} />
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Best Practices

### 1. Error Handling

```typescript
function BestPracticeComponent() {
  const { data, loading, error, execute } = useApi(
    () => someAPI.getData()
  );

  // Always handle all three states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={execute} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

### 2. Loading States

```typescript
function LoadingStates() {
  const { loading } = useAgents();

  return (
    <button disabled={loading}>
      {loading ? (
        <>
          <Spinner size="small" />
          <span>Loading...</span>
        </>
      ) : (
        'Load Data'
      )}
    </button>
  );
}
```

### 3. Optimistic Updates

```typescript
function OptimisticUpdate() {
  const { agents, updateAgent } = useAgents();
  const [localAgents, setLocalAgents] = useState(agents);

  const handleUpdate = async (id: string, updates: any) => {
    // Optimistic update
    setLocalAgents(prev =>
      prev.map(a => a.id === id ? { ...a, ...updates } : a)
    );

    try {
      await updateAgent(id, updates);
      // Success - real data will refresh
    } catch (err) {
      // Rollback on error
      setLocalAgents(agents);
    }
  };

  return <AgentList agents={localAgents} onUpdate={handleUpdate} />;
}
```

### 4. Cleanup

```typescript
function CleanupExample() {
  const { result, reset } = useCompliance();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      reset();
    };
  }, [reset]);

  return <div>{/* component */}</div>;
}
```

---

## 🧪 Testing Components with Hooks

### Test Example

```typescript
import { render, waitFor } from '@testing-library/react';
import { useAgents } from './hooks';

// Mock the hook
jest.mock('./hooks/useAgents');

describe('AgentDashboard', () => {
  it('displays agents', async () => {
    // Setup mock
    (useAgents as jest.Mock).mockReturnValue({
      agents: [{ id: '1', name: 'Test Agent' }],
      loading: false,
      error: null
    });

    const { getByText } = render(<AgentDashboard />);

    await waitFor(() => {
      expect(getByText('Test Agent')).toBeInTheDocument();
    });
  });
});
```

---

## 📚 Quick Reference

| Hook | Use Case | Key Features |
|------|----------|--------------|
| `useApi` | Any API call | Loading, error, refetch |
| `useAgents` | Agent CRUD | Full agent management |
| `useCompliance` | Validation | File & text validation |
| `useFileUpload` | File upload | Progress tracking |

---

## 🔗 Related Documentation

- Full API: `src/frontend/src/services/api/`
- Hook Source: `src/frontend/src/hooks/`
- Tests: `src/frontend/src/__tests__/hooks/`
- Complete Guide: `QUICK_WINS_COMPLETE_SUMMARY.md`

---

**Happy Coding! 🚀**

*VPBank K-MULT Agent Studio - November 6, 2025*
