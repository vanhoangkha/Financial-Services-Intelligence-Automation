# VPBank K-MULT Agent Studio - API Endpoints

## Base URL
- **Local Development**: `http://localhost:8080`
- **API Documentation**: `http://localhost:8080/docs`
- **OpenAPI Spec**: `http://localhost:8080/openapi.json`

---

## 🏥 Health Check & System APIs

### Public Health Check
```
GET /mutil_agent/public/api/v1/health-check/health
```
Basic health status of the service.

### Detailed Health Check
```
GET /mutil_agent/api/v1/health/health/detailed
```
Comprehensive health check with all services.

### Service-Specific Health Checks
```
GET /mutil_agent/api/v1/health/health/agents       # Agents health
GET /mutil_agent/api/v1/health/health/compliance   # Compliance service
GET /mutil_agent/api/v1/health/health/document     # Document service
GET /mutil_agent/api/v1/health/health/knowledge    # Knowledge base
GET /mutil_agent/api/v1/health/health/risk         # Risk service
GET /mutil_agent/api/v1/health/health/text         # Text service
```

### System Info
```
GET /mutil_agent/api/v1/info                       # API information
GET /mutil_agent/public/api/v1/endpoints           # List all endpoints
```

---

## 🤖 Multi-Agent System APIs

### Agent Management
```
GET  /mutil_agent/api/v1/agents/list               # List all agents
GET  /mutil_agent/api/v1/agents/status             # Overall agent status
GET  /mutil_agent/api/v1/agents/status/{agent_id}  # Specific agent status
GET  /mutil_agent/api/v1/agents/health             # Agent health check
POST /mutil_agent/api/v1/agents/assign             # Assign task to agent
POST /mutil_agent/api/v1/agents/coordinate         # Coordinate multiple agents
```

### Strands Agent System
```
GET  /mutil_agent/api/v1/strands/agents/status     # Strands agents status
GET  /mutil_agent/api/v1/strands/tools/list        # List available tools
POST /mutil_agent/api/v1/strands/supervisor/process              # Process with supervisor
POST /mutil_agent/api/v1/strands/supervisor/process-with-file    # Process with file upload
```

### Pure Strands Interface
```
POST /mutil_agent/api/v1/pure-strands/process      # Process request (v1)
GET  /mutil_agent/api/v1/pure-strands/status       # Status check (v1)
POST /mutil_agent/api/pure-strands/process         # Process request (legacy)
GET  /mutil_agent/api/pure-strands/status          # Status check (legacy)
```

**Request Body (multipart/form-data):**
```json
{
  "message": "Your request message",
  "file": "<optional file upload>",
  "conversation_id": "session_id",
  "context": "{\"key\": \"value\"}"
}
```

---

## 📄 Document Intelligence APIs

### Document Processing
```
POST /mutil_agent/api/v1/compliance/document       # Validate document file
```

**Request (multipart/form-data):**
- `file`: Document file (PDF, DOCX, etc.)
- `document_type`: Optional document type

---

## ✅ Compliance & Validation APIs

### Compliance Validation
```
POST /mutil_agent/api/v1/compliance/validate       # Validate text content
GET  /mutil_agent/api/v1/compliance/types          # Get document types
GET  /mutil_agent/api/v1/compliance/health         # Compliance service health
```

**Request Body:**
```json
{
  "text": "Document text content",
  "document_type": "letter_of_credit"
}
```

### UCP 600 Knowledge Base
```
POST /mutil_agent/api/v1/compliance/query          # Query UCP 600 regulations
```

**Request Body:**
```json
{
  "query": "What are the requirements for LC documents?"
}
```

---

## 🎯 Risk Assessment APIs

### Risk Analysis
```
POST /mutil_agent/api/v1/risk/assess               # Assess risk (JSON)
POST /mutil_agent/api/v1/risk/assess-file          # Assess risk with file
GET  /mutil_agent/api/v1/risk/health               # Risk service health
```

**Request Body (assess):**
```json
{
  "applicant_name": "Company Name",
  "business_type": "Manufacturing",
  "requested_amount": 1000000,
  "currency": "VND",
  "loan_term": 36,
  "loan_purpose": "Working capital",
  "assessment_type": "credit",
  "collateral_type": "Real estate",
  "financials": {},
  "market_data": {}
}
```

**Request Body (assess-file - multipart/form-data):**
- `file`: Financial document
- `applicant_name`: Applicant name
- `business_type`: Business type
- `requested_amount`: Loan amount
- `currency`: Currency code
- `loan_term`: Term in months
- `loan_purpose`: Purpose
- `assessment_type`: Assessment type
- `collateral_type`: Collateral type

### Risk Monitoring
```
GET  /mutil_agent/api/v1/risk/monitor/{entity_id}           # Monitor entity risk
GET  /mutil_agent/api/v1/risk/score/history/{entity_id}     # Risk score history
GET  /mutil_agent/api/v1/risk/market-data                   # Get market data
POST /mutil_agent/api/v1/risk/alert/webhook                 # Risk alert webhook
```

---

## 📚 Knowledge Base APIs

### Document Management
```
POST /mutil_agent/api/v1/knowledge/documents        # Add document (JSON)
POST /mutil_agent/api/v1/knowledge/documents/upload # Upload document file
GET  /mutil_agent/api/v1/knowledge/categories       # List categories
GET  /mutil_agent/api/v1/knowledge/stats            # Knowledge base stats
GET  /mutil_agent/api/v1/knowledge/health           # Knowledge service health
```

**Add Document (JSON):**
```json
{
  "title": "Document Title",
  "content": "Document content",
  "category": "regulations",
  "tags": ["banking", "compliance"],
  "metadata": {}
}
```

**Upload Document (multipart/form-data):**
- `file`: Document file
- `title`: Document title
- `category`: Category
- `tags`: Comma-separated tags

### Knowledge Search
```
POST /mutil_agent/api/v1/knowledge/search          # Search knowledge base
GET  /mutil_agent/api/v1/knowledge/query           # Query knowledge base
```

**Search Request:**
```json
{
  "query": "Search query",
  "limit": 10,
  "category": "regulations"
}
```

---

## 📝 Text Processing APIs

### Text Summarization
```
POST /mutil_agent/api/v1/text/summary              # Summarize text
POST /mutil_agent/api/v1/text/summary/text         # Summarize text (alt)
POST /mutil_agent/api/v1/text/summary/document     # Summarize document file
POST /mutil_agent/api/v1/text/summary/analyze      # Analyze text
GET  /mutil_agent/api/v1/text/summary/types        # Get summary types
GET  /mutil_agent/api/v1/text/summary/health       # Text service health
```

**Summarize Text:**
```json
{
  "text": "Long text content to summarize",
  "summary_type": "general",
  "max_length": 300,
  "language": "vietnamese"
}
```

**Summarize Document (multipart/form-data):**
- `file`: Document file
- `summary_type`: Type (general, bullet_points, key_insights)
- `max_length`: Max words (default: 300)
- `language`: Language (default: vietnamese)
- `max_pages`: Max pages to process

---

## 💬 Conversation APIs

### Chat Interface
```
POST /mutil_agent/api/v1/conversation/chat         # Chat with agents
```

**Request Body:**
```json
{
  "conversation_id": "session_123",
  "user_id": "user_456",
  "message": "Your message here"
}
```

---

## 🔧 Testing APIs

### Quick Health Test
```bash
# Basic health check
curl http://localhost:8080/mutil_agent/public/api/v1/health-check/health

# List all agents
curl http://localhost:8080/mutil_agent/api/v1/agents/list

# Strands agents status
curl http://localhost:8080/mutil_agent/api/v1/strands/agents/status

# Get all endpoints
curl http://localhost:8080/mutil_agent/public/api/v1/endpoints
```

### Test with File Upload
```bash
# Validate document
curl -X POST http://localhost:8080/mutil_agent/api/v1/compliance/document \
  -F "file=@document.pdf" \
  -F "document_type=letter_of_credit"

# Summarize document
curl -X POST http://localhost:8080/mutil_agent/api/v1/text/summary/document \
  -F "file=@document.pdf" \
  -F "summary_type=general" \
  -F "language=vietnamese"

# Process with Strands
curl -X POST http://localhost:8080/mutil_agent/api/v1/pure-strands/process \
  -F "message=Analyze this document" \
  -F "file=@document.pdf"
```

---

## 📊 Response Formats

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

### Health Response
```json
{
  "status": "healthy",
  "service": "service-name",
  "timestamp": 1234567890,
  "version": "1.0.0",
  "features": {
    "feature1": true,
    "feature2": false
  }
}
```

---

## 🔐 Authentication

Currently, the API does not require authentication for local development. In production, implement:
- JWT tokens via `/auth/login`
- API keys in headers
- Rate limiting per tier

---

## 📈 Rate Limits

- **Standard**: 1,000 requests/hour
- **Premium**: 10,000 requests/hour
- **Enterprise**: Unlimited with SLA

---

## 🌐 CORS

CORS is enabled for local development. Configure allowed origins in production.

---

## 📖 Additional Resources

- **Interactive API Docs**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc
- **OpenAPI Spec**: http://localhost:8080/openapi.json
- **Frontend**: http://localhost:3000

---

## 🚀 Quick Start Examples

### 1. Check System Health
```bash
curl http://localhost:8080/mutil_agent/public/api/v1/health-check/health | jq
```

### 2. List Available Agents
```bash
curl http://localhost:8080/mutil_agent/api/v1/agents/list | jq
```

### 3. Process with Strands Supervisor
```bash
curl -X POST http://localhost:8080/mutil_agent/api/v1/strands/supervisor/process \
  -H "Content-Type: application/json" \
  -d '{"user_request": "What are the UCP 600 requirements?"}' | jq
```

### 4. Validate Compliance
```bash
curl -X POST http://localhost:8080/mutil_agent/api/v1/compliance/validate \
  -H "Content-Type: application/json" \
  -d '{"text": "Letter of Credit content", "document_type": "letter_of_credit"}' | jq
```

### 5. Assess Risk
```bash
curl -X POST http://localhost:8080/mutil_agent/api/v1/risk/assess \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "ABC Company",
    "business_type": "Manufacturing",
    "requested_amount": 5000000,
    "currency": "VND",
    "loan_term": 24,
    "loan_purpose": "Equipment purchase",
    "assessment_type": "credit",
    "collateral_type": "Equipment"
  }' | jq
```

---

**Last Updated**: 2025-11-05
**API Version**: 1.0.0
**Service**: VPBank K-MULT Agent Studio
