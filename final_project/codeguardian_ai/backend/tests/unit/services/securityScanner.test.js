/**
 * Unit Tests for SecurityScanner Service
 * Tests vulnerability detection, risk scoring, and security analysis
 */

const SecurityScanner = require('../../../services/securityScanner');

describe('SecurityScanner Service', () => {
    let scanner;

    beforeEach(() => {
        scanner = new SecurityScanner();
    });

    describe('constructor', () => {
        test('should initialize with vulnerability patterns', () => {
            expect(scanner.patterns).toBeDefined();
            expect(Array.isArray(scanner.patterns)).toBe(true);
            expect(scanner.patterns.length).toBeGreaterThan(0);
        });

        test('should have required patterns', () => {
            const patternTypes = scanner.patterns.map(p => p.type);
            
            expect(patternTypes).toContain('code_injection');
            expect(patternTypes).toContain('sql_injection');
            expect(patternTypes).toContain('xss');
            expect(patternTypes).toContain('path_traversal');
            expect(patternTypes).toContain('command_injection');
        });
    });

    describe('scanCode method', () => {
        test('should detect eval usage', async () => {
            const code = `
                function processInput(input) {
                    eval(input); // Dangerous!
                    return true;
                }
            `;

            const result = await scanner.scanCode(code, 'test.js');

            expect(result.vulnerabilities).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'code_injection',
                        severity: 'high',
                        pattern: 'eval(',
                        line: expect.any(Number)
                    })
                ])
            );
        });

        test('should detect SQL injection patterns', async () => {
            const code = `
                function getUser(userId) {
                    const query = "SELECT * FROM users WHERE id = " + userId;
                    return db.query(query);
                }
            `;

            const result = await scanner.scanCode(code, 'database.js');

            expect(result.vulnerabilities).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'sql_injection',
                        severity: 'high'
                    })
                ])
            );
        });

        test('should detect XSS vulnerabilities', async () => {
            const code = `
                function displayContent(userContent) {
                    document.innerHTML = userContent;
                    return true;
                }
            `;

            const result = await scanner.scanCode(code, 'frontend.js');

            expect(result.vulnerabilities).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'xss',
                        severity: 'high'
                    })
                ])
            );
        });

        test('should detect path traversal vulnerabilities', async () => {
            const code = `
                const fs = require('fs');
                function readFile(filename) {
                    return fs.readFile('../../../etc/passwd', 'utf8');
                }
            `;

            const result = await scanner.scanCode(code, 'file.js');

            expect(result.vulnerabilities).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'path_traversal',
                        severity: 'high'
                    })
                ])
            );
        });

        test('should detect command injection', async () => {
            const code = `
                const { exec } = require('child_process');
                function runCommand(cmd) {
                    exec(cmd);
                }
            `;

            const result = await scanner.scanCode(code, 'command.js');

            expect(result.vulnerabilities).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'command_injection',
                        severity: 'high'
                    })
                ])
            );
        });

        test('should calculate risk score correctly', async () => {
            const highRiskCode = `
                eval(userInput);
                exec(command);
                document.innerHTML = content;
            `;

            const lowRiskCode = `
                function add(a, b) {
                    return a + b;
                }
                console.log('Hello World');
            `;

            const highRiskResult = await scanner.scanCode(highRiskCode, 'high.js');
            const lowRiskResult = await scanner.scanCode(lowRiskCode, 'low.js');

            expect(highRiskResult.riskScore).toBeGreaterThan(lowRiskResult.riskScore);
            expect(highRiskResult.riskScore).toBeGreaterThan(5);
            expect(lowRiskResult.riskScore).toBeLessThan(3);
        });

        test('should provide vulnerability summary', async () => {
            const code = `
                eval(userInput);
                document.innerHTML = content;
                const query = "SELECT * FROM users WHERE id = " + id;
            `;

            const result = await scanner.scanCode(code, 'mixed.js');

            expect(result.summary).toEqual({
                totalVulnerabilities: expect.any(Number),
                criticalIssues: expect.any(Number),
                highSeverity: expect.any(Number),
                mediumSeverity: expect.any(Number),
                lowSeverity: expect.any(Number),
                riskLevel: expect.stringMatching(/low|medium|high|critical/)
            });

            expect(result.summary.totalVulnerabilities).toBeGreaterThan(0);
        });

        test('should provide remediation suggestions', async () => {
            const code = 'eval(userInput);';

            const result = await scanner.scanCode(code, 'test.js');

            const evalVuln = result.vulnerabilities.find(v => v.type === 'code_injection');
            expect(evalVuln.remediation).toBeDefined();
            expect(Array.isArray(evalVuln.remediation)).toBe(true);
            expect(evalVuln.remediation.length).toBeGreaterThan(0);
        });

        test('should handle safe code correctly', async () => {
            const safeCode = `
                function calculateSum(a, b) {
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        throw new Error('Invalid input');
                    }
                    return a + b;
                }
                
                const result = calculateSum(5, 3);
                console.log('Result:', result);
            `;

            const result = await scanner.scanCode(safeCode, 'safe.js');

            expect(result.vulnerabilities).toHaveLength(0);
            expect(result.riskScore).toBeLessThan(3);
            expect(result.summary.riskLevel).toBe('low');
        });

        test('should detect CWE mappings', async () => {
            const code = 'eval(userInput);';

            const result = await scanner.scanCode(code, 'test.js');

            const evalVuln = result.vulnerabilities.find(v => v.type === 'code_injection');
            expect(evalVuln.cwe).toBeDefined();
            expect(evalVuln.cwe).toMatch(/CWE-\d+/);
        });

        test('should provide context information', async () => {
            const code = `
                function processData(input) {
                    eval(input); // Line 2
                    return true;
                }
            `;

            const result = await scanner.scanCode(code, 'context.js');

            const evalVuln = result.vulnerabilities.find(v => v.type === 'code_injection');
            expect(evalVuln.context).toBeDefined();
            expect(evalVuln.context.before).toBeDefined();
            expect(evalVuln.context.after).toBeDefined();
        });
    });

    describe('analyzePatterns method', () => {
        test('should find pattern matches', () => {
            const code = 'eval("test"); document.write(data);';
            
            const matches = scanner.analyzePatterns(code);

            expect(matches.length).toBeGreaterThan(0);
            expect(matches).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'code_injection',
                        pattern: 'eval('
                    })
                ])
            );
        });

        test('should handle code without vulnerabilities', () => {
            const code = 'console.log("Hello World");';
            
            const matches = scanner.analyzePatterns(code);

            expect(matches).toHaveLength(0);
        });

        test('should find multiple patterns in same code', () => {
            const code = `
                eval(input);
                exec(command);
                document.innerHTML = content;
            `;
            
            const matches = scanner.analyzePatterns(code);

            expect(matches.length).toBeGreaterThan(2);
        });
    });

    describe('calculateRiskScore method', () => {
        test('should calculate score based on vulnerability count and severity', () => {
            const vulnerabilities = [
                { severity: 'critical', type: 'code_injection' },
                { severity: 'high', type: 'sql_injection' },
                { severity: 'medium', type: 'weak_crypto' },
                { severity: 'low', type: 'info_disclosure' }
            ];

            const score = scanner.calculateRiskScore(vulnerabilities);

            expect(score).toBeGreaterThan(5);
            expect(score).toBeLessThanOrEqual(10);
        });

        test('should return 0 for no vulnerabilities', () => {
            const score = scanner.calculateRiskScore([]);

            expect(score).toBe(0);
        });

        test('should weight critical vulnerabilities heavily', () => {
            const criticalVulns = [
                { severity: 'critical', type: 'code_injection' }
            ];
            
            const lowVulns = [
                { severity: 'low', type: 'info_disclosure' },
                { severity: 'low', type: 'weak_validation' }
            ];

            const criticalScore = scanner.calculateRiskScore(criticalVulns);
            const lowScore = scanner.calculateRiskScore(lowVulns);

            expect(criticalScore).toBeGreaterThan(lowScore);
        });
    });

    describe('generateSummary method', () => {
        test('should generate accurate summary', () => {
            const vulnerabilities = [
                { severity: 'critical' },
                { severity: 'high' },
                { severity: 'high' },
                { severity: 'medium' },
                { severity: 'low' }
            ];

            const summary = scanner.generateSummary(vulnerabilities, 7.5);

            expect(summary).toEqual({
                totalVulnerabilities: 5,
                criticalIssues: 1,
                highSeverity: 2,
                mediumSeverity: 1,
                lowSeverity: 1,
                riskLevel: 'high'
            });
        });

        test('should determine correct risk level', () => {
            const testCases = [
                { score: 1, expected: 'low' },
                { score: 3, expected: 'low' },
                { score: 5, expected: 'medium' },
                { score: 7, expected: 'high' },
                { score: 9, expected: 'critical' }
            ];

            testCases.forEach(({ score, expected }) => {
                const summary = scanner.generateSummary([], score);
                expect(summary.riskLevel).toBe(expected);
            });
        });
    });

    describe('getVulnerabilityDetails method', () => {
        test('should return pattern details', () => {
            const pattern = scanner.patterns.find(p => p.type === 'code_injection');
            const details = scanner.getVulnerabilityDetails('code_injection');

            expect(details).toEqual({
                type: 'code_injection',
                severity: pattern.severity,
                cwe: pattern.cwe,
                description: pattern.description,
                remediation: pattern.remediation
            });
        });

        test('should handle unknown vulnerability types', () => {
            const details = scanner.getVulnerabilityDetails('unknown_type');

            expect(details).toEqual({
                type: 'unknown_type',
                severity: 'medium',
                cwe: 'CWE-000',
                description: 'Unknown vulnerability type',
                remediation: ['Review code manually for potential security issues']
            });
        });
    });

    describe('batch scanning', () => {
        test('should scan multiple files', async () => {
            const files = [
                { code: 'eval(input);', filename: 'file1.js' },
                { code: 'console.log("safe");', filename: 'file2.js' },
                { code: 'document.innerHTML = data;', filename: 'file3.js' }
            ];

            const results = await scanner.scanBatch(files);

            expect(results).toHaveLength(3);
            expect(results[0].vulnerabilities.length).toBeGreaterThan(0);
            expect(results[1].vulnerabilities.length).toBe(0);
            expect(results[2].vulnerabilities.length).toBeGreaterThan(0);
        });

        test('should handle batch scanning errors gracefully', async () => {
            const files = [
                { code: 'eval(input);', filename: 'file1.js' },
                { code: null, filename: 'file2.js' }, // Invalid
                { code: 'console.log("test");', filename: 'file3.js' }
            ];

            const results = await scanner.scanBatch(files);

            expect(results).toHaveLength(3);
            expect(results[1].error).toBeDefined();
        });
    });

    describe('language-specific scanning', () => {
        test('should detect JavaScript-specific vulnerabilities', async () => {
            const jsCode = `
                Function('return process.env')();
                setTimeout('alert("xss")', 1000);
            `;

            const result = await scanner.scanCode(jsCode, 'test.js');

            expect(result.vulnerabilities.some(v => 
                v.type === 'code_injection'
            )).toBe(true);
        });

        test('should detect TypeScript-specific patterns', async () => {
            const tsCode = `
                declare var evil: any;
                eval(evil);
            `;

            const result = await scanner.scanCode(tsCode, 'test.ts');

            expect(result.vulnerabilities.some(v => 
                v.type === 'code_injection'
            )).toBe(true);
        });

        test('should detect Python-specific vulnerabilities', async () => {
            const pythonCode = `
                exec(user_input)
                eval(expression)
            `;

            const result = await scanner.scanCode(pythonCode, 'test.py');

            expect(result.vulnerabilities.some(v => 
                v.type === 'code_injection'
            )).toBe(true);
        });
    });

    describe('edge cases and error handling', () => {
        test('should handle empty code', async () => {
            const result = await scanner.scanCode('', 'empty.js');

            expect(result.vulnerabilities).toHaveLength(0);
            expect(result.riskScore).toBe(0);
            expect(result.summary.riskLevel).toBe('low');
        });

        test('should handle null code', async () => {
            const result = await scanner.scanCode(null, 'null.js');

            expect(result.vulnerabilities).toHaveLength(0);
            expect(result.riskScore).toBe(0);
        });

        test('should handle very large code files', async () => {
            const largeCode = 'console.log("test");\\n'.repeat(10000);

            const result = await scanner.scanCode(largeCode, 'large.js');

            expect(result).toBeDefined();
            expect(result.vulnerabilities).toBeDefined();
        });

        test('should handle code with special characters', async () => {
            const specialCode = 'console.log("émojis 🚀 and spëcial chars");';

            const result = await scanner.scanCode(specialCode, 'special.js');

            expect(result.vulnerabilities).toHaveLength(0);
        });

        test('should handle malformed code gracefully', async () => {
            const malformedCode = 'function test() { return';

            const result = await scanner.scanCode(malformedCode, 'malformed.js');

            expect(result).toBeDefined();
            expect(Array.isArray(result.vulnerabilities)).toBe(true);
        });
    });

    describe('performance', () => {
        test('should complete scanning within reasonable time', async () => {
            const code = `
                function testFunction() {
                    eval(userInput);
                    return true;
                }
            `;

            const start = Date.now();
            await scanner.scanCode(code, 'performance.js');
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });

        test('should handle concurrent scans', async () => {
            const codes = Array(5).fill().map((_, i) => 
                `eval("test${i}"); console.log("${i}");`
            );

            const start = Date.now();
            const promises = codes.map((code, i) => 
                scanner.scanCode(code, `concurrent${i}.js`)
            );
            const results = await Promise.all(promises);
            const duration = Date.now() - start;

            expect(results).toHaveLength(5);
            expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
            results.forEach(result => {
                expect(result.vulnerabilities.length).toBeGreaterThan(0);
            });
        });
    });
});
