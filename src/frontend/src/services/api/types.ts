// Shared API Types and Interfaces

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Text Summarization Types
export interface SummaryRequest {
  text: string;
  summary_type?: 'general' | 'bullet_points' | 'key_insights' | 'executive_summary' | 'detailed';
  max_length?: number;
  language?: 'vietnamese' | 'english';
}

export interface SummaryResponse {
  summary: string;
  summary_type: string;
  language: string;
  original_length: number;
  summary_length: number;
  compression_ratio: number;
  word_count: {
    original: number;
    summary: number;
  };
  processing_time: number;
  model_used: string;
  document_analysis: {
    document_category: string;
    recommendations: {
      suggested_types: string[];
      note: string;
    };
  };
}

// Conversation Types
export interface ConversationRequest {
  user_id: string;
  message?: string;
  conversation_id?: string;
}

export interface ConversationResponse {
  conversation_id: string;
  message?: string;
  response?: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: number;
  version: string;
  features: {
    text_summary: boolean;
    s3_integration: boolean;
    knowledge_base: boolean;
  };
}

// Credit Assessment Types
export interface CreditAssessmentRequest {
  applicant_name: string;
  business_type: string;
  requested_amount: string;
  currency: string;
  loan_term: string;
  loan_purpose: string;
  assessment_type: string;
  collateral_type: string;
}

export interface CreditAssessmentResult {
  applicantName: string;
  creditScore: number;
  riskRating: string;
  recommendation: string;
  confidence: number;
  maxLoanAmount: number;
  interestRate: number;
  riskFactors: Array<{
    name: string;
    value: number;
    status: string;
  }>;
  financialMetrics: {
    debtToEquity: number;
    currentRatio: number;
    returnOnAssets: number;
    cashFlow: string;
  };
  complianceChecks: {
    kyc: string;
    aml: string;
    creditBureau: string;
    blacklist: string;
  };
}
