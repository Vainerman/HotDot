import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatesDirectory = path.join(process.cwd(), 'public/assets/templates');
    
    if (!fs.existsSync(templatesDirectory)) {
      return NextResponse.json({ files: [] });
    }

    const filenames = fs.readdirSync(templatesDirectory);
    
    const svgFiles = filenames.filter(file => file.endsWith('.svg'));

    if (svgFiles.length === 0) {
      return NextResponse.json({ pathData: null });
    }
    
    const randomSvgFile = svgFiles[Math.floor(Math.random() * svgFiles.length)];
    const filePath = path.join(templatesDirectory, randomSvgFile);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Use a regular expression to extract the viewBox attribute
    const viewBoxMatch = fileContents.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : null;

    return NextResponse.json({ svgContent: fileContents, viewBox });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read or parse template file' }, { status: 500 });
  }
}
