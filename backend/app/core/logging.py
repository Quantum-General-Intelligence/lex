"""Structured logging utilities for the Lex application."""

import time
import uuid
from collections.abc import Callable
from functools import wraps
from typing import Any

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs all HTTP requests with timing and context."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate a unique request ID for tracing
        request_id = str(uuid.uuid4())[:8]

        # Bind request context to logger
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        start_time = time.perf_counter()

        # Log request
        logger.info(
            "request_started",
            query_params=dict(request.query_params),
            client_host=request.client.host if request.client else None,
        )

        try:
            response = await call_next(request)
            elapsed_ms = (time.perf_counter() - start_time) * 1000

            # Log response
            logger.info(
                "request_completed",
                status_code=response.status_code,
                elapsed_ms=round(elapsed_ms, 2),
            )

            # Add request ID to response headers for client-side debugging
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "request_failed",
                error=str(e),
                error_type=type(e).__name__,
                elapsed_ms=round(elapsed_ms, 2),
            )
            raise


def log_endpoint(operation: str):
    """
    Decorator for logging endpoint execution with structured context.

    Usage:
        @router.get("/nodes")
        @log_endpoint("list_nodes")
        async def list_nodes(...):
            ...
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Log operation start with parameters
            logger.info(
                f"{operation}_started",
                params={k: v for k, v in kwargs.items() if v is not None},
            )

            start_time = time.perf_counter()

            try:
                result = await func(*args, **kwargs)
                elapsed_ms = (time.perf_counter() - start_time) * 1000

                # Log success with result summary
                result_summary = _summarize_result(result)
                logger.info(
                    f"{operation}_completed",
                    elapsed_ms=round(elapsed_ms, 2),
                    **result_summary,
                )

                return result

            except Exception as e:
                elapsed_ms = (time.perf_counter() - start_time) * 1000
                logger.error(
                    f"{operation}_failed",
                    error=str(e),
                    error_type=type(e).__name__,
                    elapsed_ms=round(elapsed_ms, 2),
                )
                raise

        return wrapper

    return decorator


def _summarize_result(result: Any) -> dict:
    """Create a summary of the result for logging (avoid logging full payloads)."""
    if isinstance(result, dict):
        summary = {}
        if "nodes" in result:
            summary["node_count"] = len(result["nodes"])
        if "relationships" in result:
            summary["relationship_count"] = len(result["relationships"])
        if "query_time_ms" in result:
            summary["query_time_ms"] = result["query_time_ms"]
        return summary
    elif isinstance(result, list):
        return {"result_count": len(result)}
    else:
        return {}
