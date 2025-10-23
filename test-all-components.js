// Comprehensive CRM Component Testing Script
// Run this in the browser console at http://localhost:3000

class CRMTester {
  constructor() {
    this.testResults = [];
    this.currentComponent = null;
    this.testStartTime = Date.now();
  }

  // Utility functions
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.testResults.push({ timestamp, type, message });
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.wait(100);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }

  async clickElement(selector, description = '') {
    try {
      const element = await this.waitForElement(selector);
      element.click();
      this.log(`✓ Clicked ${description || selector}`, 'success');
      await this.wait(500); // Wait for UI to update
      return true;
    } catch (error) {
      this.log(`✗ Failed to click ${description || selector}: ${error.message}`, 'error');
      return false;
    }
  }

  async typeInInput(selector, text, description = '') {
    try {
      const element = await this.waitForElement(selector);
      element.focus();
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      this.log(`✓ Typed "${text}" in ${description || selector}`, 'success');
      await this.wait(300);
      return true;
    } catch (error) {
      this.log(`✗ Failed to type in ${description || selector}: ${error.message}`, 'error');
      return false;
    }
  }

  checkElementExists(selector, description = '') {
    const element = document.querySelector(selector);
    if (element) {
      this.log(`✓ Found ${description || selector}`, 'success');
      return true;
    } else {
      this.log(`✗ Missing ${description || selector}`, 'error');
      return false;
    }
  }

  // Navigation helper
  async navigateToComponent(componentName) {
    this.log(`\n=== TESTING ${componentName.toUpperCase()} COMPONENT ===`, 'info');
    this.currentComponent = componentName;
    
    // Try to find and click the navigation item
    const navSelectors = [
      `[data-tab="${componentName.toLowerCase()}"]`,
      `button:contains("${componentName}")`,
      `a:contains("${componentName}")`,
      `[aria-label*="${componentName}"]`,
      `.nav-item:contains("${componentName}")`,
      `.sidebar-item:contains("${componentName}")`
    ];

    for (const selector of navSelectors) {
      try {
        if (selector.includes(':contains')) {
          // Handle text-based selectors
          const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          const element = elements.find(el => 
            el.textContent.toLowerCase().includes(componentName.toLowerCase())
          );
          if (element) {
            element.click();
            await this.wait(1000);
            this.log(`✓ Navigated to ${componentName}`, 'success');
            return true;
          }
        } else {
          const element = document.querySelector(selector);
          if (element) {
            element.click();
            await this.wait(1000);
            this.log(`✓ Navigated to ${componentName}`, 'success');
            return true;
          }
        }
      } catch (error) {
        continue;
      }
    }

    this.log(`✗ Could not navigate to ${componentName}`, 'error');
    return false;
  }

  // Component-specific test functions
  async testCalendarComponent() {
    await this.navigateToComponent('Calendar');
    
    // Test calendar view
    this.checkElementExists('.calendar-grid, .calendar-view, [data-testid="calendar"]', 'Calendar grid');
    this.checkElementExists('button:contains("Today"), .today-button', 'Today button');
    this.checkElementExists('.month-navigation, .calendar-header', 'Month navigation');
    
    // Test event creation
    await this.clickElement('button:contains("Add Event"), .add-event-btn, [data-testid="add-event"]', 'Add Event button');
    await this.wait(500);
    
    // Test event form if modal opens
    if (document.querySelector('.modal, .dialog, .event-form')) {
      this.checkElementExists('input[name="title"], input[placeholder*="title"]', 'Event title input');
      this.checkElementExists('input[type="date"], input[name="date"]', 'Event date input');
      await this.clickElement('button:contains("Cancel"), .cancel-btn', 'Cancel button');
    }
    
    this.log('Calendar component testing completed', 'info');
  }

  async testTasksComponent() {
    await this.navigateToComponent('Tasks');
    
    // Test task board/list view
    this.checkElementExists('.task-board, .task-list, .kanban-board', 'Task board/list');
    this.checkElementExists('button:contains("Add Task"), .add-task-btn', 'Add Task button');
    
    // Test task columns/categories
    this.checkElementExists('.task-column, .task-category', 'Task columns');
    
    // Test task creation
    await this.clickElement('button:contains("Add Task"), .add-task-btn', 'Add Task button');
    await this.wait(500);
    
    if (document.querySelector('.modal, .dialog, .task-form')) {
      this.checkElementExists('input[name="title"], input[placeholder*="task"]', 'Task title input');
      this.checkElementExists('select[name="priority"], .priority-select', 'Priority selector');
      await this.clickElement('button:contains("Cancel"), .cancel-btn', 'Cancel button');
    }
    
    this.log('Tasks component testing completed', 'info');
  }

  async testClientsComponent() {
    await this.navigateToComponent('Clients');
    
    // Test client list/grid
    this.checkElementExists('.client-list, .client-grid, .clients-container', 'Client list/grid');
    this.checkElementExists('button:contains("Add Client"), .add-client-btn', 'Add Client button');
    this.checkElementExists('input[placeholder*="search"], .search-input', 'Search input');
    
    // Test client creation
    await this.clickElement('button:contains("Add Client"), .add-client-btn', 'Add Client button');
    await this.wait(500);
    
    if (document.querySelector('.modal, .dialog, .client-form')) {
      this.checkElementExists('input[name="name"], input[placeholder*="name"]', 'Client name input');
      this.checkElementExists('input[name="email"], input[type="email"]', 'Client email input');
      await this.clickElement('button:contains("Cancel"), .cancel-btn', 'Cancel button');
    }
    
    this.log('Clients component testing completed', 'info');
  }

  async testPipelineComponent() {
    await this.navigateToComponent('Pipeline');
    
    // Test pipeline stages
    this.checkElementExists('.pipeline-stage, .sales-stage', 'Pipeline stages');
    this.checkElementExists('.pipeline-card, .deal-card', 'Pipeline cards');
    
    // Test view modes
    this.checkElementExists('button:contains("Cards"), button:contains("Kanban")', 'View mode buttons');
    
    // Test filters
    this.checkElementExists('button:contains("Filter"), .filter-btn', 'Filter button');
    
    this.log('Pipeline component testing completed', 'info');
  }

  async testProjectsComponent() {
    await this.navigateToComponent('Projects');
    
    // Test project list/view
    this.checkElementExists('.project-list, .projects-container', 'Project list');
    this.checkElementExists('button:contains("Add Project"), .add-project-btn', 'Add Project button');
    
    // Test view modes
    this.checkElementExists('button:contains("List"), button:contains("Gantt")', 'View mode buttons');
    
    // Test project creation
    await this.clickElement('button:contains("Add Project"), .add-project-btn', 'Add Project button');
    await this.wait(500);
    
    if (document.querySelector('.modal, .dialog, .project-form')) {
      this.checkElementExists('input[name="name"], input[placeholder*="project"]', 'Project name input');
      await this.clickElement('button:contains("Cancel"), .cancel-btn', 'Cancel button');
    }
    
    this.log('Projects component testing completed', 'info');
  }

  async testReportsComponent() {
    await this.navigateToComponent('Reports');
    
    // Test reports dashboard
    this.checkElementExists('.reports-container, .analytics-dashboard', 'Reports container');
    this.checkElementExists('.metric-card, .report-metric', 'Metric cards');
    this.checkElementExists('button:contains("Export"), .export-btn', 'Export button');
    this.checkElementExists('button:contains("Refresh"), .refresh-btn', 'Refresh button');
    
    this.log('Reports component testing completed', 'info');
  }

  async testEmailComponent() {
    await this.navigateToComponent('Email');
    
    // Test email interface
    this.checkElementExists('.email-list, .inbox', 'Email list/inbox');
    this.checkElementExists('button:contains("Compose"), .compose-btn', 'Compose button');
    this.checkElementExists('.email-folders, .folder-list', 'Email folders');
    
    // Test compose functionality
    await this.clickElement('button:contains("Compose"), .compose-btn', 'Compose button');
    await this.wait(500);
    
    if (document.querySelector('.compose-modal, .email-compose')) {
      this.checkElementExists('input[name="to"], input[placeholder*="to"]', 'To field');
      this.checkElementExists('input[name="subject"], input[placeholder*="subject"]', 'Subject field');
      this.checkElementExists('textarea, .email-body', 'Email body');
      await this.clickElement('button:contains("Cancel"), .cancel-btn', 'Cancel button');
    }
    
    this.log('Email component testing completed', 'info');
  }

  async testCompanyComponent() {
    await this.navigateToComponent('Company');
    
    // Test company dashboard
    this.checkElementExists('.company-dashboard, .company-container', 'Company dashboard');
    this.checkElementExists('.commission-section, .contracts-section', 'Company sections');
    
    this.log('Company component testing completed', 'info');
  }

  async testSettingsComponent() {
    await this.navigateToComponent('Settings');
    
    // Test settings interface
    this.checkElementExists('.settings-container, .settings-panel', 'Settings container');
    this.checkElementExists('.settings-section, .setting-group', 'Settings sections');
    
    this.log('Settings component testing completed', 'info');
  }

  // Main test runner
  async runAllTests() {
    this.log('🚀 Starting comprehensive CRM component testing...', 'info');
    
    try {
      // Test each component
      await this.testCalendarComponent();
      await this.testTasksComponent();
      await this.testClientsComponent();
      await this.testPipelineComponent();
      await this.testProjectsComponent();
      await this.testReportsComponent();
      await this.testEmailComponent();
      await this.testCompanyComponent();
      await this.testSettingsComponent();
      
      // Generate summary
      this.generateTestSummary();
      
    } catch (error) {
      this.log(`❌ Testing failed with error: ${error.message}`, 'error');
    }
  }

  generateTestSummary() {
    const totalTime = Date.now() - this.testStartTime;
    const successCount = this.testResults.filter(r => r.type === 'success').length;
    const errorCount = this.testResults.filter(r => r.type === 'error').length;
    
    this.log('\n📊 TEST SUMMARY', 'info');
    this.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`, 'info');
    this.log(`Successful tests: ${successCount}`, 'success');
    this.log(`Failed tests: ${errorCount}`, 'error');
    this.log(`Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`, 'info');
    
    if (errorCount > 0) {
      this.log('\n❌ FAILED TESTS:', 'error');
      this.testResults
        .filter(r => r.type === 'error')
        .forEach(r => this.log(`  - ${r.message}`, 'error'));
    }
    
    this.log('\n✅ Testing completed!', 'success');
  }
}

// Auto-run the tests
console.log('🔧 CRM Component Tester loaded. Starting tests...');
const tester = new CRMTester();
tester.runAllTests();

// Export for manual use
window.CRMTester = CRMTester;