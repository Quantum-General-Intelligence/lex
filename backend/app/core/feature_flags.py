"""Feature flags for safe rollout of new functionality.

Feature flags allow you to:
1. Deploy code without enabling it (dark launch)
2. Enable features for specific users/environments
3. Quickly disable a feature if it causes problems
4. A/B test different implementations

Usage:
    from app.core.feature_flags import is_enabled, FeatureFlag

    if is_enabled(FeatureFlag.ENHANCED_SEARCH):
        # New code path
        results = enhanced_search(query)
    else:
        # Safe default
        results = basic_search(query)
"""

import os
from enum import Enum

import structlog

logger = structlog.get_logger()


class FeatureFlag(str, Enum):
    """Available feature flags.

    Naming convention: FEATURE_NAME
    Each flag should have a docstring explaining what it controls.
    """

    # Search & RAG features
    ENHANCED_SEARCH = "enhanced_search"
    """Enable semantic search with re-ranking. Default: False"""

    CHAIN_OF_THOUGHT = "chain_of_thought"
    """Include reasoning steps in RAG responses. Default: True"""

    GRAPH_CACHING = "graph_caching"
    """Cache graph query results in Redis. Default: False"""

    # Experimental features
    AUTHORITY_CHAIN_V2 = "authority_chain_v2"
    """Use new authority chain algorithm. Default: False"""

    STREAMING_RESPONSES = "streaming_responses"
    """Enable streaming LLM responses. Default: False"""

    # Audit & compliance
    AUDIT_LOGGING = "audit_logging"
    """Log all queries for audit trail. Default: True"""


# Default values for each flag (safe defaults)
_DEFAULTS: dict[FeatureFlag, bool] = {
    FeatureFlag.ENHANCED_SEARCH: False,  # Safe: use basic search
    FeatureFlag.CHAIN_OF_THOUGHT: True,  # Safe: more transparency is good
    FeatureFlag.GRAPH_CACHING: False,  # Safe: no caching, always fresh
    FeatureFlag.AUTHORITY_CHAIN_V2: False,  # Safe: use proven algorithm
    FeatureFlag.STREAMING_RESPONSES: False,  # Safe: use standard responses
    FeatureFlag.AUDIT_LOGGING: True,  # Safe: always audit by default
}


def is_enabled(flag: FeatureFlag, default: bool | None = None) -> bool:
    """
    Check if a feature flag is enabled.

    Resolution order:
    1. Environment variable (FEATURE_FLAG_<NAME>=true/false)
    2. Provided default parameter
    3. Built-in default from _DEFAULTS

    Args:
        flag: The feature flag to check
        default: Optional override for the default value

    Returns:
        True if the feature is enabled, False otherwise

    Example:
        # Check with built-in default
        if is_enabled(FeatureFlag.ENHANCED_SEARCH):
            ...

        # Override default for this check
        if is_enabled(FeatureFlag.STREAMING_RESPONSES, default=True):
            ...
    """
    env_var = f"FEATURE_FLAG_{flag.value.upper()}"
    env_value = os.getenv(env_var)

    if env_value is not None:
        enabled = env_value.lower() in ("true", "1", "yes", "on")
        logger.debug(
            "feature_flag_checked",
            flag=flag.value,
            enabled=enabled,
            source="environment",
        )
        return enabled

    # Use provided default or fall back to built-in default
    enabled = default if default is not None else _DEFAULTS.get(flag, False)

    logger.debug(
        "feature_flag_checked",
        flag=flag.value,
        enabled=enabled,
        source="default",
    )

    return enabled


def get_all_flags() -> dict[str, bool]:
    """Get the current state of all feature flags.

    Useful for debugging and admin endpoints.
    """
    return {flag.value: is_enabled(flag) for flag in FeatureFlag}
