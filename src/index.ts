import { Stylesheet } from './component';
import Card from './card';

const main = () => {
  const stylesheet = new Stylesheet();
  const card = new Card(stylesheet, {
    title: 'Hello World',
    body: 'This is a description',
    category: {
      slug: 'men',
      title: 'NPC',
      color: '#ff0000',
    },
    image: 'https://via.placeholder.com/150',
    link: 'https://google.com',
  });
  console.log(card.render());
  console.log('☀️ Building today app!');

  console.log(stylesheet.getStyles());
};

main();
