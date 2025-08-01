/**
 * Test Results Processor
 * Processes Jest test results for custom reporting
 */

const fs = require('fs');
const path = require('path');

module.exports = (testResult) => {
    // Generate test summary
    const summary = {
        testRun: {
            timestamp: new Date().toISOString(),
            totalTests: testResult.numTotalTests,
            passedTests: testResult.numPassedTests,
            failedTests: testResult.numFailedTests,
            pendingTests: testResult.numPendingTests,
            testSuites: testResult.numTotalTestSuites,
            duration: testResult.testResults.reduce((acc, result) => 
                acc + (result.perfStats?.end - result.perfStats?.start || 0), 0
            )
        },
        coverage: testResult.coverageMap ? {
            statements: testResult.coverageMap.getCoverageSummary?.()?.statements || null,
            branches: testResult.coverageMap.getCoverageSummary?.()?.branches || null,
            functions: testResult.coverageMap.getCoverageSummary?.()?.functions || null,
            lines: testResult.coverageMap.getCoverageSummary?.()?.lines || null
        } : null,
        testResults: testResult.testResults.map(result => ({
            testFilePath: result.testFilePath,
            numPassingTests: result.numPassingTests,
            numFailingTests: result.numFailingTests,
            numPendingTests: result.numPendingTests,
            duration: result.perfStats?.end - result.perfStats?.start || 0,
            failures: result.testResults
                .filter(test => test.status === 'failed')
                .map(test => ({
                    title: test.title,
                    fullName: test.fullName,
                    failureMessages: test.failureMessages,
                    duration: test.duration
                }))
        }))
    };

    // Write detailed test results
    const outputDir = path.join(process.cwd(), 'coverage');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON summary
    fs.writeFileSync(
        path.join(outputDir, 'test-summary.json'),
        JSON.stringify(summary, null, 2)
    );

    // Write detailed results
    fs.writeFileSync(
        path.join(outputDir, 'test-results.json'),
        JSON.stringify(testResult, null, 2)
    );

    // Generate performance report
    const performanceReport = {
        timestamp: new Date().toISOString(),
        totalDuration: summary.testRun.duration,
        averageTestDuration: summary.testRun.duration / summary.testRun.totalTests,
        slowestTests: testResult.testResults
            .flatMap(result => result.testResults)
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, 10)
            .map(test => ({
                title: test.title,
                fullName: test.fullName,
                duration: test.duration
            })),
        testSuitePerformance: testResult.testResults
            .map(result => ({
                testFilePath: result.testFilePath,
                duration: result.perfStats?.end - result.perfStats?.start || 0,
                testsPerSecond: result.numPassingTests / 
                    ((result.perfStats?.end - result.perfStats?.start || 1) / 1000)
            }))
            .sort((a, b) => b.duration - a.duration)
    };

    fs.writeFileSync(
        path.join(outputDir, 'performance-report.json'),
        JSON.stringify(performanceReport, null, 2)
    );

    // Console output summary
    console.log('\\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${summary.testRun.passedTests}`);
    console.log(`❌ Failed: ${summary.testRun.failedTests}`);
    console.log(`⏸️  Pending: ${summary.testRun.pendingTests}`);
    console.log(`⏱️  Duration: ${(summary.testRun.duration / 1000).toFixed(2)}s`);
    
    if (summary.coverage) {
        console.log('\\n📈 Coverage Summary:');
        if (summary.coverage.statements) {
            console.log(`Statements: ${summary.coverage.statements.pct}%`);
        }
        if (summary.coverage.branches) {
            console.log(`Branches: ${summary.coverage.branches.pct}%`);
        }
        if (summary.coverage.functions) {
            console.log(`Functions: ${summary.coverage.functions.pct}%`);
        }
        if (summary.coverage.lines) {
            console.log(`Lines: ${summary.coverage.lines.pct}%`);
        }
    }

    // Return the original test result
    return testResult;
};
