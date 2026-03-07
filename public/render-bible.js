import 'https://unpkg.com/snarkdown@2.0.0/dist/snarkdown.umd.js';

/**
 * Get the USX style line modifier for a given line.
 * @param {string} line
 * @returns {string}
 */
export const getLineModifier = (line) => {
  const lineStyleRegexpr = /^\\(lh|lf|li(\d)?|q(\d)?)/;
  if (!lineStyleRegexpr.test(line)) {
    return '';
  }
  const [, lineStyle] = lineStyleRegexpr.exec(line);
  return lineStyle;
};

const bookMap = {
  mat: 'Matthew',
};

export const getChapter = async (ref, version) => {
  const simpleRef = ref.split('.')[0].toLowerCase();
  let chapter = await fetch(`/bible/${simpleRef}.${version}.md`).then((d) => d.text());
  const [, book, ch, verses] = /(.{3})(\d+)(\.(\d+)?(-)?(\d+))?/.exec(ref);

  const [start, end] = (verses ? verses.replace('.', '').split('-') : []).map(Number);

  if (start) {
    const startIdx = chapter.indexOf(`{${start}}`);
    const endIdx = chapter.indexOf(`{${end ? end + 1 : start + 1}}`);
    chapter = chapter.slice(startIdx, endIdx > -1 ? endIdx : chapter.length);
  }

  return {
    content: chapter,
    title: getChapterTitle(book, ch, verses),
  };
};

export const getChapterTitle = (book, chapter, verses) => {
  return `${bookMap[book.toLowerCase()]} ${chapter}${
    verses ? verses.replace('.', ':').replace('-', '–') : ''
  }`;
};

export const parseContent = (chapter) =>
  chapter
    .split('\n')
    .map((line) => line.trim())
    .map((line) => {
      const style = getLineModifier(line);
      const content = line.replace(`\\${style}`, '').trim();
      const lineObj = {
        content,
      };
      if (style) {
        lineObj.style = style;
      }
      return lineObj;
    })
    .map((line) => {
      line.content = window.snarkdown(
        line.content
          .replace(/\{(\d+)}/g, '<sup class="verse-number">$1</sup>')
          .replace(/==(.+?)==/g, '<mark>$1</mark>')
          .replace(
            /\[\[(.*?)\|(.*?)\|(.*?)]]/,
            '<span data-href="https://www.blueletterbible.org/lexicon/$3/kjv/tr/0-1/" data-strongs="$3" data-transliteration="$2" class="lexicon">$1</span>',
          ),
      );
      return line;
    })
    .map((line) => {
      return `<p class="${line.style || ''}">${line.content}</p>`;
    });
