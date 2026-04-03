import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'policy_documents';
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export const uploadDocument = async (file, userId) => {
    if (!userId) throw new Error('User must be logged in to upload files.');
    if (file.size > MAX_FILE_SIZE) throw new Error('File size exceeds the 8 MB limit.');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) throw uploadError;
    return fileName;
};

export const deleteDocument = async (fileName, userId) => {
    if (!userId) throw new Error('User must be logged in to delete files.');
    
    const filePath = `${userId}/${fileName}`;
    const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (deleteError) throw deleteError;
    return true;
};

export const getDocumentUrl = async (fileName, userId) => {
    if (!userId) throw new Error('User must be logged in to get file URLs.');

    const filePath = `${userId}/${fileName}`;
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60);

    if (error) throw error;
    return data?.signedUrl;
};

export const listDocuments = async (userId) => {
    if (!userId) throw new Error('User must be logged in to list files.');

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId + '/', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) throw error;
    
    // Filter out potential placeholder files
    return (data || []).filter(f => f.name && f.id);
};
