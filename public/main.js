(() => {
  document.querySelector('#check-in').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const { visit, salvation, recommit, groups, ...rest } = Object.fromEntries(data.entries());

    const payload = {
      data: {
        type: 'check_in',
        attributes: {
          ...rest,
          visit: visit === 'visit',
          salvation: salvation === 'salvation',
          recommit: recommit === 'recommit',
          groups: groups === 'groups',
        },
      },
    };

    await fetch('/.netlify/functions/check-in', {
      type: 'POST',
      body: JSON.stringify(payload),
    });

    document.querySelector('#check-in').remove();

    const success = document.createElement('div');
    success.classList.add('checked-in');
    success.innerHTML = `<div class="circle">
          <span class="material-icons-outlined">check</span>
        </div>
        <p><strong>Success!</strong> You're checked in, enjoy the service.</p>`;

    const successStyle = document.createElement('style');
    successStyle.innerHTML = `
      .checked-in {
        width: 85%;
        display: none;
        margin: 24px auto;
        border-radius: 8px;
        box-shadow: 0 6px 24px -6px rgba(0, 0, 95, 0.3);
        background: #27d68b;
        color: #002131;
        box-sizing: border-box;
        padding: 12px;
        grid-template-columns: minmax(0, max-content) minmax(0, 1fr);
        grid-gap: 8px;
      }

      .checked-in .circle {
        padding: 4px;
        background: #fff6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }
    `;

    document.querySelector('.list').prepend(success);
    document.head.append(successStyle);
  });
})();
