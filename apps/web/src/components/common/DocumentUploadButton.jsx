import React, { useRef, useState } from 'react';
import { Upload, Trash2, ExternalLink, Loader2, FileCheck } from 'lucide-react';
import { uploadDocument, deleteDocument, getDocumentUrl } from '../../services/DocumentService';
import { useAuth } from '../../contexts/AuthContext';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const DocumentUploadButton = ({ documentName, onUploadComplete, onDeleteComplete, label = 'Upload Policy' }) => {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (fileInputRef.current) fileInputRef.current.value = '';

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only PDF, JPG, and PNG.');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            setUploading(true);
            setError(null);
            
            // If replacing an existing file, try to delete the old one first
            if (documentName) {
                try {
                    await deleteDocument(documentName, user.id);
                } catch (delErr) {
                    console.warn("Could not delete previous document. Might already be removed.", delErr);
                }
            }

            const fileName = await uploadDocument(file, user.id);
            if (onUploadComplete) onUploadComplete(fileName);
        } catch (err) {
            console.error('Upload Error:', err);
            setError('Upload failed');
            setTimeout(() => setError(null), 3000);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Remove this document?')) return;
        try {
            // we do not show loading here, just assume it'll work or handle fast enough
            await deleteDocument(documentName, user.id);
            if (onDeleteComplete) onDeleteComplete();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete document');
        }
    };

    const handleView = async () => {
        try {
            const url = await getDocumentUrl(documentName, user.id);
            if (url) window.open(url, '_blank');
        } catch (err) {
            console.error('View error:', err);
            alert('Failed to open document');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
            />
            
            {documentName ? (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px', background: 'var(--success-light)', 
                    border: '1px solid var(--success)', borderRadius: '6px'
                }}>
                    <FileCheck size={16} color="var(--success)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }} title="Document Uploaded">
                        Uploaded
                    </span>
                    <button onClick={handleView} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--primary)' }} title="View Document">
                        <ExternalLink size={14} />
                    </button>
                    <button onClick={handleDelete} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--danger)' }} title="Remove Document">
                        <Trash2 size={14} />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn btn-secondary"
                    style={{ 
                        height: '42px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '6px', 
                        padding: '0 12px',
                        fontSize: '0.85rem'
                    }}
                >
                    {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
                    {uploading ? 'Uploading...' : label}
                </button>
            )}

            {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>{error}</span>}
        </div>
    );
};

export default DocumentUploadButton;
