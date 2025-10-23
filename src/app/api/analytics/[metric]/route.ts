import { NextRequest, NextResponse } from 'next/server';

// Mock data generators
const mockData: Record<string, any> = {
  sales: { labels: ['Jan', 'Feb', 'Mar'], data: [12, 19, 15] },
  clients: { stages: { Prospect: 5, Proposal: 3, Negotiation: 2 } },
  tasks: { status: { Completed: 45, Pending: 20 } },
  revenue: { total: 83200, monthly: [15000, 22000, 18000] }
};

// GET /api/analytics/[metric]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ metric: string }> }
) {
  try {
    const { metric } = await params;
    const data = mockData[metric] || {};
    if (!data) {
      return NextResponse.json({ success: false, error: 'Metric not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}