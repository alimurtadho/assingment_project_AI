/**
 * Unit Tests for ValidationUtils Utility
 * Tests file validation, content sanitization, and malicious content detection
 */

const ValidationUtils = require('../../../utils/validationUtils');

describe('ValidationUtils Utility', () => {
    describe('validateFile method', () => {
        test('should validate JavaScript file successfully', () => {
            const mockFile = {
                originalname: 'test.js',
                mimetype: 'text/javascript',
                size: 1024,
                buffer: Buffer.from('console.log("Hello World");')
            };

            const result = ValidationUtils.validateFile(mockFile);

            expect(result).toEqual({
                isValid: true,
                errors: [],
                warnings: [],
                fileInfo: {
                    name: 'test.js',
                    extension: '.js',
                    size: 1024,
                    type: 'text/javascript',
                    language: 'javascript'
                }
            });
        });

        test('should validate TypeScript file successfully', () => {
            const mockFile = {
                originalname: 'component.tsx',
                mimetype: 'text/plain',
                size: 2048,
                buffer: Buffer.from('interface Props { name: string; }')
            };

            const result = ValidationUtils.validateFile(mockFile);

            expect(result.isValid).toBe(true);
            expect(result.fileInfo.language).toBe('typescript');
            expect(result.fileInfo.extension).toBe('.tsx');
        });

        test('should validate Python file successfully', () => {
            const mockFile = {
                originalname: 'script.py',
                mimetype: 'text/x-python',
                size: 512,
                buffer: Buffer.from('def hello(): print("Hello")')
            };

            const result = ValidationUtils.validateFile(mockFile);

            expect(result.isValid).toBe(true);
            expect(result.fileInfo.language).toBe('python');
        });

        test('should reject unsupported file types', () => {
            const mockFile = {
                originalname: 'virus.exe',
                mimetype: 'application/octet-stream',
                size: 1024,
                buffer: Buffer.from('binary content')
            };

            const result = ValidationUtils.validateFile(mockFile);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Unsupported file type: .exe');
        });

        test('should reject oversized files', () => {
            const mockFile = {
                originalname: 'huge.js',
                mimetype: 'text/javascript',
                size: 100 * 1024 * 1024, // 100MB
                buffer: Buffer.alloc(100 * 1024 * 1024)
            };

            const result = ValidationUtils.validateFile(mockFile);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('File too large. Maximum size: 10MB');
        });

        test('should reject empty files', () => {
            const mockFile = {
                originalname: 'empty.js',
                mimetype: 'text/javascript',
                size: 0,
                buffer: Buffer.alloc(0)
            };

            const result = ValidationUtils.validateFile(mockFile);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('File is empty');
        });

        test('should handle missing file properties', () => {
            const incompleteFile = {
                originalname: 'test.js'
                // Missing other properties
            };

            const result = ValidationUtils.validateFile(incompleteFile);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should detect suspicious file names', () => {
            const suspiciousFiles = [
                'config.php',
                '.htaccess',
                'web.config',
                '../../../etc/passwd'
            ];

            suspiciousFiles.forEach(filename => {
                const mockFile = {
                    originalname: filename,
                    mimetype: 'text/plain',
                    size: 100,
                    buffer: Buffer.from('content')
                };

                const result = ValidationUtils.validateFile(mockFile);

                expect(result.warnings.length).toBeGreaterThan(0);
            });
        });
    });

    describe('detectMaliciousContent method', () => {
        test('should detect eval usage', () => {
            const maliciousCode = 'eval("alert(\'xss\')");';
            
            const result = ValidationUtils.detectMaliciousContent(maliciousCode);

            expect(result.isSafe).toBe(false);
            expect(result.threats).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'code_injection',
                        pattern: 'eval(',
                        severity: 'high'
                    })
                ])
            );
        });

        test('should detect Function constructor usage', () => {
            const maliciousCode = 'new Function("return process.env")();';
            
            const result = ValidationUtils.detectMaliciousContent(maliciousCode);

            expect(result.isSafe).toBe(false);
            expect(result.threats.some(t => t.type === 'code_injection')).toBe(true);
        });

        test('should detect SQL injection patterns', () => {
            const sqlInjection = 'SELECT * FROM users WHERE id = " + userInput + "';
            
            const result = ValidationUtils.detectMaliciousContent(sqlInjection);

            expect(result.isSafe).toBe(false);
            expect(result.threats.some(t => t.type === 'sql_injection')).toBe(true);
        });

        test('should detect XSS patterns', () => {
            const xssCode = 'document.innerHTML = userInput;';
            
            const result = ValidationUtils.detectMaliciousContent(xssCode);

            expect(result.isSafe).toBe(false);
            expect(result.threats.some(t => t.type === 'xss')).toBe(true);
        });

        test('should detect path traversal attempts', () => {
            const pathTraversal = 'fs.readFile("../../../etc/passwd")';
            
            const result = ValidationUtils.detectMaliciousContent(pathTraversal);

            expect(result.isSafe).toBe(false);
            expect(result.threats.some(t => t.type === 'path_traversal')).toBe(true);
        });

        test('should detect command injection', () => {
            const cmdInjection = 'exec("rm -rf /")';
            
            const result = ValidationUtils.detectMaliciousContent(cmdInjection);

            expect(result.isSafe).toBe(false);
            expect(result.threats.some(t => t.type === 'command_injection')).toBe(true);
        });

        test('should allow safe code', () => {
            const safeCode = `
                function calculateSum(a, b) {
                    return a + b;
                }
                
                const result = calculateSum(5, 3);
                console.log('Result:', result);
            `;
            
            const result = ValidationUtils.detectMaliciousContent(safeCode);

            expect(result.isSafe).toBe(true);
            expect(result.threats).toHaveLength(0);
        });

        test('should handle empty content', () => {
            const result = ValidationUtils.detectMaliciousContent('');

            expect(result.isSafe).toBe(true);
            expect(result.threats).toHaveLength(0);
        });

        test('should detect multiple threats', () => {
            const multiThreatCode = `
                eval(userInput);
                document.innerHTML = data;
                exec("rm -rf /");
            `;
            
            const result = ValidationUtils.detectMaliciousContent(multiThreatCode);

            expect(result.isSafe).toBe(false);
            expect(result.threats.length).toBeGreaterThan(1);
        });
    });

    describe('sanitizeContent method', () => {
        test('should remove null bytes', () => {
            const content = 'console.log("test");\\u0000\\u0001';
            
            const sanitized = ValidationUtils.sanitizeContent(content);

            expect(sanitized).not.toContain('\\u0000');
            expect(sanitized).not.toContain('\\u0001');
            expect(sanitized).toContain('console.log("test");');
        });

        test('should normalize line endings', () => {
            const content = 'line1\\r\\nline2\\rline3\\n';
            
            const sanitized = ValidationUtils.sanitizeContent(content);

            expect(sanitized).toBe('line1\\nline2\\nline3\\n');
        });

        test('should remove BOM', () => {
            const content = '\\uFEFFconsole.log("test");';
            
            const sanitized = ValidationUtils.sanitizeContent(content);

            expect(sanitized).toBe('console.log("test");');
        });

        test('should trim excessive whitespace', () => {
            const content = '   \\n\\n\\nconsole.log("test");\\n\\n   ';
            
            const sanitized = ValidationUtils.sanitizeContent(content);

            expect(sanitized).toBe('console.log("test");');
        });

        test('should preserve code structure', () => {
            const content = `
                function test() {
                    if (true) {
                        console.log("indented");
                    }
                }
            `;
            
            const sanitized = ValidationUtils.sanitizeContent(content);

            expect(sanitized).toContain('function test()');
            expect(sanitized).toContain('    if (true)'); // Preserve indentation
        });

        test('should handle empty content', () => {
            const sanitized = ValidationUtils.sanitizeContent('');

            expect(sanitized).toBe('');
        });

        test('should handle only whitespace', () => {
            const sanitized = ValidationUtils.sanitizeContent('   \\n\\t\\r   ');

            expect(sanitized).toBe('');
        });
    });

    describe('validateCodeSyntax method', () => {
        test('should validate correct JavaScript syntax', () => {
            const code = 'function test() { return true; }';
            
            const result = ValidationUtils.validateCodeSyntax(code, 'javascript');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should detect JavaScript syntax errors', () => {
            const code = 'function test() { return true';  // Missing closing brace
            
            const result = ValidationUtils.validateCodeSyntax(code, 'javascript');

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should validate TypeScript syntax', () => {
            const code = 'interface User { name: string; }';
            
            const result = ValidationUtils.validateCodeSyntax(code, 'typescript');

            expect(result.isValid).toBe(true);
        });

        test('should handle unsupported languages gracefully', () => {
            const code = 'print("Hello World")';
            
            const result = ValidationUtils.validateCodeSyntax(code, 'cobol');

            expect(result.isValid).toBe(true); // Should not fail for unsupported languages
            expect(result.warnings).toContain('Syntax validation not supported for language: cobol');
        });
    });

    describe('getFileLanguage method', () => {
        test('should detect language from file extension', () => {
            const testCases = [
                { filename: 'test.js', expected: 'javascript' },
                { filename: 'component.jsx', expected: 'javascript' },
                { filename: 'app.ts', expected: 'typescript' },
                { filename: 'Component.tsx', expected: 'typescript' },
                { filename: 'script.py', expected: 'python' },
                { filename: 'service.go', expected: 'go' },
                { filename: 'Main.java', expected: 'java' },
                { filename: 'style.css', expected: 'css' },
                { filename: 'template.html', expected: 'html' },
                { filename: 'data.json', expected: 'json' },
                { filename: 'config.xml', expected: 'xml' },
                { filename: 'README.md', expected: 'markdown' }
            ];

            testCases.forEach(({ filename, expected }) => {
                const result = ValidationUtils.getFileLanguage(filename);
                expect(result).toBe(expected);
            });
        });

        test('should return "unknown" for unrecognized extensions', () => {
            const result = ValidationUtils.getFileLanguage('file.xyz');
            expect(result).toBe('unknown');
        });

        test('should handle files without extensions', () => {
            const result = ValidationUtils.getFileLanguage('Dockerfile');
            expect(result).toBe('dockerfile');
        });

        test('should be case insensitive', () => {
            const testCases = [
                'test.JS',
                'test.Js',
                'test.jS'
            ];

            testCases.forEach(filename => {
                const result = ValidationUtils.getFileLanguage(filename);
                expect(result).toBe('javascript');
            });
        });
    });

    describe('calculateFileHash method', () => {
        test('should generate consistent hash for same content', () => {
            const content = 'console.log("test");';
            
            const hash1 = ValidationUtils.calculateFileHash(content);
            const hash2 = ValidationUtils.calculateFileHash(content);

            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64); // SHA-256 hash length
        });

        test('should generate different hashes for different content', () => {
            const content1 = 'console.log("test1");';
            const content2 = 'console.log("test2");';
            
            const hash1 = ValidationUtils.calculateFileHash(content1);
            const hash2 = ValidationUtils.calculateFileHash(content2);

            expect(hash1).not.toBe(hash2);
        });

        test('should handle empty content', () => {
            const hash = ValidationUtils.calculateFileHash('');
            
            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[a-f0-9]{64}$/);
        });
    });

    describe('edge cases and error handling', () => {
        test('should handle null input gracefully', () => {
            expect(() => ValidationUtils.validateFile(null)).not.toThrow();
            expect(() => ValidationUtils.detectMaliciousContent(null)).not.toThrow();
            expect(() => ValidationUtils.sanitizeContent(null)).not.toThrow();
        });

        test('should handle undefined input gracefully', () => {
            expect(() => ValidationUtils.validateFile(undefined)).not.toThrow();
            expect(() => ValidationUtils.detectMaliciousContent(undefined)).not.toThrow();
            expect(() => ValidationUtils.sanitizeContent(undefined)).not.toThrow();
        });

        test('should handle very large files', () => {
            const largeContent = 'a'.repeat(5 * 1024 * 1024); // 5MB
            const mockFile = {
                originalname: 'large.js',
                mimetype: 'text/javascript',
                size: largeContent.length,
                buffer: Buffer.from(largeContent)
            };

            const result = ValidationUtils.validateFile(mockFile);
            expect(result.isValid).toBe(true);
        });

        test('should handle binary content gracefully', () => {
            const binaryContent = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
            
            expect(() => {
                ValidationUtils.detectMaliciousContent(binaryContent.toString());
            }).not.toThrow();
        });

        test('should handle special Unicode characters', () => {
            const unicodeContent = 'console.log("Hello 🌍 World! émojis and spëcial chars");';
            
            const sanitized = ValidationUtils.sanitizeContent(unicodeContent);
            expect(sanitized).toContain('🌍');
            expect(sanitized).toContain('émojis');
            expect(sanitized).toContain('spëcial');
        });
    });
});
