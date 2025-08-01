/**
 * Simple File Upload Component (Fixed Version)
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

// Types for styled components
interface DropZoneProps {
  isDragActive?: boolean;
  hasError?: boolean;
}

// Styled components
const DropZone = styled(Paper)<DropZoneProps>(({ theme, isDragActive, hasError }) => ({
  border: `2px dashed ${
    hasError 
      ? theme.palette.error.main 
      : isDragActive 
      ? theme.palette.primary.main 
      : theme.palette.divider
  }`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive 
    ? alpha(theme.palette.primary.main, 0.05)
    : hasError
    ? alpha(theme.palette.error.main, 0.05)
    : 'transparent',
  transition: theme.transitions.create(['border-color', 'background-color']),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02)
  }
}));

const FilePreview = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02)
  }
}));

// Types
interface FileWithMetadata {
  file: File;
  id: string;
  preview?: string;
  errors: string[];
  isValid: boolean;
}

interface EnhancedFileUploadProps {
  onFilesChange: (files: FileWithMetadata[]) => void;
  onUpload?: (files: FileWithMetadata[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  allowedExtensions?: string[];
  title?: string;
  description?: string;
  showPreview?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string | null;
  success?: boolean;
  disabled?: boolean;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFilesChange,
  onUpload,
  multiple = false,
  accept = '.js,.ts,.py,.json,.jsx,.tsx,.java,.cpp,.c,.go,.php,.rb',
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  allowedExtensions = ['.js', '.ts', '.py', '.json', '.jsx', '.tsx', '.java', '.cpp', '.c', '.go', '.php', '.rb'],
  title = 'Upload Code Files',
  description = 'Drag and drop your code files here, or click to select files',
  showPreview = true,
  uploadProgress = 0,
  isUploading = false,
  error = null,
  success = false,
  disabled = false
}) => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple validation function
  const validateFile = useCallback((file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File type ${extension} is not allowed`);
    }
    
    return { isValid: errors.length === 0, errors };
  }, [maxSize, allowedExtensions]);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithMetadata[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);
      
      newFiles.push({
        file,
        id: `${Date.now()}-${i}`,
        ...validation
      });
    }
    
    // Limit number of files
    const totalFiles = files.length + newFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, validateFile, maxFiles, onFilesChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      processFiles(fileList);
    }
  }, [processFiles]);

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
    
    const fileList = e.dataTransfer.files;
    if (fileList) {
      processFiles(fileList);
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const hasErrors = files.some(f => !f.isValid);

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <DropZone
        isDragActive={isDragActive}
        hasError={hasErrors}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        elevation={isDragActive ? 2 : 0}
      >
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
        <Button
          variant="outlined"
          disabled={disabled}
          sx={{ mt: 2 }}
        >
          Choose Files
        </Button>
      </DropZone>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Files uploaded successfully!
        </Alert>
      )}

      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {showPreview && files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <List>
            {files.map((fileData) => (
              <FilePreview key={fileData.id}>
                <ListItem>
                  <FileIcon sx={{ mr: 2, color: fileData.isValid ? 'success.main' : 'error.main' }} />
                  <ListItemText
                    primary={fileData.file.name}
                    secondary={
                      <Box>
                        <Typography variant="caption">
                          {Math.round(fileData.file.size / 1024)} KB
                        </Typography>
                        {fileData.errors.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {fileData.errors.map((error, index) => (
                              <Typography key={index} variant="caption" color="error" display="block">
                                {error}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(fileData.id)}
                      disabled={disabled}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </FilePreview>
            ))}
          </List>

          {files.length > 0 && onUpload && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={() => onUpload(files)}
                disabled={disabled || isUploading || hasErrors}
                startIcon={<UploadIcon />}
              >
                Upload Files
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EnhancedFileUpload;
