import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('challenges')
    .select('template_svg, template_viewbox')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  return NextResponse.json({
    template_svg: data.template_svg,
    template_viewbox: data.template_viewbox,
  });
}
