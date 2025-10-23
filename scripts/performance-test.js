#!/usr/bin/env node

/**
 * Performance Testing and Analysis Script
 * Analyzes bundle sizes, performance metrics, and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

// Performance thresholds (in KB)
const PERFORMANCE_THRESHOLDS = {
  CRITICAL_JS_SIZE: 500,
  WARNING_JS_SIZE: 200,
  CRITICAL_CSS_SIZE: 100,
  WARNING_CSS_SIZE: 50,
  TOTAL_BUNDLE_WARNING: 2000,
  TOTAL_BUNDLE_CRITICAL: 3000
};

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      bundleAnalysis: {},
      performanceScore: 0,
      recommendations: [],
      metrics: {}
    };
  }

  // Analyze bundle sizes
  analyzeBundleSizes() {
    console.log('🔍 Analyzing bundle sizes...');
    
    const buildPath = path.join(process.cwd(), '.next');
    if (!fs.existsSync(buildPath)) {
      console.log('❌ No build found. Run `npm run build` first.');
      return false;
    }

    // Analyze JavaScript bundles
    const jsPath = path.join(buildPath, 'static', 'chunks');
    const jsFiles = this.getFileSizes(jsPath, '.js');
    
    // Analyze CSS bundles
    const cssPath = path.join(buildPath, 'static', 'css');
    const cssFiles = this.getFileSizes(cssPath, '.css');

    this.results.bundleAnalysis = {
      javascript: jsFiles,
      css: cssFiles,
      totalJS: jsFiles.reduce((sum, file) => sum + file.size, 0),
      totalCSS: cssFiles.reduce((sum, file) => sum + file.size, 0)
    };

    return true;
  }

  // Get file sizes in a directory
  getFileSizes(dirPath, extension) {
    if (!fs.existsSync(dirPath)) return [];
    
    const files = [];
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isFile() && item.endsWith(extension)) {
        files.push({
          name: item,
          size: Math.round(stat.size / 1024 * 100) / 100, // KB with 2 decimal places
          path: itemPath
        });
      }
    });
    
    return files.sort((a, b) => b.size - a.size);
  }

  // Analyze performance metrics
  analyzePerformanceMetrics() {
    console.log('📊 Analyzing performance metrics...');
    
    const { bundleAnalysis } = this.results;
    let score = 100;
    
    // Check JavaScript bundle sizes
    const largeJSFiles = bundleAnalysis.javascript.filter(file => 
      file.size > PERFORMANCE_THRESHOLDS.CRITICAL_JS_SIZE
    );
    
    const mediumJSFiles = bundleAnalysis.javascript.filter(file => 
      file.size > PERFORMANCE_THRESHOLDS.WARNING_JS_SIZE && 
      file.size <= PERFORMANCE_THRESHOLDS.CRITICAL_JS_SIZE
    );

    // Check CSS bundle sizes
    const largeCSSFiles = bundleAnalysis.css.filter(file => 
      file.size > PERFORMANCE_THRESHOLDS.CRITICAL_CSS_SIZE
    );

    // Calculate performance score
    score -= largeJSFiles.length * 15;
    score -= mediumJSFiles.length * 5;
    score -= largeCSSFiles.length * 10;
    
    if (bundleAnalysis.totalJS > PERFORMANCE_THRESHOLDS.TOTAL_BUNDLE_CRITICAL) {
      score -= 20;
    } else if (bundleAnalysis.totalJS > PERFORMANCE_THRESHOLDS.TOTAL_BUNDLE_WARNING) {
      score -= 10;
    }

    this.results.performanceScore = Math.max(0, score);
    this.results.metrics = {
      largeJSFiles: largeJSFiles.length,
      mediumJSFiles: mediumJSFiles.length,
      largeCSSFiles: largeCSSFiles.length,
      totalBundleSize: bundleAnalysis.totalJS + bundleAnalysis.totalCSS
    };
  }

  // Generate optimization recommendations
  generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');
    
    const { bundleAnalysis, metrics } = this.results;
    const recommendations = [];

    // Large JavaScript files
    if (metrics.largeJSFiles > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Bundle Size',
        issue: `${metrics.largeJSFiles} JavaScript files exceed ${PERFORMANCE_THRESHOLDS.CRITICAL_JS_SIZE}KB`,
        solution: 'Implement code splitting and lazy loading for large components',
        impact: 'Reduces initial bundle size and improves First Contentful Paint'
      });
    }

    // Large CSS files
    if (metrics.largeCSSFiles > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Styling',
        issue: `${metrics.largeCSSFiles} CSS files exceed ${PERFORMANCE_THRESHOLDS.CRITICAL_CSS_SIZE}KB`,
        solution: 'Enable CSS purging and consider CSS-in-JS for component-specific styles',
        impact: 'Reduces CSS bundle size and eliminates unused styles'
      });
    }

    // Total bundle size
    if (bundleAnalysis.totalJS > PERFORMANCE_THRESHOLDS.TOTAL_BUNDLE_CRITICAL) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Overall Performance',
        issue: `Total JavaScript bundle size (${bundleAnalysis.totalJS.toFixed(2)}KB) is very large`,
        solution: 'Audit dependencies, remove unused packages, and implement tree shaking',
        impact: 'Significantly improves load times and user experience'
      });
    }

    // Check for potential optimizations
    const commonChunk = bundleAnalysis.javascript.find(file => file.name.includes('common'));
    if (commonChunk && commonChunk.size > 300) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Code Splitting',
        issue: `Common chunk is large (${commonChunk.size}KB)`,
        solution: 'Review shared dependencies and consider splitting into smaller chunks',
        impact: 'Improves caching efficiency and reduces redundant code loading'
      });
    }

    // Performance monitoring recommendations
    recommendations.push({
      priority: 'LOW',
      category: 'Monitoring',
      issue: 'Performance monitoring could be enhanced',
      solution: 'Implement Web Vitals tracking and real user monitoring (RUM)',
      impact: 'Provides insights into real-world performance and user experience'
    });

    this.results.recommendations = recommendations;
  }

  // Generate detailed report
  generateReport() {
    console.log('\n📋 PERFORMANCE ANALYSIS REPORT');
    console.log('================================\n');

    // Performance Score
    const scoreColor = this.results.performanceScore >= 80 ? '🟢' : 
                      this.results.performanceScore >= 60 ? '🟡' : '🔴';
    console.log(`${scoreColor} Performance Score: ${this.results.performanceScore}/100\n`);

    // Bundle Analysis
    console.log('📦 BUNDLE ANALYSIS');
    console.log('------------------');
    console.log(`Total JavaScript: ${this.results.bundleAnalysis.totalJS.toFixed(2)} KB`);
    console.log(`Total CSS: ${this.results.bundleAnalysis.totalCSS.toFixed(2)} KB`);
    console.log(`Total Bundle Size: ${(this.results.bundleAnalysis.totalJS + this.results.bundleAnalysis.totalCSS).toFixed(2)} KB\n`);

    // Top 5 largest JS files
    console.log('🔍 LARGEST JAVASCRIPT FILES');
    console.log('---------------------------');
    this.results.bundleAnalysis.javascript.slice(0, 5).forEach((file, index) => {
      const sizeIndicator = file.size > PERFORMANCE_THRESHOLDS.CRITICAL_JS_SIZE ? '🔴' :
                           file.size > PERFORMANCE_THRESHOLDS.WARNING_JS_SIZE ? '🟡' : '🟢';
      console.log(`${index + 1}. ${sizeIndicator} ${file.name} - ${file.size} KB`);
    });

    // CSS files
    if (this.results.bundleAnalysis.css.length > 0) {
      console.log('\n🎨 CSS FILES');
      console.log('------------');
      this.results.bundleAnalysis.css.forEach((file, index) => {
        const sizeIndicator = file.size > PERFORMANCE_THRESHOLDS.CRITICAL_CSS_SIZE ? '🔴' :
                             file.size > PERFORMANCE_THRESHOLDS.WARNING_CSS_SIZE ? '🟡' : '🟢';
        console.log(`${index + 1}. ${sizeIndicator} ${file.name} - ${file.size} KB`);
      });
    }

    // Recommendations
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS');
    console.log('--------------------------------');
    this.results.recommendations.forEach((rec, index) => {
      const priorityIcon = rec.priority === 'HIGH' ? '🔴' :
                          rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`\n${index + 1}. ${priorityIcon} ${rec.priority} - ${rec.category}`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}`);
      console.log(`   Impact: ${rec.impact}`);
    });

    console.log('\n================================');
    console.log('📊 Analysis complete!');
  }

  // Save report to file
  saveReport() {
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }

  // Run complete analysis
  async run() {
    console.log('🚀 Starting Performance Analysis...\n');
    
    if (!this.analyzeBundleSizes()) {
      return;
    }
    
    this.analyzePerformanceMetrics();
    this.generateRecommendations();
    this.generateReport();
    this.saveReport();
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = PerformanceAnalyzer;