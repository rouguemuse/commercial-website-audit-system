import React, { useState, useRef } from 'react';
import type { AuditAsset, AnnotationPin } from '../../types';
import { assetRepository } from '../../services/repositories/assetRepository';
import { AnnotationOverlay } from '../common/AnnotationOverlay';
import { Upload, Image as ImageIcon, Trash2, Plus, Pin, FileText, Check } from 'lucide-react';

interface Step2Props {
  auditId: string;
  assets: AuditAsset[];
  onAssetsChange: (assets: AuditAsset[]) => void;
}

const SCREENSHOT_TYPES = [
  { id: 'desktop_hero', label: 'Desktop Homepage' },
  { id: 'mobile_hero', label: 'Mobile Homepage' },
  { id: 'navigation', label: 'Navigation / Menu' },
  { id: 'service_page', label: 'Service Page' },
  { id: 'quote_flow', label: 'Contact / Quote Flow' },
  { id: 'other', label: 'Other Evidence' }
];

export const Step2SourceOfTruth: React.FC<Step2Props> = ({
  auditId,
  assets,
  onAssetsChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    assets.find(a => a.type === 'source_of_truth')?.id || null
  );

  const sourceAssets = assets.filter(a => a.type === 'source_of_truth');
  const activeAsset = sourceAssets.find(a => a.id === selectedAssetId) || sourceAssets[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAssets: AuditAsset[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const created = await assetRepository.createAssetFromFile(
        file,
        auditId,
        'source_of_truth',
        'desktop_hero',
        file.name.replace(/\.[^/.]+$/, '')
      );
      newAssets.push(created);
    }

    const updated = [...assets, ...newAssets];
    onAssetsChange(updated);
    if (newAssets.length > 0) {
      setSelectedAssetId(newAssets[0].id);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdatePins = async (assetId: string, pins: AnnotationPin[]) => {
    const updated = await assetRepository.updatePins(assetId, pins);
    const updatedList = assets.map(a => (a.id === assetId ? updated : a));
    onAssetsChange(updatedList);
  };

  const handleUpdateAssetMeta = async (assetId: string, patch: Partial<AuditAsset>) => {
    const target = assets.find(a => a.id === assetId);
    if (!target) return;
    const updated: AuditAsset = { ...target, ...patch };
    await assetRepository.save(updated);
    const updatedList = assets.map(a => (a.id === assetId ? updated : a));
    onAssetsChange(updatedList);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Delete this screenshot asset?')) {
      await assetRepository.delete(assetId);
      const updatedList = assets.filter(a => a.id !== assetId);
      onAssetsChange(updatedList);
      if (selectedAssetId === assetId) {
        const remaining = updatedList.filter(a => a.type === 'source_of_truth');
        setSelectedAssetId(remaining[0]?.id || null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="section-title">Step 2: Source of Truth (Existing Site Evidence)</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Upload uncompressed screenshots of the customer's actual website. Add numbered pins with specific observations.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} /> Upload Screenshots
          </button>
        </div>
      </div>

      {sourceAssets.length === 0 ? (
        <div
          className="card"
          style={{
            border: '2px dashed var(--border-strong)',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--bg-subtle)'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Upload size={24} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            Upload Source of Truth Screenshots
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Desktop homepage, mobile viewport, navigation menus, or booking flows (PNG, JPG, SVG, WebP)
          </div>
        </div>
      ) : (
        <div className="grid-3" style={{ gridTemplateColumns: '280px 1fr 1fr', gap: '20px' }}>
          {/* Screenshot Thumbnails List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Screenshots ({sourceAssets.length})
            </span>
            {sourceAssets.map((asset) => {
              const isSelected = activeAsset?.id === asset.id;
              const imgUrl = assetRepository.getObjectUrl(asset);
              return (
                <div
                  key={asset.id}
                  className="card"
                  style={{
                    padding: '10px',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                  onClick={() => setSelectedAssetId(asset.id)}
                >
                  <img
                    src={imgUrl}
                    alt={asset.title}
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                      {asset.title}
                    </div>
                    <span className="badge badge-accent" style={{ fontSize: '0.68rem' }}>
                      {asset.pins.length} Pins
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Annotation Canvas */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeAsset && (
              <>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="input"
                      style={{ fontWeight: 700, fontSize: '1rem', width: '280px' }}
                      value={activeAsset.title}
                      onChange={(e) => handleUpdateAssetMeta(activeAsset.id, { title: e.target.value })}
                      placeholder="Screenshot title"
                    />
                    <select
                      className="select"
                      value={activeAsset.subType || 'desktop_hero'}
                      onChange={(e) => handleUpdateAssetMeta(activeAsset.id, { subType: e.target.value as any })}
                      style={{ width: '180px' }}
                    >
                      {SCREENSHOT_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteAsset(activeAsset.id)}
                  >
                    <Trash2 size={13} /> Delete Screenshot
                  </button>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <AnnotationOverlay
                    asset={activeAsset}
                    editable={true}
                    onUpdatePins={(pins) => handleUpdatePins(activeAsset.id, pins)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
