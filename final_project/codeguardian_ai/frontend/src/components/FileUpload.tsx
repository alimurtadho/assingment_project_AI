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
import { useDropzone } from 'react-dropzone';
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
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [endpoint, onResults]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes ? {
      'text/plain': acceptedTypes.split(',')
    } : undefined,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        {...getRootProps()}
        elevation={isDragActive ? 4 : 1}
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
        <input {...getInputProps()} />
        
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
