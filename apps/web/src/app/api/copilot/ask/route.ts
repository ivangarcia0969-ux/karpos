import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/api-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.question || typeof body.question !== 'string') {
    return NextResponse.json({ error: 'invalid_question' }, { status: 400 });
  }
  try {
    const data = await getServerClient().ask({ question: body.question });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'upstream_failure', message: (err as Error).message },
      { status: 502 },
    );
  }
}
