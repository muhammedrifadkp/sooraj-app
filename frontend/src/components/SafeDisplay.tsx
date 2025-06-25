import React from 'react';

interface SafeDisplayProps {
  value: any;
  defaultValue?: string;
}

/**
 * A component that safely displays any value, preventing the common 
 * "Objects are not valid as React child" error
 */
const SafeDisplay: React.FC<SafeDisplayProps> = ({ value, defaultValue = '' }) => {
  if (value === null || value === undefined) {
    return <>{defaultValue}</>;
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <>{value}</>;
  }
  
  if (typeof value === 'object') {
    // Handle objects that might be directly rendered
    if (value.name && typeof value.name === 'string') {
      return <>{value.name}</>;
    }
    
    // For arrays, join the elements
    if (Array.isArray(value)) {
      return <>{value.map(item => typeof item === 'object' ? 
        JSON.stringify(item) : 
        String(item)).join(', ')}</>;
    }
    
    // For objects, stringify them
    return <>{defaultValue || '[Object]'}</>;
  }
  
  // For functions or symbols or any other type
  return <>{defaultValue || String(value)}</>;
};

export default SafeDisplay; 