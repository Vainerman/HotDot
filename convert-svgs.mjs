import { promises as fs } from 'fs';
import path from 'path';
import { optimize } from 'svgo';

const templatesDir = path.resolve('public/assets/templates');

async function getAllSvgFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getAllSvgFiles(res) : res;
    }));
    return Array.prototype.concat(...files).filter(file => file.endsWith('.svg'));
}

const svgoConfig = {
  multipass: true,
  plugins: [
    {
      name: 'convertShapeToPath',
      params: {
        convertArcs: true,
      },
    },
    {
      name: 'convertPathData',
      params: {
          // Using default params which are safe
      }
    },
    {
      name: 'mergePaths'
    },
    {
      name: 'collapseGroups'
    },
    {
      name: 'removeComments'
    },
    {
      name: 'removeMetadata'
    },
    {
      name: 'removeTitle'
    },
    {
      name: 'removeDesc'
    },
    {
      name: 'removeUselessDefs'
    },
  ],
};

(async () => {
  const filesToProcess = await getAllSvgFiles(templatesDir);
  console.log(`Found ${filesToProcess.length} SVG files to process.`);
  let processedCount = 0;
  for (const file of filesToProcess) {
    const filePath = file;
    try {
      console.log(`Processing ${path.basename(file)}...`);
      const svgContent = await fs.readFile(filePath, 'utf-8');
      const { data: optimizedSvg } = optimize(svgContent, svgoConfig);
      await fs.writeFile(filePath, optimizedSvg, 'utf-8');
      processedCount++;
      console.log(`Successfully simplified ${path.basename(file)}`);
    } catch (error) {
      console.error(`Error processing ${path.basename(file)}:`, error);
    }
  }
  console.log(`SVG simplification process complete. Processed ${processedCount} out of ${filesToProcess.length} files.`);
})(); 