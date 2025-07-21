import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('template_svg, template_viewbox')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching challenge:', error);
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
