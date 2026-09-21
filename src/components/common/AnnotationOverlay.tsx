import React, { useState, useRef } from 'react';
import type { AnnotationPin } from '../../types';
import { assetRepository } from '../../services/repositories/assetRepository';
import type { AuditAsset } from '../../types';
import { Plus, Trash2, Edit3, X, Check } from 'lucide-react';

interface AnnotationOverlayProps {
  asset: AuditAsset;
  editable?: boolean;
  onUpdatePins?: (pins: AnnotationPin[]) => void;
  selectedPinId?: string;
  onSelectPin?: (pinId: string) => void;
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  asset,
  editable = false,
  onUpdatePins,
  selectedPinId,
  onSelectPin
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePinId, setActivePinId] = useState<string | null>(selectedPinId || null);
  const [editingPin, setEditingPin] = useState<AnnotationPin | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);

  const imageUrl = assetRepository.getObjectUrl(asset);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || !isAddingMode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const nextNumber = asset.pins.length > 0 ? Math.max(...asset.pins.map(p => p.number)) + 1 : 1;
    const newPin: AnnotationPin = {
      id: `pin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      number: nextNumber,
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(2, Math.min(98, y)),
      title: `Callout #${nextNumber}`,
      description: 'Describe the specific observation or recommendation here.'
    };

    const updatedPins = [...asset.pins, newPin];
    onUpdatePins?.(updatedPins);
    setEditingPin(newPin);
    setIsAddingMode(false);
    setActivePinId(newPin.id);
  };

  const handleSaveEdit = () => {
    if (!editingPin) return;
    const updatedPins = asset.pins.map(p => (p.id === editingPin.id ? editingPin : p));
    onUpdatePins?.(updatedPins);
    setEditingPin(null);
  };

  const handleDeletePin = (pinId: string) => {
    const remaining = asset.pins.filter(p => p.id !== pinId);
    // Renumber pins
    const renumbered = remaining.map((p, idx) => ({ ...p, number: idx + 1 }));
    onUpdatePins?.(renumbered);
    if (activePinId === pinId) setActivePinId(null);
    if (editingPin?.id === pinId) setEditingPin(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {editable && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isAddingMode ? '👉 Click on the screenshot where you want to place the pin' : 'Click "Add Pin" to drop a numbered callout marker'}
          </span>
          <button
            type="button"
            className={`btn btn-sm ${isAddingMode ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setIsAddingMode(!isAddingMode)}
          >
            {isAddingMode ? <X size={14} /> : <Plus size={14} />}
            {isAddingMode ? 'Cancel Pin Drop' : 'Add Pin'}
          </button>
        </div>
      )}

      {/* Screenshot with dynamic pin overlays */}
      <div
        ref={containerRef}
        className="annotator-container"
        onClick={handleImageClick}
        style={{ cursor: isAddingMode ? 'crosshair' : 'default' }}
      >
        <img
          src={imageUrl}
          alt={asset.title}
          className="annotator-image"
        />

        {asset.pins.map((pin) => {
          const isSelected = activePinId === pin.id || selectedPinId === pin.id;
          return (
            <div
              key={pin.id}
              className={`pin-marker ${isSelected ? 'selected' : ''}`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setActivePinId(pin.id);
                onSelectPin?.(pin.id);
                if (editable) setEditingPin(pin);
              }}
              title={`${pin.number}. ${pin.title}`}
            >
              {pin.number}
            </div>
          );
        })}
      </div>

      {/* Editing Pin Modal / Inline Drawer */}
      {editable && editingPin && (
        <div className="card" style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-text)' }}>
              Edit Pin #{editingPin.number}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => handleDeletePin(editingPin.id)}
              >
                <Trash2 size={13} /> Delete
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleSaveEdit}
              >
                <Check size={13} /> Save Pin
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              className="input"
              value={editingPin.title}
              onChange={(e) => setEditingPin({ ...editingPin, title: e.target.value })}
              placeholder="Short callout title (e.g. Vague Headline)"
            />
            <textarea
              className="textarea"
              value={editingPin.description}
              onChange={(e) => setEditingPin({ ...editingPin, description: e.target.value })}
              placeholder="Explain the finding or recommended change..."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* List of Callout Descriptions */}
      {asset.pins.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Numbered Callouts ({asset.pins.length})
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {asset.pins.map((pin) => {
              const isSelected = activePinId === pin.id;
              return (
                <div
                  key={pin.id}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActivePinId(pin.id);
                    onSelectPin?.(pin.id);
                    if (editable) setEditingPin(pin);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {pin.number}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {pin.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {pin.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
