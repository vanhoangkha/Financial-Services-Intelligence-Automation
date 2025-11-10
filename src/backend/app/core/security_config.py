"""
BFSI Security Configuration
Implements security best practices for Banking, Financial Services, and Insurance applications
"""
from typing import List, Dict
from pydantic import BaseModel, Field
from functools import lru_cache
import os


class SecuritySettings(BaseModel):
    """BFSI Security Configuration Settings"""

    # SSL/TLS Configuration (PCI DSS Requirement 4)
    VERIFY_HTTPS: bool = Field(default=True, description="Always verify HTTPS certificates in production")
    TLS_MIN_VERSION: str = Field(default="TLSv1.2", description="Minimum TLS version (PCI DSS compliant)")
    ENABLE_CERTIFICATE_PINNING: bool = Field(default=True, description="Enable certificate pinning")

    # CORS Configuration (Security Best Practice)
    CORS_ALLOWED_ORIGINS: List[str] = Field(
        default_factory=lambda: os.getenv("CORS_ALLOWED_ORIGINS", "").split(","),
        description="Specific allowed origins (never use *)"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, description="Allow credentials in CORS")
    CORS_MAX_AGE: int = Field(default=600, description="CORS preflight cache duration")

    # Authentication & Authorization (PCI DSS Requirement 8)
    JWT_SECRET_KEY: str = Field(default_factory=lambda: os.getenv("JWT_SECRET_KEY", ""), description="JWT signing key")
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15, description="Access token expiration")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, description="Refresh token expiration")
    REQUIRE_MFA: bool = Field(default=True, description="Require multi-factor authentication")

    # Rate Limiting (DoS Protection)
    RATE_LIMIT_ENABLED: bool = Field(default=True, description="Enable rate limiting")
    RATE_LIMIT_REQUESTS: int = Field(default=100, description="Max requests per window")
    RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, description="Rate limit window")
    RATE_LIMIT_STRICT_MODE: bool = Field(default=True, description="Strict rate limiting for BFSI")

    # File Upload Security
    MAX_FILE_SIZE_MB: int = Field(default=10, description="Maximum file upload size")
    ALLOWED_FILE_EXTENSIONS: List[str] = Field(
        default=[".pdf", ".jpg", ".jpeg", ".png", ".docx", ".xlsx"],
        description="Allowed file extensions for uploads"
    )
    SCAN_UPLOADS_FOR_MALWARE: bool = Field(default=True, description="Enable malware scanning")

    # Input Validation
    MAX_INPUT_LENGTH: int = Field(default=10000, description="Maximum input length")
    ENABLE_SQL_INJECTION_PROTECTION: bool = Field(default=True, description="SQL injection protection")
    ENABLE_XSS_PROTECTION: bool = Field(default=True, description="XSS protection")
    ENABLE_CSRF_PROTECTION: bool = Field(default=True, description="CSRF protection")

    # Data Encryption (PCI DSS Requirement 3)
    ENCRYPTION_ALGORITHM: str = Field(default="AES-256-GCM", description="Encryption algorithm")
    ENABLE_DATA_AT_REST_ENCRYPTION: bool = Field(default=True, description="Encrypt data at rest")
    ENABLE_FIELD_LEVEL_ENCRYPTION: bool = Field(default=True, description="Encrypt sensitive fields")

    # Security Headers (OWASP)
    ENABLE_SECURITY_HEADERS: bool = Field(default=True, description="Enable security headers")
    SECURITY_HEADERS: Dict[str, str] = Field(
        default={
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
    )

    # Logging & Monitoring (PCI DSS Requirement 10)
    ENABLE_SECURITY_LOGGING: bool = Field(default=True, description="Enable security event logging")
    LOG_SENSITIVE_DATA: bool = Field(default=False, description="Never log sensitive data")
    ENABLE_AUDIT_TRAIL: bool = Field(default=True, description="Enable audit trail")
    LOG_RETENTION_DAYS: int = Field(default=365, description="Log retention period (1 year minimum for BFSI)")

    # Session Management
    SESSION_TIMEOUT_MINUTES: int = Field(default=15, description="Session timeout")
    ENABLE_SESSION_FIXATION_PROTECTION: bool = Field(default=True, description="Session fixation protection")
    ENABLE_CONCURRENT_SESSION_LIMIT: bool = Field(default=True, description="Limit concurrent sessions")
    MAX_CONCURRENT_SESSIONS: int = Field(default=1, description="Max concurrent sessions per user")

    # API Security
    ENABLE_API_KEY_ROTATION: bool = Field(default=True, description="Enable API key rotation")
    API_KEY_ROTATION_DAYS: int = Field(default=90, description="API key rotation period")
    ENABLE_REQUEST_SIGNING: bool = Field(default=True, description="Enable request signing")

    # Compliance
    PCI_DSS_COMPLIANCE_MODE: bool = Field(default=True, description="PCI DSS compliance mode")
    GDPR_COMPLIANCE_MODE: bool = Field(default=True, description="GDPR compliance mode")
    DATA_RESIDENCY_REGION: str = Field(default="ap-southeast-1", description="Data residency region")

    # AWS Security
    AWS_KMS_ENABLED: bool = Field(default=True, description="Use AWS KMS for encryption")
    AWS_SECRETS_MANAGER_ENABLED: bool = Field(default=True, description="Use AWS Secrets Manager")
    AWS_CLOUDTRAIL_ENABLED: bool = Field(default=True, description="Enable CloudTrail logging")

    # Database Security
    DB_SSL_MODE: str = Field(default="require", description="Database SSL mode")
    DB_CONNECTION_ENCRYPTION: bool = Field(default=True, description="Encrypt DB connections")
    ENABLE_SQL_QUERY_LOGGING: bool = Field(default=True, description="Log SQL queries for audit")

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_security_settings() -> SecuritySettings:
    """Get cached security settings"""
    return SecuritySettings()


# Security validation rules for BFSI
SENSITIVE_FIELD_PATTERNS = [
    r'\b\d{13,19}\b',  # Credit card numbers
    r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
    r'\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b',  # IBAN
    r'\b\d{9,18}\b',  # Bank account numbers
]

# Password policy (PCI DSS compliant)
PASSWORD_POLICY = {
    "min_length": 12,
    "require_uppercase": True,
    "require_lowercase": True,
    "require_digits": True,
    "require_special": True,
    "max_age_days": 90,
    "min_unique_passwords": 4,
    "prevent_common": True,
    "lockout_attempts": 5,
    "lockout_duration_minutes": 30
}

# Allowed IP ranges for admin access (example - should be configured)
ADMIN_IP_WHITELIST = [
    # Add your admin IP ranges here
    # "192.168.1.0/24",
    # "10.0.0.0/8",
]

# Sensitive data fields that require encryption
ENCRYPTED_FIELDS = [
    "account_number",
    "card_number",
    "cvv",
    "pin",
    "ssn",
    "tax_id",
    "passport_number",
    "driver_license",
    "bank_routing_number",
    "swift_code",
    "iban"
]

# API endpoints that require additional security
HIGH_RISK_ENDPOINTS = [
    "/api/v1/transactions",
    "/api/v1/accounts",
    "/api/v1/transfers",
    "/api/v1/payments",
    "/api/v1/cards",
    "/api/v1/auth/login",
    "/api/v1/users/profile"
]
