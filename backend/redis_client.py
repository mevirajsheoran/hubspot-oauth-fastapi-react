"""
Redis Client Module
==================

This module provides asynchronous Redis operations for the Pipeline AI Integration service.
It handles caching of OAuth states, credentials, and temporary data with proper error handling.
"""

import os
import logging
from typing import Optional, Any
import redis.asyncio as redis
from kombu.utils.url import safequote

# Configure logging
logger = logging.getLogger(__name__)

# Redis configuration
redis_host = safequote(os.environ.get('REDIS_HOST', 'localhost'))
redis_port = int(os.environ.get('REDIS_PORT', 6379))
redis_db = int(os.environ.get('REDIS_DB', 0))
redis_password = os.environ.get('REDIS_PASSWORD')

# Initialize Redis client
redis_client = redis.Redis(
    host=redis_host, 
    port=redis_port, 
    db=redis_db,
    password=redis_password,
    decode_responses=True
)


async def add_key_value_redis(key: str, value: str, expire: Optional[int] = None) -> bool:
    """
    Store a key-value pair in Redis with optional expiration.
    
    Args:
        key: Redis key
        value: Value to store (will be converted to string)
        expire: Optional expiration time in seconds
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        await redis_client.set(key, value)
        if expire:
            await redis_client.expire(key, expire)
        logger.debug(f"Successfully stored key: {key}")
        return True
    except Exception as e:
        logger.error(f"Error storing key {key}: {str(e)}")
        return False


async def get_value_redis(key: str) -> Optional[str]:
    """
    Retrieve a value from Redis by key.
    
    Args:
        key: Redis key
        
    Returns:
        Optional[str]: Value if found, None otherwise
    """
    try:
        value = await redis_client.get(key)
        logger.debug(f"Retrieved key: {key}, found: {value is not None}")
        return value
    except Exception as e:
        logger.error(f"Error retrieving key {key}: {str(e)}")
        return None


async def delete_key_redis(key: str) -> bool:
    """
    Delete a key from Redis.
    
    Args:
        key: Redis key to delete
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        result = await redis_client.delete(key)
        logger.debug(f"Deleted key: {key}, success: {result > 0}")
        return result > 0
    except Exception as e:
        logger.error(f"Error deleting key {key}: {str(e)}")
        return False
