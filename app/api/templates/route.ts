import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

export async function GET() {
  try {
    const templatesDirectory = path.join(process.cwd(), 'public/assets/templates');
    
    // Check if the directory exists before trying to read it
    if (!fs.existsSync(templatesDirectory)) {
      // If it doesn't exist, it's not an error, just return an empty array.
      return NextResponse.json({ files: [] });
    }

    const filenames = fs.readdirSync(templatesDirectory);
    
    const svgFiles = filenames.filter(file => file.endsWith('.svg'));

    if (svgFiles.length === 0) {
      return NextResponse.json({ pathData: null });
    }
    
    // Pick a random SVG
    const randomSvgFile = svgFiles[Math.floor(Math.random() * svgFiles.length)];
    const filePath = path.join(templatesDirectory, randomSvgFile);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Parse the SVG and extract the viewBox
    const dom = new JSDOM(fileContents);
    const svgElement = dom.window.document.querySelector("svg");
    const viewBox = svgElement ? svgElement.getAttribute('viewBox') : null;

    return NextResponse.json({ svgContent: fileContents, viewBox });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read or parse template file' }, { status: 500 });
  }
}
