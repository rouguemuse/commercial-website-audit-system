import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { backupService } from '../../services/repositories/backupService';
import { Download, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      const json = await backupService.exportFullBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contextmuse-audit-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Backup exported successfully with all audits, assets, and frameworks!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: `Export failed: ${err.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage(null);
      const text = await file.text();
      const stats = await backupService.importFullBackup(text);
      setMessage({
        type: 'success',
        text: `Restored ${stats.auditsCount} audits, ${stats.frameworksCount} frameworks, ${stats.diagnosesCount} diagnoses, and ${stats.assetsCount} screenshots!`
      });
      onDataRestored?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: `Import failed: ${err.message}` });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backup & Data Migration" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          All audits, master framework checks, diagnosis mappings, and full-resolution screenshot assets are stored directly in your browser's persistent IndexedDB storage.
        </p>

        {message && (
          <div
            className={`card ${message.type === 'success' ? 'badge-green' : 'badge-rose'}`}
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textTransform: 'none'
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{message.text}</span>
          </div>
        )}

        <div className="grid-2">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', alignItems: 'center' }}>
            <Download size={28} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Export Full Backup</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Download JSON backup containing all audits & assets
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <RefreshCw className="spin" size={14} /> : <Download size={14} />}
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', alignItems: 'center' }}>
            <Upload size={28} color="var(--success-solid)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Import Backup</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Restore or merge previous backup file
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? <RefreshCw className="spin" size={14} /> : <Upload size={14} />}
              {isImporting ? 'Importing...' : 'Select File'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
