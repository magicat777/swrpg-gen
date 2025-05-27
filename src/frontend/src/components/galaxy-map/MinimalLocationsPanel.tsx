import React, { useState, useEffect } from 'react';

interface Location {
  id: string;
  name: string;
  type: string;
  region: string;
  climate: string;
  terrain: string;
  description: string;
}

interface MinimalLocationsPanelProps {
  selectedLocationId?: string;
  onLocationSelect: (location: Location) => void;
  onLocationView: (location: Location) => void;
}

const MinimalLocationsPanel: React.FC<MinimalLocationsPanelProps> = ({
  selectedLocationId,
  onLocationSelect,
  onLocationView
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('http://localhost:3000/api/world/locations');
        
        if (response.ok) {
          const result = await response.json();
          const locationsArray = result.data || result; // Handle both {data: [...]} and [...] formats
          const transformedLocations = locationsArray.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            type: loc.type || 'Planet',
            region: loc.region || 'Unknown',
            climate: loc.climate || 'Unknown',
            terrain: loc.terrain || 'Unknown',
            description: loc.description || 'No description available.'
          }));
          setLocations(transformedLocations);
        } else {
          setError(`API Error: ${response.status}`);
        }
      } catch (err) {
        setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerStyle: React.CSSProperties = {
    width: '350px',
    background: 'rgba(0, 0, 0, 0.9)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #333',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: '#ffffff'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    margin: '0 0 16px 0'
  };

  const searchStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '16px'
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '60vh'
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.2s'
  };

  const selectedItemStyle: React.CSSProperties = {
    ...itemStyle,
    background: 'rgba(74, 144, 226, 0.2)',
    border: '1px solid rgba(74, 144, 226, 0.5)'
  };

  const statusStyle: React.CSSProperties = {
    marginTop: '16px',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#888888',
    textAlign: 'center'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Galaxy Locations</div>
        <div style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
          Loading locations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Galaxy Locations</div>
        <div style={{ textAlign: 'center', padding: '32px', color: '#ff6b6b' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        Galaxy Locations ({filteredLocations.length})
      </div>
      
      <input
        type="text"
        placeholder="Search locations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={searchStyle}
      />

      <div style={listStyle}>
        {filteredLocations.map((location) => (
          <div
            key={location.id}
            style={selectedLocationId === location.id ? selectedItemStyle : itemStyle}
            onClick={() => onLocationSelect(location)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(74, 144, 226, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = selectedLocationId === location.id ? 
                'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: location.type.toLowerCase() === 'planet' ? '#4A90E2' : 
                         location.type.toLowerCase() === 'moon' ? '#F5A623' : '#E94B3C',
              flexShrink: 0
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
                {location.name}
              </div>
              <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>
                {location.type}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(74, 144, 226, 0.8)' }}>
                {location.region}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLocationView(location);
              }}
              style={{
                padding: '4px 8px',
                background: 'rgba(74, 144, 226, 0.1)',
                border: '1px solid rgba(74, 144, 226, 0.3)',
                borderRadius: '4px',
                color: '#4A90E2',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              View
            </button>
          </div>
        ))}
      </div>

      <div style={statusStyle}>
        Live Database • {locations.length} Canonical Locations
      </div>
    </div>
  );
};

export default MinimalLocationsPanel;