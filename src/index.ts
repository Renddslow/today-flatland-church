import fs from 'fs';
import path from 'path';

import { Stylesheet } from './component';
import Card from './card';
import getCards from './getCards';
import YAML from 'yaml';

const main = async () => {
  console.log('☀️ Building today app!');

  const stylesheet = new Stylesheet();
  const cards = await getCards();
  const home = YAML.parse(
    fs.readFileSync(path.join(process.cwd(), 'content', 'home.yml'), 'utf-8'),
  );
  const cardComponents = home.cards.map((card: any) => {
    const cardData = cards[card];
    if (!cardData) {
      return;
    }
    const cardComponent = new Card(stylesheet, cardData);
    return cardComponent.render();
  });

  console.log(cardComponents);

  console.log(stylesheet.getStyles());
};

await main();
