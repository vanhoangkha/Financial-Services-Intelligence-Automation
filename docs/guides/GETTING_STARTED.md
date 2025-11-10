# Getting Started Guide

## 📚 Introduction

Welcome to the Financial Services Intelligence Automation Platform - a production-ready multi-agent AI system for BFSI operations.

## 🎯 Quick Start (5 minutes)

### 1. Prerequisites

```bash
# Check prerequisites
python --version  # Should be 3.11+
node --version    # Should be 18+
docker --version  # Should be 20+
```

### 2. Clone & Setup

```bash
git clone https://github.com/vanhoangkha/Financial-Services-Intelligence-Automation.git
cd Financial-Services-Intelligence-Automation

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Backend Setup

```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd src/frontend
npm install
```

### 5. Database Setup

```bash
# Start PostgreSQL (Docker)
docker run -d \\
  --name postgres \\
  -e POSTGRES_PASSWORD=yourpassword \\
  -e POSTGRES_DB=vpbank_agents \\
  -p 5432:5432 \\
  postgres:14

# Run migrations
cd src/backend
alembic upgrade head
```

### 6. Start Application

```bash
# Terminal 1: Backend
cd src/backend
uvicorn app.main:app --reload --port 8080

# Terminal 2: Frontend
cd src/frontend
npm start
```

Access at: http://localhost:3000

## 🤖 Multi-Agent System Basics

### Understanding Agents

Our system has 5 specialized agents:

1. **Risk Assessment Agent** - Evaluates financial risk
2. **Compliance Agent** - Monitors regulatory compliance
3. **Document Processing Agent** - Extracts data from documents
4. **Customer Service Agent** - Handles customer inquiries
5. **Fraud Detection Agent** - Identifies fraudulent activities

### Agent Communication

Agents communicate via message bus:

```python
from app.multi_agent.agents.communication import MessageBus, AgentMessage

bus = MessageBus()

# Send message between agents
message = AgentMessage(
    from_agent="risk_assessment",
    to_agent="compliance",
    message_type="risk_alert",
    payload={"risk_score": 85}
)

await bus.publish(message)
```

### Using the Orchestrator

```python
from app.multi_agent.agents.base import MultiAgentOrchestrator, Workflow

orchestrator = MultiAgentOrchestrator()

# Register agents
orchestrator.register_agent(risk_agent)
orchestrator.register_agent(compliance_agent)

# Execute workflow
result = await orchestrator.execute_workflow(
    "credit_assessment",
    input_data={"customer_id": "12345"}
)
```

## 📝 Example: Credit Risk Assessment

```python
from app.multi_agent.agents.domain.risk_assessment import RiskAssessmentAgent
from app.multi_agent.agents.base import AgentConfig

# Create agent
config = AgentConfig(
    name="risk_assessment",
    description="Evaluates financial risk"
)
agent = RiskAssessmentAgent(config)

# Execute task
result = await agent.execute({
    "task_id": "task_001",
    "task_type": "credit_risk_assessment",
    "input_data": {
        "customer_data": {
            "customer_id": "12345",
            "account_age_months": 24
        },
        "transaction_data": [
            {"amount": 1000, "type": "deposit"},
            {"amount": -500, "type": "withdrawal"}
        ]
    }
})

print(result)
# {
#     "assessment_type": "credit_risk",
#     "credit_score": 750,
#     "risk_level": "low",
#     "recommendations": ["Monitor account activity"]
# }
```

## 🔐 Security Configuration

### Enable HTTPS

```python
# .env
VERIFY_HTTPS=true
TLS_MIN_VERSION=TLSv1.2
```

### Configure Authentication

```python
# .env
JWT_SECRET_KEY=your-secret-key-min-32-characters
REQUIRE_MFA=true
```

### CORS Settings

```python
# .env
CORS_ALLOWED_ORIGINS=https://yourapp.com,https://admin.yourapp.com
```

## 🧪 Testing

```bash
# Backend tests
cd src/backend
pytest tests/ -v

# Frontend tests
cd src/frontend
npm test
```

## 📊 Monitoring

Access health checks:
- Backend: http://localhost:8080/health
- Agents: http://localhost:8080/health/agents
- Database: http://localhost:8080/health/db

## 🚀 Next Steps

1. Read [Multi-Agent Architecture](../architecture/MULTI_AGENT_ARCHITECTURE.md)
2. Explore [API Documentation](http://localhost:8080/docs)
3. Review [Security Audit](../../SECURITY_AUDIT_REPORT.md)
4. See [Deployment Guide](./DEPLOYMENT.md)

## ❓ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port
uvicorn app.main:app --port 8081
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify connection string
psql postgresql://user:password@localhost:5432/vpbank_agents
```

### Frontend Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

## 💬 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@vpbank.com
