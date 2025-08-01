import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

interface FileUploadProps {
  endpoint: string;
  onResults: (results: any) => void;
  acceptedTypes?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ endpoint, onResults, acceptedTypes }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setLoading(true);
    setError(null);

    try {
      // Read file content as text
      const fileContent = await file.text();
      
      // Determine language from file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const languageMap: { [key: string]: string } = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust'
      };
      
      const language = languageMap[fileExtension || ''] || 'text';

      // Send as JSON
      const response = await axios.post(endpoint, {
        code: fileContent,
        language: language
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      onResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [endpoint, onResults]);

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDrop(files);
    }
  }, [onDrop]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onDrop(Array.from(files));
    }
  }, [onDrop]);

  return (
    <Box sx={{ mb: 3 }}>
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload-input"
        multiple={false}
      />
      <Paper
        component="label"
        htmlFor="file-upload-input"
        elevation={isDragActive ? 4 : 1}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.light' : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.light',
          }
        }}
      >
        {loading ? (
          <Box>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1">Processing file...</Typography>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the file here' : 'Drag & drop a code file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to select a file
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Choose File
            </Button>
            {acceptedTypes && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Accepted types: {acceptedTypes}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {uploadedFile && (
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`Uploaded: ${uploadedFile.name}`} 
            color="success" 
            variant="outlined"
          />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
