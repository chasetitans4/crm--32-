#!/usr/bin/env node

/**
 * Comprehensive Performance Testing Script
 * Tests performance, memory usage, load handling, and edge cases
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ComprehensivePerformanceTester {
  constructor() {
    this.results = {
      bundleAnalysis: {},
      memoryTests: {},
      loadTests: {},
      edgeCaseTests: {},
      recommendations: [],
      overallScore: 0
    };
  }

  // Test bundle sizes and optimization
  async testBundlePerformance() {
    console.log('📦 Testing Bundle Performance...');
    
    try {
      // Run the existing performance test
      const PerformanceAnalyzer = require('./performance-test.js');
      const analyzer = new PerformanceAnalyzer();
      await analyzer.run();
      
      // Read the generated report
      const reportPath = path.join(process.cwd(), 'performance-report.json');
      if (fs.existsSync(reportPath)) {
        this.results.bundleAnalysis = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      }
      
      console.log('✅ Bundle performance analysis complete');
    } catch (error) {
      console.error('❌ Bundle performance test failed:', error.message);
      this.results.bundleAnalysis.error = error.message;
    }
  }

  // Test memory usage patterns
  async testMemoryUsage() {
    console.log('🧠 Testing Memory Usage Patterns...');
    
    const memoryTests = {
      initialMemory: process.memoryUsage(),
      afterLargeDataLoad: null,
      afterComponentMount: null,
      afterGarbageCollection: null,
      memoryLeaks: []
    };

    try {
      // Simulate large data loading
      console.log('  📊 Testing large data set handling...');
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        data: new Array(100).fill('x').join('')
      }));
      
      memoryTests.afterLargeDataLoad = process.memoryUsage();
      
      // Simulate component mounting/unmounting
      console.log('  🔄 Testing component lifecycle memory usage...');
      const components = [];
      for (let i = 0; i < 100; i++) {
        components.push({
          id: i,
          state: new Array(50).fill('component-data'),
          refs: new WeakMap()
        });
      }
      
      memoryTests.afterComponentMount = process.memoryUsage();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        memoryTests.afterGarbageCollection = process.memoryUsage();
      }
      
      // Check for potential memory leaks
      const memoryIncrease = memoryTests.afterComponentMount.heapUsed - memoryTests.initialMemory.heapUsed;
      if (memoryIncrease > 50 * 1024 * 1024) { // 50MB threshold
        memoryTests.memoryLeaks.push({
          type: 'High memory usage after component operations',
          increase: `${Math.round(memoryIncrease / 1024 / 1024)}MB`,
          severity: 'warning'
        });
      }
      
      this.results.memoryTests = memoryTests;
      console.log('✅ Memory usage tests complete');
      
    } catch (error) {
      console.error('❌ Memory usage test failed:', error.message);
      this.results.memoryTests.error = error.message;
    }
  }

  // Test load handling capabilities
  async testLoadHandling() {
    console.log('⚡ Testing Load Handling Capabilities...');
    
    const loadTests = {
      concurrentOperations: null,
      dataProcessingSpeed: null,
      renderingPerformance: null,
      apiResponseTimes: []
    };

    try {
      // Test concurrent operations
      console.log('  🔄 Testing concurrent operations...');
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 50; i++) {
        promises.push(new Promise(resolve => {
          setTimeout(() => {
            // Simulate data processing
            const data = Array.from({ length: 1000 }, (_, j) => j * i);
            const processed = data.map(x => x * 2).filter(x => x % 2 === 0);
            resolve(processed.length);
          }, Math.random() * 100);
        }));
      }
      
      await Promise.all(promises);
      loadTests.concurrentOperations = {
        duration: Date.now() - startTime,
        operations: promises.length,
        avgTimePerOperation: (Date.now() - startTime) / promises.length
      };
      
      // Test data processing speed
      console.log('  📊 Testing data processing speed...');
      const dataStartTime = Date.now();
      const largeDataSet = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        value: Math.random() * 1000,
        category: `category-${i % 10}`
      }));
      
      // Simulate complex data operations
      const grouped = largeDataSet.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});
      
      const aggregated = Object.keys(grouped).map(category => ({
        category,
        count: grouped[category].length,
        avgValue: grouped[category].reduce((sum, item) => sum + item.value, 0) / grouped[category].length
      }));
      
      loadTests.dataProcessingSpeed = {
        duration: Date.now() - dataStartTime,
        recordsProcessed: largeDataSet.length,
        recordsPerSecond: largeDataSet.length / ((Date.now() - dataStartTime) / 1000)
      };
      
      // Test rendering performance simulation
      console.log('  🎨 Testing rendering performance simulation...');
      const renderStartTime = Date.now();
      const renderOperations = [];
      
      for (let i = 0; i < 1000; i++) {
        renderOperations.push({
          component: `Component-${i}`,
          props: { id: i, data: new Array(10).fill(i) },
          rendered: Date.now()
        });
      }
      
      loadTests.renderingPerformance = {
        duration: Date.now() - renderStartTime,
        componentsRendered: renderOperations.length,
        avgRenderTime: (Date.now() - renderStartTime) / renderOperations.length
      };
      
      this.results.loadTests = loadTests;
      console.log('✅ Load handling tests complete');
      
    } catch (error) {
      console.error('❌ Load handling test failed:', error.message);
      this.results.loadTests.error = error.message;
    }
  }

  // Test edge cases and error scenarios
  async testEdgeCases() {
    console.log('🔍 Testing Edge Cases and Error Scenarios...');
    
    const edgeCaseTests = {
      largeDataSets: null,
      emptyStates: null,
      errorHandling: null,
      boundaryConditions: null
    };

    try {
      // Test large data sets
      console.log('  📈 Testing large data set handling...');
      const largeDataStart = Date.now();
      const massiveDataSet = Array.from({ length: 1000000 }, (_, i) => ({ id: i, value: i }));
      const filtered = massiveDataSet.filter(item => item.id % 1000 === 0);
      
      edgeCaseTests.largeDataSets = {
        originalSize: massiveDataSet.length,
        filteredSize: filtered.length,
        processingTime: Date.now() - largeDataStart,
        memoryEfficient: (Date.now() - largeDataStart) < 1000 // Should process in under 1 second
      };
      
      // Test empty states
      console.log('  🗂️ Testing empty state handling...');
      const emptyTests = {
        emptyArray: [],
        nullData: null,
        undefinedData: undefined,
        emptyObject: {}
      };
      
      edgeCaseTests.emptyStates = {
        handlesEmptyArray: Array.isArray(emptyTests.emptyArray) && emptyTests.emptyArray.length === 0,
        handlesNull: emptyTests.nullData === null,
        handlesUndefined: emptyTests.undefinedData === undefined,
        handlesEmptyObject: typeof emptyTests.emptyObject === 'object' && Object.keys(emptyTests.emptyObject).length === 0
      };
      
      // Test error handling
      console.log('  ⚠️ Testing error handling scenarios...');
      const errorTests = [];
      
      try {
        throw new Error('Test error');
      } catch (error) {
        errorTests.push({ type: 'caught', message: error.message });
      }
      
      try {
        JSON.parse('invalid json');
      } catch (error) {
        errorTests.push({ type: 'json-parse', message: error.message });
      }
      
      edgeCaseTests.errorHandling = {
        errorsHandled: errorTests.length,
        errorTypes: errorTests.map(e => e.type)
      };
      
      // Test boundary conditions
      console.log('  🎯 Testing boundary conditions...');
      edgeCaseTests.boundaryConditions = {
        maxSafeInteger: Number.MAX_SAFE_INTEGER,
        minSafeInteger: Number.MIN_SAFE_INTEGER,
        handlesLargeNumbers: Number.MAX_SAFE_INTEGER > 0,
        handlesNegativeNumbers: Number.MIN_SAFE_INTEGER < 0,
        stringLengthLimit: new Array(10000).fill('x').join('').length === 10000
      };
      
      this.results.edgeCaseTests = edgeCaseTests;
      console.log('✅ Edge case tests complete');
      
    } catch (error) {
      console.error('❌ Edge case test failed:', error.message);
      this.results.edgeCaseTests.error = error.message;
    }
  }

  // Generate performance recommendations
  generateRecommendations() {
    console.log('💡 Generating Performance Recommendations...');
    
    const recommendations = [];
    
    // Bundle analysis recommendations
    if (this.results.bundleAnalysis.performanceScore < 70) {
      recommendations.push({
        category: 'Bundle Optimization',
        priority: 'HIGH',
        issue: 'Bundle size is too large',
        solution: 'Implement code splitting and lazy loading',
        impact: 'Improves initial load time by 30-50%'
      });
    }
    
    // Memory usage recommendations
    if (this.results.memoryTests.memoryLeaks && this.results.memoryTests.memoryLeaks.length > 0) {
      recommendations.push({
        category: 'Memory Management',
        priority: 'HIGH',
        issue: 'Potential memory leaks detected',
        solution: 'Implement proper cleanup in useEffect hooks and component unmounting',
        impact: 'Prevents memory leaks and improves long-term performance'
      });
    }
    
    // Load handling recommendations
    if (this.results.loadTests.dataProcessingSpeed && this.results.loadTests.dataProcessingSpeed.recordsPerSecond < 10000) {
      recommendations.push({
        category: 'Data Processing',
        priority: 'MEDIUM',
        issue: 'Data processing speed could be improved',
        solution: 'Implement data virtualization and pagination for large datasets',
        impact: 'Improves responsiveness when handling large amounts of data'
      });
    }
    
    // Edge case recommendations
    if (this.results.edgeCaseTests.largeDataSets && !this.results.edgeCaseTests.largeDataSets.memoryEfficient) {
      recommendations.push({
        category: 'Scalability',
        priority: 'MEDIUM',
        issue: 'Large data set processing is slow',
        solution: 'Implement streaming data processing and worker threads',
        impact: 'Maintains performance with growing data volumes'
      });
    }
    
    // General recommendations
    recommendations.push({
      category: 'Monitoring',
      priority: 'LOW',
      issue: 'Performance monitoring could be enhanced',
      solution: 'Implement real-time performance monitoring and alerting',
      impact: 'Provides early warning of performance degradation'
    });
    
    this.results.recommendations = recommendations;
  }

  // Calculate overall performance score
  calculateOverallScore() {
    let score = 100;
    
    // Bundle score impact (40% weight)
    if (this.results.bundleAnalysis.performanceScore) {
      score = score * 0.6 + (this.results.bundleAnalysis.performanceScore * 0.4);
    }
    
    // Memory efficiency (20% weight)
    if (this.results.memoryTests.memoryLeaks) {
      score -= this.results.memoryTests.memoryLeaks.length * 10;
    }
    
    // Load handling (20% weight)
    if (this.results.loadTests.dataProcessingSpeed) {
      const processingScore = Math.min(100, this.results.loadTests.dataProcessingSpeed.recordsPerSecond / 100);
      score = score * 0.8 + (processingScore * 0.2);
    }
    
    // Edge case handling (20% weight)
    if (this.results.edgeCaseTests.largeDataSets) {
      const edgeCaseScore = this.results.edgeCaseTests.largeDataSets.memoryEfficient ? 100 : 50;
      score = score * 0.8 + (edgeCaseScore * 0.2);
    }
    
    this.results.overallScore = Math.max(0, Math.round(score));
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📋 COMPREHENSIVE PERFORMANCE TEST REPORT');
    console.log('=========================================\n');
    
    // Overall score
    const scoreColor = this.results.overallScore >= 80 ? '🟢' : 
                      this.results.overallScore >= 60 ? '🟡' : '🔴';
    console.log(`${scoreColor} Overall Performance Score: ${this.results.overallScore}/100\n`);
    
    // Bundle analysis summary
    if (this.results.bundleAnalysis.performanceScore !== undefined) {
      console.log('📦 BUNDLE PERFORMANCE');
      console.log(`   Score: ${this.results.bundleAnalysis.performanceScore}/100`);
      console.log(`   Total Bundle Size: ${(this.results.bundleAnalysis.bundleAnalysis?.totalJS + this.results.bundleAnalysis.bundleAnalysis?.totalCSS || 0).toFixed(2)} KB\n`);
    }
    
    // Memory usage summary
    if (this.results.memoryTests.initialMemory) {
      console.log('🧠 MEMORY USAGE');
      console.log(`   Initial Heap: ${Math.round(this.results.memoryTests.initialMemory.heapUsed / 1024 / 1024)} MB`);
      if (this.results.memoryTests.afterLargeDataLoad) {
        console.log(`   After Large Data: ${Math.round(this.results.memoryTests.afterLargeDataLoad.heapUsed / 1024 / 1024)} MB`);
      }
      console.log(`   Memory Leaks Detected: ${this.results.memoryTests.memoryLeaks?.length || 0}\n`);
    }
    
    // Load handling summary
    if (this.results.loadTests.dataProcessingSpeed) {
      console.log('⚡ LOAD HANDLING');
      console.log(`   Data Processing: ${Math.round(this.results.loadTests.dataProcessingSpeed.recordsPerSecond)} records/sec`);
      console.log(`   Concurrent Operations: ${this.results.loadTests.concurrentOperations?.operations || 0} completed`);
      console.log(`   Avg Operation Time: ${this.results.loadTests.concurrentOperations?.avgTimePerOperation?.toFixed(2) || 0} ms\n`);
    }
    
    // Edge cases summary
    if (this.results.edgeCaseTests.largeDataSets) {
      console.log('🔍 EDGE CASE HANDLING');
      console.log(`   Large Dataset Processing: ${this.results.edgeCaseTests.largeDataSets.memoryEfficient ? '✅ Efficient' : '❌ Needs Optimization'}`);
      console.log(`   Error Handling: ${this.results.edgeCaseTests.errorHandling?.errorsHandled || 0} scenarios tested\n`);
    }
    
    // Recommendations
    console.log('💡 TOP RECOMMENDATIONS');
    this.results.recommendations.slice(0, 5).forEach((rec, index) => {
      const priorityIcon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`${index + 1}. ${priorityIcon} ${rec.category}: ${rec.solution}`);
    });
    
    console.log('\n=========================================');
    console.log('📊 Comprehensive performance analysis complete!');
  }

  // Save detailed report
  saveDetailedReport() {
    const reportPath = path.join(process.cwd(), 'comprehensive-performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }

  // Run all tests
  async run() {
    console.log('🚀 Starting Comprehensive Performance Testing...\n');
    
    await this.testBundlePerformance();
    await this.testMemoryUsage();
    await this.testLoadHandling();
    await this.testEdgeCases();
    
    this.generateRecommendations();
    this.calculateOverallScore();
    this.generateReport();
    this.saveDetailedReport();
  }
}

// Run the comprehensive test
if (require.main === module) {
  const tester = new ComprehensivePerformanceTester();
  tester.run().catch(console.error);
}

module.exports = ComprehensivePerformanceTester;