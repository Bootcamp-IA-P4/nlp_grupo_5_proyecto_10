import React, { useState } from 'react';

const MessageFilters = ({ onFiltersChange, onClear }) => {
  const [filters, setFilters] = useState({
    sentiment: '',
    source: '',
    confidence_min: '',
    confidence_max: '',
    search_text: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      sentiment: '',
      source: '',
      confidence_min: '',
      confidence_max: '',
      search_text: ''
    };
    setFilters(clearedFilters);
    onClear();
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '20px', 
      marginBottom: '20px', 
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3>🔍 Filters</h3>
      
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <label><strong>Search Text:</strong></label><br/>
          <input
            type="text"
            placeholder="Search in messages..."
            value={filters.search_text}
            onChange={(e) => handleFilterChange('search_text', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
          />
        </div>

        <div>
          <label><strong>Sentiment:</strong></label><br/>
          <select
            value={filters.sentiment}
            onChange={(e) => handleFilterChange('sentiment', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Sentiments</option>
            <option value="toxic">🔴 Toxic</option>
            <option value="not toxic">🟢 Not Toxic</option>
          </select>
        </div>

        <div>
          <label><strong>Source:</strong></label><br/>
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Sources</option>
            <option value="youtube">📺 YouTube</option>
            <option value="manual">✍️ Manual</option>
          </select>
        </div>

        <div>
          <label><strong>Min Confidence:</strong></label><br/>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            placeholder="0.0"
            value={filters.confidence_min}
            onChange={(e) => handleFilterChange('confidence_min', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
          />
        </div>

        <div>
          <label><strong>Max Confidence:</strong></label><br/>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            placeholder="1.0"
            value={filters.confidence_max}
            onChange={(e) => handleFilterChange('confidence_max', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
          />
        </div>

        <div>
          <button 
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageFilters;
        <div className="filter-group">
          <button onClick={handleClear} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageFilters;
