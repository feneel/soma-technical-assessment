import { NextResponse } from 'next/server';
import { calculateSchedulingInfo } from '@/lib/utils';

export async function POST() {
  try {
    await calculateSchedulingInfo();
    return NextResponse.json({ message: 'Scheduling info calculated.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to calculate' }, { status: 500 });
  }
}
