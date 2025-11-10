"""
BFSI Security Middleware
Implements security controls for banking applications
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable, Dict, Optional
import time
import re
import logging
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware to prevent DoS attacks
    BFSI Critical: Protects against automated attacks
    """

    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_counts: Dict[str, list] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable):
        client_ip = self._get_client_ip(request)
        current_time = time.time()

        # Clean old requests
        self.request_counts[client_ip] = [
            req_time for req_time in self.request_counts[client_ip]
            if current_time - req_time < 60
        ]

        # Check rate limit
        if len(self.request_counts[client_ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": "Too many requests. Please try again later.",
                    "retry_after": 60
                }
            )

        # Add current request
        self.request_counts[client_ip].append(current_time)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.requests_per_minute - len(self.request_counts[client_ip])
        )

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses
    OWASP Best Practices & BFSI Compliance
    """

    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)

        # Security headers (OWASP)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # Remove server information
        response.headers["Server"] = ""

        return response


class InputValidationMiddleware(BaseHTTPMiddleware):
    """
    Input validation and sanitization middleware
    Prevents SQL Injection, XSS, and other injection attacks
    """

    # Suspicious patterns (SQL Injection, XSS)
    SQL_INJECTION_PATTERNS = [
        r"(\bUNION\b.*\bSELECT\b)",
        r"(\bSELECT\b.*\bFROM\b.*\bWHERE\b)",
        r"(;\s*DROP\s+TABLE)",
        r"(;\s*DELETE\s+FROM)",
        r"(--|\#|\/\*|\*\/)",
        r"(\bOR\b\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+)",
        r"(\bAND\b\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+)",
    ]

    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe",
        r"<object",
        r"<embed",
    ]

    async def dispatch(self, request: Request, call_next: Callable):
        # Check query parameters
        if request.query_params:
            for key, value in request.query_params.items():
                if self._is_suspicious(value):
                    logger.warning(f"Suspicious input detected in query param '{key}': {value}")
                    return JSONResponse(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        content={"error": "Invalid input detected"}
                    )

        response = await call_next(request)
        return response

    def _is_suspicious(self, value: str) -> bool:
        """Check if input contains suspicious patterns"""
        value_upper = value.upper()

        # Check SQL injection patterns
        for pattern in self.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_upper, re.IGNORECASE):
                return True

        # Check XSS patterns
        for pattern in self.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True

        return False


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """
    Audit logging middleware for BFSI compliance
    PCI DSS Requirement 10: Track and monitor all access
    """

    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()

        # Generate request ID
        request_id = hashlib.sha256(
            f"{request.client.host}{start_time}".encode()
        ).hexdigest()[:16]

        # Log request
        logger.info(
            f"[AUDIT] Request ID: {request_id} | "
            f"Method: {request.method} | "
            f"Path: {request.url.path} | "
            f"Client: {request.client.host} | "
            f"User-Agent: {request.headers.get('user-agent', 'Unknown')}"
        )

        try:
            response = await call_next(request)

            # Calculate request duration
            duration = time.time() - start_time

            # Log response
            logger.info(
                f"[AUDIT] Request ID: {request_id} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration:.3f}s"
            )

            # Add request ID to response headers for tracing
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            logger.error(
                f"[AUDIT] Request ID: {request_id} | "
                f"Error: {str(e)} | "
                f"Type: {type(e).__name__}"
            )
            raise


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """
    CSRF (Cross-Site Request Forgery) protection
    Critical for BFSI applications
    """

    SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

    async def dispatch(self, request: Request, call_next: Callable):
        # Skip CSRF check for safe methods
        if request.method in self.SAFE_METHODS:
            return await call_next(request)

        # Check CSRF token
        csrf_token_header = request.headers.get("X-CSRF-Token")
        csrf_token_cookie = request.cookies.get("csrf_token")

        if not csrf_token_header or not csrf_token_cookie:
            logger.warning(f"CSRF token missing for {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "CSRF token missing"}
            )

        if csrf_token_header != csrf_token_cookie:
            logger.warning(f"CSRF token mismatch for {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "CSRF token invalid"}
            )

        return await call_next(request)


class IPWhitelistMiddleware(BaseHTTPMiddleware):
    """
    IP whitelisting for admin endpoints
    Additional security layer for BFSI
    """

    def __init__(self, app, whitelist: list, protected_paths: list):
        super().__init__(app)
        self.whitelist = whitelist
        self.protected_paths = protected_paths

    async def dispatch(self, request: Request, call_next: Callable):
        # Check if path is protected
        if any(request.url.path.startswith(path) for path in self.protected_paths):
            client_ip = self._get_client_ip(request)

            if not self._is_whitelisted(client_ip):
                logger.warning(f"Unauthorized IP access attempt: {client_ip} to {request.url.path}")
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"error": "Access denied"}
                )

        return await call_next(request)

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host

    def _is_whitelisted(self, ip: str) -> bool:
        """Check if IP is in whitelist"""
        # Simple implementation - should use CIDR matching in production
        return ip in self.whitelist or not self.whitelist
