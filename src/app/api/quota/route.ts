import { NextResponse } from 'next/server';
import { getQuotaUsage } from '@/lib/quota';

export async function GET() {
  try {
    const usage = getQuotaUsage();

    return NextResponse.json({
      ...usage,
      quotaLimit: 10000,
      quotaRemaining: 10000 - usage.totalQuotaUsed,
      recommendedActions:
        usage.totalQuotaUsed > 8000
          ? [
              'Increase cache times',
              'Reduce API calls in mixed mode',
              'Consider implementing request deduplication',
            ]
          : [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get quota usage' },
      { status: 500 }
    );
  }
}
