// Credit Assessment API
import { API_PREFIX, API_BASE_URL } from './config';
import type { ApiResponse, CreditAssessmentRequest, CreditAssessmentResult } from './types';

export const creditAPI = {
  assessCreditWithFile: async (
    form: CreditAssessmentRequest,
    files: File[]
  ): Promise<ApiResponse<CreditAssessmentResult>> => {
    const formData = new FormData();

    if (files && files.length > 0) {
      formData.append('file', files[0]);
    }

    formData.append('applicant_name', form.applicant_name);
    formData.append('business_type', form.business_type);
    formData.append('requested_amount', String(parseFloat(form.requested_amount)));
    formData.append('currency', form.currency);
    formData.append('loan_term', String(parseInt(form.loan_term)));
    formData.append('loan_purpose', form.loan_purpose);
    formData.append('assessment_type', form.assessment_type);
    formData.append('collateral_type', form.collateral_type);

    try {
      const url = `${API_BASE_URL}${API_PREFIX}/risk/assess-file`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        return { status: 'success', data: data.data };
      } else {
        throw new Error(data.message || 'Assessment failed');
      }
    } catch (error) {
      // Fallback mock data
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {
          applicantName: form.applicant_name,
          creditScore: Math.floor(Math.random() * 300) + 400,
          riskRating: 'B+',
          recommendation: 'Cần đánh giá thêm thông tin từ tài liệu đính kèm',
          confidence: Math.floor(Math.random() * 40) + 60,
          maxLoanAmount: parseFloat(form.requested_amount) * 0.8,
          interestRate: 12.5 + Math.random() * 5,
          riskFactors: [
            { name: 'Financial Health', value: 85, status: 'good' },
            { name: 'Industry Risk', value: 70, status: 'moderate' },
            { name: 'Management Quality', value: 90, status: 'excellent' },
            { name: 'Market Position', value: 75, status: 'good' },
            { name: 'Collateral Value', value: 95, status: 'excellent' }
          ],
          financialMetrics: {
            debtToEquity: 0.65,
            currentRatio: 1.8,
            returnOnAssets: 12.5,
            cashFlow: 'Positive'
          },
          complianceChecks: {
            kyc: 'Passed',
            aml: 'Passed',
            creditBureau: 'Passed',
            blacklist: 'Clear'
          }
        }
      };
    }
  }
};
