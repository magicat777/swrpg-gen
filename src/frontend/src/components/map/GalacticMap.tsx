import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

const MapContainer = styled.div<{ $isFullscreen?: boolean }>`
  position: ${props => props.$isFullscreen ? 'fixed' : 'relative'};
  top: ${props => props.$isFullscreen ? '0' : 'auto'};
  left: ${props => props.$isFullscreen ? '0' : 'auto'};
  width: ${props => props.$isFullscreen ? '100vw' : '100%'};
  height: ${props => props.$isFullscreen ? '100vh' : '600px'};
  background: #0a0a0a;
  border-radius: ${props => props.$isFullscreen ? '0' : '8px'};
  overflow: hidden;
  user-select: none;
  cursor: grab;
  z-index: ${props => props.$isFullscreen ? '9999' : '1'};
  
  &:active {
    cursor: grabbing;
  }
`;

const MapImage = styled.img<{ $scale: number; $translateX: number; $translateY: number }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(${props => props.$scale}) translate(${props => props.$translateX}px, ${props => props.$translateY}px);
  transform-origin: center center;
  transition: transform 0.1s ease-out;
  pointer-events: none;
  display: block;
`;

const MapControls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(30, 30, 30, 0.9);
    border-color: #555;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const MapLegend = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
  color: white;
  font-size: 12px;
  z-index: 10;
`;

const MapInfo = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  border-radius: 6px;
  padding: 8px 12px;
  color: white;
  font-size: 11px;
  z-index: 10;
`;

interface GalacticMapProps {
  className?: string;
}

export const GalacticMap: React.FC<GalacticMapProps> = ({ className }) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - lastMousePos.x) / scale;
      const deltaY = (e.clientY - lastMousePos.y) / scale;
      
      setTranslateX(prev => prev + deltaX);
      setTranslateY(prev => prev + deltaY);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMousePos, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(5, prev * delta)));
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (mapElement) {
        mapElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <MapContainer 
      ref={mapRef}
      className={className}
      $isFullscreen={isFullscreen}
      onMouseDown={handleMouseDown}
    >
      <MapImage
        src="/images/galaxy-map.jpg"
        alt="Star Wars Galaxy Map"
        $scale={scale}
        $translateX={translateX}
        $translateY={translateY}
        draggable={false}
      />

      <MapControls>
        <ControlButton onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={20} />
        </ControlButton>
        <ControlButton onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={20} />
        </ControlButton>
        <ControlButton onClick={handleReset} title="Reset View">
          <RotateCcw size={20} />
        </ControlButton>
        <ControlButton onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <Maximize2 size={20} />
        </ControlButton>
      </MapControls>

      <MapLegend>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Galaxy Far, Far Away</div>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>
          Interactive Star Wars Galaxy Map
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          Scroll to zoom • Drag to pan • ESC to exit fullscreen
        </div>
      </MapLegend>

      <MapInfo>
        Zoom: {Math.round(scale * 100)}%
      </MapInfo>
    </MapContainer>
  );
};

export default GalacticMap;