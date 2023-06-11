import { Stylesheet, Component } from '../component';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import templite from 'templite';

type Category = {
  slug: string;
  title: string;
  color: string;
};

type Data = {
  title: string;
  body: string;
  category: Category;
  image: string;
  url: string;
};

class Card extends Component {
  #categories: Category[];
  #data: Data;

  constructor(stylesheet: Stylesheet, data: Data) {
    super(stylesheet);
    this.#data = data;
    this.loadTemplate('Card');
    this.loadCategories();
    this.stylesheet.generateIterableStyles('Card', 'categories', this.#categories);
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

  render() {
    return templite(this.template.html, this.#data);
  }
}

export default Card;
