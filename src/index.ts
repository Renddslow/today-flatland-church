import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import templite from 'templite';

import { Stylesheet } from './component';
import Card from './card';
import Form from './form';
import ListPage from './listPage';
import getCards from './getCards';

const main = async () => {
  console.log('🌤️ Building today app!');
  const tick = Date.now();

  const stylesheet = new Stylesheet();

  // Fetch data
  const cards = await getCards();
  const home = YAML.parse(
    fs.readFileSync(path.join(process.cwd(), 'content', 'home.yml'), 'utf-8'),
  );

  const cardComponents = home.cards
    .map((card: any) => {
      const cardData = cards[card];
      if (!cardData) {
        return;
      }
      return new Card(stylesheet, cardData);
    })
    .filter(Boolean);

  // Render
  const list = new ListPage(stylesheet);
  const form = new Form(stylesheet);
  const htmlBody = list.render([form, ...cardComponents]);

  const url = new URL(import.meta.url);
  const wrapperFilepath = path.join(path.dirname(url.pathname), `wrapper.html`);
  const wrapper = fs.readFileSync(wrapperFilepath, 'utf8');

  fs.writeFileSync(
    path.join(process.cwd(), 'public/index.html'),
    templite(wrapper, { children: htmlBody, stylesheet: stylesheet.getStyles() }),
  );
  const tock = Date.now();
  console.log(`🌤️ Built today app in ${tock - tick}ms!`);
};

await main();
