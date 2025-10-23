import { NextRequest, NextResponse } from 'next/server';

// Mock dashboard configs (in a real app, use database)
const mockDashboards: Record<string, any> = {};

// GET /api/dashboards/[userId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const config = mockDashboards[userId] || {};
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST /api/dashboards/[userId]
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    mockDashboards[userId] = body;
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error saving dashboard config:', error);
    return NextResponse.json({ success: false, error: 'Failed to save config' }, { status: 500 });
  }
}