#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes webpack bundle composition and provides optimization recommendations
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class BundleAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      bundleStats: {},
      recommendations: [],
      performance: {}
    }
  }

  async analyzeBundles() {
    console.log('🔍 Analyzing bundle composition...')
    
    try {
      // Build the application for analysis
      console.log('Building application for analysis...')
      execSync('npm run build', { stdio: 'inherit' })
      
      // Analyze .next directory
      const nextDir = path.join(process.cwd(), '.next')
      const staticDir = path.join(nextDir, 'static')
      
      if (fs.existsSync(staticDir)) {
        this.analyzeStaticAssets(staticDir)
      }
      
      // Generate recommendations
      this.generateRecommendations()
      
      // Save results
      this.saveResults()
      
      console.log('✅ Bundle analysis complete!')
      this.printSummary()
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message)
      process.exit(1)
    }
  }

  analyzeStaticAssets(staticDir) {
    console.log('📊 Analyzing static assets...')
    
    const chunks = path.join(staticDir, 'chunks')
    if (fs.existsSync(chunks)) {
      const files = fs.readdirSync(chunks)
      
      let totalSize = 0
      const fileStats = []
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(chunks, file)
          const stats = fs.statSync(filePath)
          const sizeKB = Math.round(stats.size / 1024)
          
          totalSize += sizeKB
          fileStats.push({
            name: file,
            size: sizeKB,
            type: this.categorizeChunk(file)
          })
        }
      })
      
      // Sort by size
      fileStats.sort((a, b) => b.size - a.size)
      
      this.results.bundleStats = {
        totalSizeKB: totalSize,
        chunkCount: fileStats.length,
        largestChunks: fileStats.slice(0, 10),
        categoryBreakdown: this.categorizeBundles(fileStats)
      }
    }
  }

  categorizeChunk(filename) {
    if (filename.includes('vendor') || filename.includes('node_modules')) {
      return 'vendor'
    }
    if (filename.includes('ui-libs')) {
      return 'ui-libraries'
    }
    if (filename.includes('chart-libs')) {
      return 'chart-libraries'
    }
    if (filename.includes('api-libs')) {
      return 'api-libraries'
    }
    if (filename.includes('common')) {
      return 'common'
    }
    if (filename.includes('pages')) {
      return 'pages'
    }
    return 'application'
  }

  categorizeBundles(fileStats) {
    const categories = {}
    
    fileStats.forEach(file => {
      const category = file.type
      if (!categories[category]) {
        categories[category] = { count: 0, totalSize: 0 }
      }
      categories[category].count++
      categories[category].totalSize += file.size
    })
    
    return categories
  }

  generateRecommendations() {
    console.log('💡 Generating optimization recommendations...')
    
    const { bundleStats } = this.results
    const recommendations = []
    
    // Total bundle size recommendations
    if (bundleStats.totalSizeKB > 1000) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Bundle Size',
        issue: `Total bundle size is ${bundleStats.totalSizeKB}KB (recommended: <1000KB)`,
        solution: 'Implement more aggressive code splitting and lazy loading',
        impact: 'Improves initial page load time by 20-40%'
      })
    }
    
    // Large chunk recommendations
    const largeChunks = bundleStats.largestChunks?.filter(chunk => chunk.size > 200) || []
    if (largeChunks.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Chunk Optimization',
        issue: `${largeChunks.length} chunks are larger than 200KB`,
        solution: 'Split large chunks further or implement dynamic imports',
        impact: 'Reduces individual chunk load times'
      })
    }
    
    // Vendor bundle recommendations
    const vendorCategory = bundleStats.categoryBreakdown?.vendor
    if (vendorCategory && vendorCategory.totalSize > 500) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Vendor Optimization',
        issue: `Vendor bundles are ${vendorCategory.totalSize}KB (recommended: <500KB)`,
        solution: 'Consider using CDN for large libraries or implement tree shaking',
        impact: 'Reduces vendor bundle size and improves caching'
      })
    }
    
    // Chart library recommendations
    const chartCategory = bundleStats.categoryBreakdown?.['chart-libraries']
    if (chartCategory && chartCategory.totalSize > 150) {
      recommendations.push({
        priority: 'LOW',
        category: 'Chart Libraries',
        issue: `Chart libraries are ${chartCategory.totalSize}KB`,
        solution: 'Consider lighter chart alternatives or lazy load chart components',
        impact: 'Reduces bundle size for users who don\'t use charts'
      })
    }
    
    this.results.recommendations = recommendations
  }

  saveResults() {
    const outputPath = path.join(process.cwd(), 'bundle-analysis.json')
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2))
    console.log(`📄 Results saved to ${outputPath}`)
  }

  printSummary() {
    console.log('\n📈 Bundle Analysis Summary:')
    console.log('=' .repeat(50))
    
    const { bundleStats, recommendations } = this.results
    
    console.log(`Total Bundle Size: ${bundleStats.totalSizeKB}KB`)
    console.log(`Number of Chunks: ${bundleStats.chunkCount}`)
    
    if (bundleStats.largestChunks?.length > 0) {
      console.log('\n🔝 Largest Chunks:')
      bundleStats.largestChunks.slice(0, 5).forEach((chunk, index) => {
        console.log(`  ${index + 1}. ${chunk.name}: ${chunk.size}KB (${chunk.type})`)
      })
    }
    
    if (bundleStats.categoryBreakdown) {
      console.log('\n📊 Category Breakdown:')
      Object.entries(bundleStats.categoryBreakdown).forEach(([category, stats]) => {
        console.log(`  ${category}: ${stats.totalSize}KB (${stats.count} chunks)`)
      })
    }
    
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`)
        console.log(`     Solution: ${rec.solution}`)
        console.log(`     Impact: ${rec.impact}\n`)
      })
    } else {
      console.log('\n✅ No optimization recommendations - bundle is well optimized!')
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new BundleAnalyzer()
  analyzer.analyzeBundles().catch(console.error)
}

module.exports = BundleAnalyzer