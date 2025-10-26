import { NextRequest, NextResponse } from 'next/server';
import { forecaster, ForecastData } from '@/lib/forecasting';

// GET /api/forecasting - Get demand forecasts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const daysAhead = parseInt(searchParams.get('days') || '30');

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId parameter is required' },
        { status: 400 }
      );
    }

    const forecast = await forecaster.generateForecast(itemId, Math.min(daysAhead, 90)); // Max 90 days

    if (!forecast) {
      return NextResponse.json(
        { error: 'Insufficient data for forecasting this item' },
        { status: 404 }
      );
    }

    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}

// POST /api/forecasting/batch - Get forecasts for multiple items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemIds, daysAhead = 30 } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'itemIds array is required' },
        { status: 400 }
      );
    }

    if (itemIds.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 items can be forecasted at once' },
        { status: 400 }
      );
    }

    const forecasts: ForecastData[] = [];
    const errors: string[] = [];

    // Generate forecasts concurrently
    const forecastPromises = itemIds.map(async (itemId: string) => {
      try {
        const forecast = await forecaster.generateForecast(itemId, Math.min(daysAhead, 90));
        if (forecast) {
          forecasts.push(forecast);
        } else {
          errors.push(`Insufficient data for item ${itemId}`);
        }
      } catch (error) {
        errors.push(`Failed to forecast item ${itemId}: ${error}`);
      }
    });

    await Promise.all(forecastPromises);

    return NextResponse.json({
      forecasts,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalRequested: itemIds.length,
        successful: forecasts.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Error generating batch forecasts:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecasts' },
      { status: 500 }
    );
  }
}
