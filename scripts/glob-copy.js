import fs from 'fs';
import path from 'path';
import { globby } from 'globby';

const globCopy = async (dest) => {
  const files = await globby('src/**/*.html');
  for (const file of files) {
    const fileName = path.basename(file);
    fs.copyFileSync(file, path.join(dest, fileName));
  }
};

await globCopy(process.argv.slice(2)[0]);
