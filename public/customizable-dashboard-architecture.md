# Customizable Dashboard Architecture Design

## Overview
The customizable dashboard will allow users to create personalized views of key metrics, charts, and insights from the CRM data. It builds upon existing components like AdvancedAnalytics.tsx and Reports.tsx.

## Key Requirements
- Users can add, remove, and rearrange widgets (metrics, charts, etc.)
- Support for different widget types: KPI cards, line charts, pie charts, bar charts, tables
- Real-time data updates
- Save and load dashboard configurations per user
- Responsive design for desktop and mobile

## Architecture Components

### Backend
- **Database Schema**: Add a table for dashboard configurations (user_id, config JSON)
- **API Endpoints**:
  - GET /api/dashboards/{userId} - Fetch config
  - POST /api/dashboards/{userId} - Save config
  - GET /api/analytics/{metric} - Fetch data for widgets
- **Data Services**: Extend analyticsService to provide modular data queries

### Frontend
- **Components**:
  - DashboardContainer: Manages layout and drag-and-drop
  - WidgetWrapper: Handles individual widgets with resize/reorder
  - WidgetTypes: Specific components for each type (e.g., KPICard, ChartWidget)
- **State Management**: Use React Context or Redux for dashboard state
- **Libraries**: React Grid Layout for drag-and-drop, Chart.js or Recharts for visualizations

## Data Flow
1. Load user config from backend
2. Render widgets based on config
3. Fetch data for each widget asynchronously
4. On changes, update local state and save to backend

## Integration
- Integrate with existing AppContext for shared state
- Ensure compatibility with current metrics in AdvancedAnalytics

## Security
- User-specific configs to prevent data leakage
- Validate API inputs

This design provides a flexible foundation for customizable dashboards.