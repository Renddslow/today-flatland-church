import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const getCards = async () => {
  const pathToCards = path.join(process.cwd(), 'content', 'cards');
  return (
    await Promise.all(
      (
        await fs.readdir(pathToCards)
      ).map(async (card) => {
        const cardPath = path.join(pathToCards, card);
        const markdownData = await fs.readFile(cardPath, 'utf-8');
        const { data, content } = matter(markdownData);
        return {
          ...data,
          body: content,
          path: cardPath,
          slug: card.replace('.md', ''),
        };
      }),
    )
  ).reduce((acc, card) => ({ ...acc, [card.slug]: card }), {});
};

export default getCards;
