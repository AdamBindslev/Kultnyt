import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skipAi = searchParams.get('skipAi') === 'true';

  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scripts', 'harvest.py');
  // Quote scriptPath to handle spaces in directory name safely
  const pythonCmd = `/usr/bin/python3 "${scriptPath}" --limit 3 ${skipAi ? '--skip-ai' : ''}`;

  return new Promise<Response>((resolve) => {
    exec(pythonCmd, { cwd: projectRoot, timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Harvest exec error:', error, stderr);
      }

      const dataDir = path.join(projectRoot, 'data');
      const readJson = (filename: string, fallback: any) => {
        const filePath = path.join(dataDir, filename);
        if (fs.existsSync(filePath)) {
          try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          } catch (e) {
            return fallback;
          }
        }
        return fallback;
      };

      const news = readJson('news.json', []);
      const releases = readJson('releases.json', []);
      const concerts = readJson('concerts.json', []);
      const meta = readJson('meta.json', null);

      resolve(
        NextResponse.json({
          success: !error,
          message: error ? 'Høst gennemført med fejl eller timeout' : 'Høst gennemført med succes',
          news,
          releases,
          concerts,
          meta,
        })
      );
    });
  });
}
