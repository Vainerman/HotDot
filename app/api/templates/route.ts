import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatesDirectory = path.join(process.cwd(), 'public/assets/templates');
    const filenames = fs.readdirSync(templatesDirectory);
    
    const svgFiles = filenames.filter(file => file.endsWith('.svg'));

    return NextResponse.json({ files: svgFiles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read template files' }, { status: 500 });
  }
}
