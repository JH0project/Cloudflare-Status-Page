import { MetadataRoute } from "next";
import fs from "fs/promises";
import config from '../../../config.json'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dirs: string[] = [''];
  const staticPages: string[] = [];

  while (dirs.length !== 0) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(dirs.map(async (dir) => {
      const index = dirs.indexOf(dir);
      if (index !== -1) {
        dirs.splice(index, 1);
      }
      const files = await fs.readdir(`src/app${dir}`, { withFileTypes: true });
      files.filter((file) => ![
        '_app.tsx',
        '_document.tsx',
        '_error.tsx',
        'sitemap.ts',
        'head.tsx',
        'layout.tsx',
      ].includes(file.name)).forEach((file) => {
        if (file.name === 'auth') return;
        if (file.isDirectory()) {
          dirs.push(`${dir}/${file.name}`);
          return;
        }
        if (file.name != 'page.tsx' && file.name != 'route.ts' && !file.name.endsWith('.mdx'))
          return

        staticPages.push(`${config.settings.url}${dir}${(`/${file.name}`)}`
          .replace(/\/\[[A-z]+\]/, '')
          .replace(/\/\([A-z]+\)/, '')
          .replace('.tsx', '')
          .replace('.mdx', '')
          .replace('.ts', '')
          .replace('/page', '')
          .replace('/route', ''));
      });
    }));
  }

  const seen: {
    [key: string]: number
  } = {};
  const out: typeof staticPages = [];
  const len = staticPages.length;
  let j = 0;
  for (var i = 0; i < len; i++) {
    const item = staticPages[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }

  return out.map((url) => ({
    url: url,
    lastModified: new Date().toISOString(),
  }))

};
