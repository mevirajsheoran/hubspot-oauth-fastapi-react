"""
Integration Item Module
=======================

This module defines the IntegrationItem class, which represents a standardized
data structure for items retrieved from various integration platforms (Airtable, Notion, HubSpot).
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass


@dataclass
class IntegrationItem:
    """
    A standardized representation of an item from any integration platform.
    
    This class provides a unified interface for handling different types of data
    from various platforms like Airtable bases, Notion pages, or HubSpot objects.
    """
    
    # Core identification
    id: Optional[str] = None
    type: Optional[str] = None
    name: Optional[str] = None
    
    # Hierarchical information
    directory: bool = False
    parent_path_or_name: Optional[str] = None
    parent_id: Optional[str] = None
    children: Optional[List[str]] = None
    
    # Metadata
    creation_time: Optional[datetime] = None
    last_modified_time: Optional[datetime] = None
    url: Optional[str] = None
    mime_type: Optional[str] = None
    
    # Platform-specific fields
    delta: Optional[str] = None
    drive_id: Optional[str] = None
    visibility: Optional[bool] = True
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the IntegrationItem to a dictionary representation.
        
        Returns:
            Dict[str, Any]: Dictionary representation of the item
        """
        result = {}
        for key, value in self.__dict__.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            else:
                result[key] = value
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'IntegrationItem':
        """
        Create an IntegrationItem from a dictionary.
        
        Args:
            data: Dictionary containing item data
            
        Returns:
            IntegrationItem: New instance populated with data
        """
        # Convert ISO datetime strings back to datetime objects
        if 'creation_time' in data and isinstance(data['creation_time'], str):
            try:
                data['creation_time'] = datetime.fromisoformat(data['creation_time'])
            except ValueError:
                data['creation_time'] = None
                
        if 'last_modified_time' in data and isinstance(data['last_modified_time'], str):
            try:
                data['last_modified_time'] = datetime.fromisoformat(data['last_modified_time'])
            except ValueError:
                data['last_modified_time'] = None
        
        return cls(**data)
    
    def __str__(self) -> str:
        """String representation of the IntegrationItem."""
        return f"IntegrationItem(id={self.id}, type={self.type}, name={self.name})"
    
    def __repr__(self) -> str:
        """Detailed string representation of the IntegrationItem."""
        return (f"IntegrationItem(id={self.id!r}, type={self.type!r}, name={self.name!r}, "
                f"parent_id={self.parent_id!r}, directory={self.directory})")


# Backward compatibility - maintain the original class structure
class IntegrationItemLegacy(IntegrationItem):
    """
    Legacy version of IntegrationItem for backward compatibility.
    This maintains the original constructor-based initialization.
    """
    
    def __init__(
        self,
        id: Optional[str] = None,
        type: Optional[str] = None,
        directory: bool = False,
        parent_path_or_name: Optional[str] = None,
        parent_id: Optional[str] = None,
        name: Optional[str] = None,
        creation_time: Optional[datetime] = None,
        last_modified_time: Optional[datetime] = None,
        url: Optional[str] = None,
        children: Optional[List[str]] = None,
        mime_type: Optional[str] = None,
        delta: Optional[str] = None,
        drive_id: Optional[str] = None,
        visibility: Optional[bool] = True,
    ):
        super().__init__(
            id=id,
            type=type,
            name=name,
            directory=directory,
            parent_path_or_name=parent_path_or_name,
            parent_id=parent_id,
            children=children,
            creation_time=creation_time,
            last_modified_time=last_modified_time,
            url=url,
            mime_type=mime_type,
            delta=delta,
            drive_id=drive_id,
            visibility=visibility
        )
