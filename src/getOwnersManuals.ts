import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

const getOwnersManuals = async () => {
    const pathToManuals = path.join(process.cwd(), 'content', 'owners-manuals');
    return (
        await Promise.all(
            (
                await fs.readdir(pathToManuals)
            ).map(async (series) => {
                const manualPath = path.join(pathToManuals, series);
                const markdownData = await fs.readFile(manualPath, 'utf-8');
                return {
                    ...yaml.parse(markdownData),
                    path: manualPath,
                    slug: series.replace('.yml', ''),
                };
            }),
        )
    ).reduce((acc, manual) => ({ ...acc, [manual.slug]: manual }), {});
};

export default getOwnersManuals;
