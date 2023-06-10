import fs from 'fs';
import * as path from 'path';
import { load } from 'cheerio';
import CleanCSS from 'clean-css';

type IterableStyleTag = {
  collection: string;
  template: string;
};

type TemplateFile = {
  name: string;
  filepath: string;
  html: string;
  iterableStyles: IterableStyleTag[];
};

export class Component {
  template: TemplateFile;
  stylesheet: Stylesheet;

  constructor(stylesheet: Stylesheet) {
    this.stylesheet = stylesheet;
  }

  loadTemplate(name: string) {
    const fileName = `${name}.html`;

    const url = new URL(import.meta.url);
    const filepath = path.join(path.dirname(url.pathname), fileName);
    const template = fs.readFileSync(filepath, 'utf8');
    const $ = load(template);

    const staticStyles = [];

    $('style')
      .each((i, el) => {
        const [data] = el.children as unknown as (ChildNode & { data: string })[];
        staticStyles.push(data.data.trim());
      })
      .remove();

    const iterableStyles: IterableStyleTag[] = [];

    $('script[type="style/iterator"]')
      .each((i, el) => {
        const [data] = el.children as unknown as (ChildNode & { data: string })[];
        const tag = {
          collection: el.attribs['collection'],
          template: data.data.trim(),
        };
        iterableStyles.push(tag);
      })
      .remove();

    this.template = {
      name,
      filepath,
      iterableStyles,
      html: $('body').html() as string,
    };

    this.stylesheet.addStaticStyles(name, staticStyles.join('\n'));
    iterableStyles.forEach((style) => this.stylesheet.addIterableStyles(name, style));
  }
}

export class Stylesheet {
  #sheets: Map<string, string>;
  #iterableStyles: Map<string, IterableStyleTag[]>;

  constructor() {
    this.#sheets = new Map();
    this.#iterableStyles = new Map();
    this.getStyles.bind(this);
    this.getStylesForComponent.bind(this);
  }

  addStaticStyles(name: string, styles: string) {
    if (!this.#sheets.has(name)) {
      this.#sheets.set(name, styles);
    }
  }

  addIterableStyles(name: string, styles: IterableStyleTag) {
    const iterableStyles = this.#iterableStyles.get(name) || [];
    if (
      !iterableStyles
        .filter((style) => style.collection !== styles.collection)
        .some((style) => style.template === styles.template)
    ) {
      iterableStyles.push(styles);
      this.#iterableStyles.set(name, iterableStyles);
    }
  }

  generateIterableStyles(name: string, collection: string, data: Record<string, unknown>[]) {
    const staticStyles = this.#sheets.get(name) || '';
    const iterableStyles = this.#iterableStyles
      .get(name)
      .filter((style) => style.collection === collection);

    const style = iterableStyles.map((iterable) => {
      return data
        .map((item) => {
          let s = iterable.template || '';

          for (const [key, value] of Object.entries(item)) {
            const regex = new RegExp(`{{ .${key} }}`, 'g');
            s = s.replace(regex, value as string);
          }

          return s;
        })
        .join('\n');
    });

    const sheet = `${staticStyles}\n${style.join('\n')}`;
    this.#sheets.set(name, sheet);
    this.#iterableStyles.set(
      name,
      this.#iterableStyles.get(name).filter((style) => style.collection !== collection),
    );
  }

  getStylesForComponent(name: string) {
    const css = new CleanCSS({ level: 2 });
    return css.minify(this.#sheets.get(name) || '').styles;
  }

  getStyles() {
    return Array.from(this.#sheets.keys()).map((name) => this.getStylesForComponent(name));
  }
}
