import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/api-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const client = getServerClient();

  try {
    const [farmsRes, plans] = await Promise.allSettled([
      client.listFarms({ pageSize: 100 }),
      client.listHarvestPlans(new Date().getFullYear()),
    ]);

    const farms = farmsRes.status === 'fulfilled' ? farmsRes.value.rows : [];
    const harvestPlans = plans.status === 'fulfilled' ? plans.value : [];

    const activeFarms = farms.length;
    const activeHarvestPlans = harvestPlans.filter((p) => p.status === 'active').length;

    return NextResponse.json({
      activeFarms,
      activeHarvestPlans,
      alertsOpen: 0,
      harvestKgToday: 0,
    });
  } catch {
    return NextResponse.json({
      activeFarms: 0,
      activeHarvestPlans: 0,
      alertsOpen: 0,
      harvestKgToday: 0,
    });
  }
}
