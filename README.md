# Financial Services Intelligence Automation Platform

[![Production Ready](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/vanhoangkha/Financial-Services-Intelligence-Automation)
[![Strands Agent](https://img.shields.io/badge/powered--by-Strands%20Agents-blue.svg)](https://strands.com)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

## 🏦 Overview

Enterprise-grade **Strands Multi-Agent AI System** designed specifically for **Banking, Financial Services, and Insurance (BFSI)** operations. Built on the **Strands Agent Framework**, this platform leverages specialized AI agents to automate financial intelligence tasks, risk assessment, compliance monitoring, and customer service operations.

Powered by **Strands Agents SDK** with security-first architecture to meet stringent regulatory requirements including PCI DSS, GDPR, and banking regulations.

## 🎯 Key Features

### 🤖 Strands Multi-Agent Intelligence
- **Strands Agent Framework**: Production-ready multi-agent orchestration for banking
- **Specialized Banking Agents**: Pre-built agents for financial services use cases
- **Agent Coordination**: Strands-powered agent communication and workflow management
- **Real-time Collaboration**: Agents communicate and share context via Strands message bus
- **Task Distribution**: Intelligent routing with Strands orchestrator

### 📊 Financial Services Capabilities
- **Document Processing**: Automated extraction from financial statements, KYC documents, contracts
- **Risk Assessment**: AI-powered credit risk, market risk, and portfolio analysis
- **Compliance Monitoring**: AML, KYC verification, regulatory compliance checks
- **Customer Service**: Natural language Q&A and intelligent support
- **Fraud Detection**: Real-time anomaly detection and pattern recognition
- **Transaction Monitoring**: Real-time transaction analysis and risk scoring

### 🏗️ Strands Agent Architecture

Our system implements **Strands Agent Framework** with specialized domain agents:

```
┌─────────────────────────────────────────────────┐
│       Strands Agent Orchestrator                │
│  (Multi-Agent Coordination & Workflow)          │
└────────────┬────────────────────────────────────┘
             │
             ├──────────────────────────────────┐
             │                                  │
┌────────────▼────────┐            ┌───────────▼────────┐
│  Compliance Agent   │            │  Risk Agent        │
│  (AML/KYC/Rules)   │            │  (Credit/Market)   │
└────────────┬────────┘            └───────────┬────────┘
             │                                  │
             ├──────────────────────────────────┤
             │                                  │
┌────────────▼────────┐            ┌───────────▼────────┐
│  Document Agent     │            │  Fraud Agent       │
│  (OCR/Extract)     │            │  (Anomaly/Pattern) │
└────────────┬────────┘            └───────────┬────────┘
             │                                  │
             └──────────────┬───────────────────┘
                           │
              ┌────────────▼────────────┐
              │  Supervisor Agent       │
              │  (Task Coordination)    │
              └─────────────────────────┘
```

### 🔧 Strands Agent Types

**Built on Strands Agent SDK:**

1. **Compliance Agent** (`strands-agents`)
   - AML transaction monitoring
   - KYC verification workflows
   - Regulatory rule enforcement
   - Compliance reporting

2. **Risk Assessment Agent** (`strands-agents`)
   - Credit risk scoring
   - Market risk analysis
   - Portfolio risk calculation
   - Risk mitigation recommendations

3. **Document Processing Agent** (`strands-agents-tools`)
   - OCR for financial documents
   - Data extraction and validation
   - Document classification
   - Structured data output

4. **Fraud Detection Agent** (`strands-agents`)
   - Real-time anomaly detection
   - Pattern recognition
   - Risk scoring
   - Alert generation

5. **Supervisor Agent** (`strands-agents`)
   - Multi-agent coordination
   - Workflow orchestration
   - Task routing and distribution
   - Result aggregation

### 🔄 Strands Orchestration Patterns

```bash
# Sequential Processing
Customer Request → Compliance Agent → Risk Agent → Supervisor → Response

# Parallel Processing
Transaction ─┬─→ Compliance Agent ─┐
             ├─→ Fraud Agent ───────┼─→ Supervisor → Decision
             └─→ Risk Agent ────────┘

# Hierarchical Coordination
Supervisor Agent
    ├─→ Document Agent (extract data)
    ├─→ Compliance Agent (validate)
    ├─→ Risk Agent (assess)
    └─→ Aggregator (combine results)
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Strands Agent SDK** (`strands-agents>=0.1.0`)
- **AWS Account** (for Bedrock AI models)
- **PostgreSQL 14+** / **MongoDB**
- **Redis 7+**

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/vanhoangkha/Financial-Services-Intelligence-Automation.git
cd Financial-Services-Intelligence-Automation
```

#### 2. Backend Setup (Strands Agents)
```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Strands Agent Framework + dependencies
pip install -r requirements.txt
pip install strands-agents strands-agents-tools
```

#### 3. Configure Strands Agents
```bash
# Setup environment
cp .env.example .env

# Configure Strands Agent endpoints
export STRANDS_API_KEY="your-strands-api-key"
export AWS_BEDROCK_REGION="us-east-1"
export LANGCHAIN_API_KEY="your-langchain-key"
```

#### 4. Frontend Setup
```bash
cd src/frontend
npm install
npm start
```

#### 5. Start Strands Agent System
```bash
cd src/backend
uvicorn app.multi_agent.main:app --reload --port 8080
```

**Access:**
- Frontend: `http://localhost:3000`
- Strands API: `http://localhost:8080/multi_agent/api/v1/strands`
- Health Check: `http://localhost:8080/health`

## 🔐 Security (BFSI Compliant)

### Enterprise Security Features
- ✅ **SSL/TLS Encryption** (TLS 1.2+)
- ✅ **JWT Authentication** + MFA
- ✅ **Role-Based Access Control** (RBAC)
- ✅ **Input Sanitization** (SQL injection, XSS prevention)
- ✅ **Rate Limiting** (DDoS protection)
- ✅ **Security Headers** (OWASP best practices)
- ✅ **Audit Logging** (PCI DSS compliant)
- ✅ **Data Encryption** (AES-256 at rest)

### Compliance Standards
- ✅ **PCI DSS** - Payment Card Industry Data Security
- ✅ **GDPR** - Data privacy and protection
- ✅ **SOC 2 Type II** - Service organization controls
- ✅ **Banking Regulations** - Regional financial compliance

## 🛠️ Technology Stack

### Backend (Strands Agent System)
- **Framework**: FastAPI 0.115.9
- **Multi-Agent**: **Strands Agents SDK** (`strands-agents`, `strands-agents-tools`)
- **AI/LLM**: LangChain 0.3.19, LangGraph 0.2.74, AWS Bedrock
- **Database**: PostgreSQL 14+, MongoDB, Redis
- **Security**: PyJWT 2.10.1, cryptography 46.0.3, python-jose 3.3.0

### Frontend
- **Framework**: React 19 + TypeScript 5.7
- **UI**: AWS CloudScape Design System
- **State**: React Hooks
- **API**: Axios, WebSocket (Socket.io)

### Infrastructure
- **Cloud**: AWS (ECS, RDS, S3, CloudFront, ALB)
- **IaC**: AWS CDK, Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch, Sentry

## 📡 Strands Agent Endpoints

### Core Agent APIs

```bash
# Compliance Agent
POST /multi_agent/api/v1/strands/compliance/validate
POST /multi_agent/api/v1/strands/compliance/kyc

# Risk Assessment Agent
POST /multi_agent/api/v1/strands/risk/assess
POST /multi_agent/api/v1/strands/risk/credit-score

# Document Processing Agent
POST /multi_agent/api/v1/strands/document/analyze
POST /multi_agent/api/v1/strands/document/extract

# Fraud Detection Agent
POST /multi_agent/api/v1/strands/fraud/detect
POST /multi_agent/api/v1/strands/fraud/score

# Supervisor Agent (Orchestration)
POST /multi_agent/api/v1/strands/supervisor/process
GET  /multi_agent/api/v1/strands/agents/status
```

### Example: Risk Assessment

```bash
curl -X POST http://localhost:8080/multi_agent/api/v1/strands/risk/assess \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "customer_id": "12345",
    "assessment_type": "credit_risk",
    "data": {
      "income": 75000,
      "credit_history": "good",
      "debt_ratio": 0.3
    }
  }'
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ AWS Deployment

```bash
cd deployments/infrastructure/cdk
npm install
cdk bootstrap
cdk deploy --all
```

## 📊 Monitoring & Health Checks

- **Backend Health**: `/health`
- **Agents Status**: `/multi_agent/api/v1/strands/agents/status`
- **Database**: `/health/db`
- **API Docs**: `/docs` (OpenAPI/Swagger)

## 🧪 Testing

```bash
# Backend tests (Strands Agents)
cd src/backend
pytest tests/ -v --cov=app

# Frontend tests
cd src/frontend
npm test
```

## 📈 Performance

- **API Response**: < 100ms (P95)
- **Agent Processing**: < 2s for standard tasks
- **Concurrent Users**: 10,000+ supported
- **Availability**: 99.9% uptime SLA

## 🏆 BFSI Use Cases

1. **Customer Onboarding** - KYC verification, risk assessment
2. **Loan Processing** - Credit scoring, document verification
3. **Compliance Monitoring** - AML, transaction monitoring
4. **Fraud Detection** - Real-time anomaly detection
5. **Customer Support** - AI-powered chat and Q&A

## 📞 Support

- **Email**: support@vpbank.com
- **Documentation**: `/docs`
- **API Reference**: `http://localhost:8080/docs`

## 📄 License

Proprietary - All rights reserved.

---

**Powered by Strands Agent Framework** | *Empowering financial institutions with intelligent automation*
