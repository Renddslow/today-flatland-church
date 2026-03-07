import 'https://unpkg.com/snarkdown@2.0.0/dist/snarkdown.umd.js';
import { getChapter, parseContent } from './render-bible.js';

export const createCover = (manual) => {
  const cover = document.createElement('div');
  cover.classList.add('cover');
  cover.style.backgroundImage = `url(${manual.image})`;

  const contents = document.createElement('div');

  const titleContainer = document.createElement('div');
  titleContainer.classList.add('title-container');
  contents.appendChild(titleContainer);

  const title = document.createElement('h1');
  title.innerText = manual.name;
  titleContainer.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.innerText = 'Owners Manual';
  titleContainer.appendChild(subtitle);

  const openButton = document.createElement('button');
  openButton.innerText = 'Open';
  openButton.addEventListener('click', openManual(manual));
  contents.appendChild(openButton);
  cover.appendChild(contents);
  return cover;
};

const openManual = (manual) => () => {
  const weeksSinceStart = Math.floor(
    (Date.now() - new Date(manual.starts_at)) / (1000 * 60 * 60 * 24 * 7),
  );
  const week = manual.weeks[weeksSinceStart];
  window.week = weeksSinceStart + 1;
  renderWeek(document.querySelector('.content'), manual, week, weeksSinceStart);
};

const renderWeek = (parent, manual, week, idx) => {
  parent.querySelectorAll('*').forEach((n) => {
    n.remove();
  });
  const header = document.createElement('div');
  header.classList.add('week-header');
  header.innerText = `${manual.name} - Week ${idx + 1}`;
  parent.appendChild(header);

  const title = document.createElement('h1');
  title.innerText = week.name;
  parent.appendChild(title);

  const notes = document.createElement('div');
  notes.innerHTML = `<h2>Sermon Notes</h2><div id="editor"></div>`;
  parent.appendChild(notes);
  window.editor = new toastui.Editor({
    el: document.querySelector('#editor'),
    height: '500px',
    initialEditType: 'wysiwyg',
    initialValue:
      window.localStorage.getItem(
        `owners-manual:${window.currentManual.starts_at}:${window.week}`,
      ) || '',
    previewStyle: 'vertical',
  });

  if (week.summary) {
    const summary = document.createElement('div');
    summary.classList.add('summary');
    summary.innerHTML = renderMarkdown(week.summary);
    parent.appendChild(summary);
  }

  if (week.scriptures && week.scriptures.length) {
    const scriptures = document.createElement('div');
    scriptures.classList.add('scriptures');
    parent.appendChild(scriptures);
    console.log(week.scriptures);
    Promise.all(
      week.scriptures.map(async (s) => ({
        ...(await getChapter(s.ref, 'niv')),
        ...s,
      })),
    ).then((res) => {
      res.forEach(({ content, title, flipped }) => {
        const chapter = document.createElement('div');
        chapter.classList.add('chapter');
        chapter.innerHTML = `<h2>${title}</h2>${parseContent(content).join('\n')}`;
        if (flipped.length) {
          chapter.querySelectorAll(`.lexicon[data-strongs="${flipped[0]}"]`).forEach((el) => {
            const a = document.createElement('a');
            const i = document.createElement('i');
            a.appendChild(i);
            a.href = el.dataset.href;
            a.classList.add('lexicon-ref');
            a.target = '_blank';
            a.innerHTML = `<i class="strongs">${
              el.dataset.strongs
            }</i><span>${el.dataset.transliteration.replace(/_(.*?)_/, '<em>$1</em>')}</span>`;

            el.parentNode.replaceChild(a, el);
          });
        }
        scriptures.appendChild(chapter);
      });
    });
  }

  if (week.questions) {
    const questions = document.createElement('div');
    const questionsHeader = document.createElement('h2');
    questionsHeader.innerText = 'Discussion Questions';
    questions.appendChild(questionsHeader);
    const list = document.createElement('ol');
    questions.appendChild(list);
    week.questions.forEach((question) => {
      const q = document.createElement('li');
      q.classList.add('question');
      q.innerHTML = renderMarkdown(question);
      list.appendChild(q);
    });
    parent.appendChild(questions);
  }

  if (week.announcements) {
    const announcements = document.createElement('div');
    const announcementsHeader = document.createElement('h2');
    announcementsHeader.innerText = 'Announcements';
    announcements.appendChild(announcementsHeader);

    const announcementsContainer = document.createElement('div');
    announcementsContainer.classList.add('announcements-container');
    announcements.appendChild(announcementsContainer);
    week.announcements.forEach((announcement) => {
      const card = announcement.card ? window.cards[announcement.card] : {};
      const description = announcement.description ?? card.description ?? '';

      const cardEl = document.createElement('a');
      cardEl.href = announcement.url || card.url || '#';
      cardEl.target = '_blank';
      cardEl.classList.add('announcement-card');

      const img = document.createElement('img');
      img.src = card.image;
      cardEl.appendChild(img);

      const content = document.createElement('div');
      content.classList.add('card-content');
      content.innerHTML = `<h2>${card.title}</h2><p class="text">${description}</p>`;
      cardEl.appendChild(content);

      announcementsContainer.appendChild(cardEl);
    });
    parent.appendChild(announcements);
    document.querySelectorAll('.scripture-ref').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const refRaw = e.target.dataset.ref;
        const [bookChapter, verse] = refRaw.split(':');
        const [book, chapter] = bookChapter.split(' ');
        const bookId = BOOK_TO_REF[book];
        const ref = `${bookId}${chapter}.${verse}`;

        window.launchBible(`/bible?ref=${ref}`);
      });
    });
  }

  // TODO: add navigation
};

const BOOK_TO_REF = {
  Matthew: 'mat',
};

const renderMarkdown = (text) => {
  const highlighted = text.replace(/==(.+?)==/g, '<mark>$1</mark>');
  const scriptured = highlighted.replace(
    /\[\[(.+?)]]/g,
    '<a class="scripture-ref" href="#" data-ref="$1"><i class="fa fa-book-open"></i> $1</a>',
  );
  return window.snarkdown(scriptured);
};
