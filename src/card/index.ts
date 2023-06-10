import { Stylesheet, Component } from '../component';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

type Category = {
  slug: string;
  title: string;
  color: string;
};

class Card extends Component {
  #styles: string;
  #iterableStyleTemplates: string[];

  #categories: Category[];

  constructor(stylesheet: Stylesheet) {
    super(stylesheet);
    this.loadTemplate('Card');
    this.loadCategories();
    this.stylesheet.generateIterableStyles('Card', this.#categories);

    console.log(this.stylesheet.getStylesForComponent('Card'));
  }

  loadCategories() {
    const basePath = path.join(process.cwd(), 'content', 'categories');
    this.#categories = fs.readdirSync(basePath).map((file) => {
      const f = fs.readFileSync(path.join(basePath, file), 'utf8');
      return {
        slug: file.replace(/\.(yml|yaml)/, ''),
        ...YAML.parse(f),
      };
    });
  }
}

export default Card;
