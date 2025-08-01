/**
 * Enhanced File Upload Component
 * Improved drag-and-drop functionality with better validation and progress tracking
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useFileValidation } from '../hooks/useEnhanced';

// Styled components
const DropZone = styled(Paper)(({ theme, isDragActive, hasError }: any) => ({
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
  const { validateFile } = useFileValidation();

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithMetadata[] = [];
    
    Array.from(fileList).forEach((file) => {
      // Skip if we already have this file
      const existingFile = files.find(f => f.file.name === file.name && f.file.size === file.size);
      if (existingFile) return;

      // Validate file
      const validation = validateFile(file, {
        maxSize,
        allowedExtensions
      });

      const fileWithMetadata: FileWithMetadata = {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        errors: validation.errors,
        isValid: validation.isValid
      };

      // Create preview for text files
      if (file.type.startsWith('text/') || allowedExtensions.some(ext => file.name.endsWith(ext))) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          fileWithMetadata.preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
        };
        reader.readAsText(file);
      }

      newFiles.push(fileWithMetadata);
    });

    // Limit number of files
    const updatedFiles = multiple 
      ? [...files, ...newFiles].slice(0, maxFiles)
      : newFiles.slice(0, 1);

    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, multiple, maxFiles, maxSize, allowedExtensions, validateFile, onFilesChange]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

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

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleRemoveFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    onFilesChange([]);
  }, [onFilesChange]);

  const handleUpload = useCallback(() => {
    if (onUpload && files.length > 0) {
      onUpload(files.filter(f => f.isValid));
    }
  }, [onUpload, files]);

  const validFiles = files.filter(f => f.isValid);
  const invalidFiles = files.filter(f => !f.isValid);
  const hasErrors = error || invalidFiles.length > 0;

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
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Max file size: {Math.round(maxSize / 1024 / 1024)}MB • 
          Supported formats: {allowedExtensions.join(', ')}
          {multiple && ` • Max files: ${maxFiles}`}
        </Typography>
      </DropZone>

      {/* Progress Indicator */}
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Uploading files... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Status Messages */}
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

      {/* File List */}
      {files.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Selected Files ({files.length})
              </Typography>
              <Box>
                <Button
                  size="small"
                  onClick={handleClearAll}
                  startIcon={<DeleteIcon />}
                  disabled={disabled || isUploading}
                >
                  Clear All
                </Button>
                {onUpload && validFiles.length > 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleUpload}
                    startIcon={isUploading ? <RefreshIcon /> : <UploadIcon />}
                    disabled={disabled || isUploading || validFiles.length === 0}
                    sx={{ ml: 1 }}
                  >
                    {isUploading ? 'Uploading...' : `Upload ${validFiles.length} File${validFiles.length > 1 ? 's' : ''}`}
                  </Button>
                )}
              </Box>
            </Box>

            <List dense>
              {files.map((fileData, index) => (
                <React.Fragment key={fileData.id}>
                  <ListItem>
                    <FileIcon sx={{ mr: 2, color: fileData.isValid ? 'text.secondary' : 'error.main' }} />
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {fileData.file.name}
                          </Typography>
                          {fileData.isValid ? (
                            <SuccessIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {(fileData.file.size / 1024).toFixed(1)} KB • {fileData.file.type || 'Unknown type'}
                          </Typography>
                          {fileData.errors.length > 0 && (
                            <Box mt={0.5}>
                              {fileData.errors.map((error, errorIndex) => (
                                <Chip
                                  key={errorIndex}
                                  label={error}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  sx={{ mr: 0.5, fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          )}
                          {showPreview && fileData.preview && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 1,
                                p: 1,
                                backgroundColor: 'grey.50',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.7rem'
                              }}
                            >
                              {fileData.preview}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFile(fileData.id)}
                        disabled={disabled || isUploading}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < files.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* Summary */}
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      {files.length}
                    </Typography>
                    <Typography variant="caption">
                      Total Files
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {validFiles.length}
                    </Typography>
                    <Typography variant="caption">
                      Valid Files
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="error.main">
                      {invalidFiles.length}
                    </Typography>
                    <Typography variant="caption">
                      Invalid Files
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EnhancedFileUpload;
