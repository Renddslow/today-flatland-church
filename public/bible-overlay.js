(() => {
  document.getElementById('bible-button').addEventListener('click', (e) => {
    e.preventDefault();
    const href = e.target.href ?? e.target.parentNode?.href;
    window.launchBible(href);
  });

  window.launchBible = (href) => {
    const iframe = document.createElement('iframe');
    iframe.src = href;
    iframe.classList.add('bible-overlay');
    document.body.appendChild(iframe);
    document.body.style.overflow = 'hidden';
    window.addEventListener('message', (e) => {
      if (e.data === 'close-bible-overlay') {
        iframe.remove();
        document.body.style.overflow = 'auto';
      }
    });
  };
})();
