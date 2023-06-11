(() => {
  document.querySelector('#check-in').addEventListener('submit', (e) => {
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

    console.log(payload);
  });
})();
