document.addEventListener('htmx:beforeRequest', () => {
  const error = document.querySelector('#request-error');
  if (error) {
    error.hidden = true;
    error.textContent = '';
  }
});

for (const event of ['htmx:responseError', 'htmx:sendError', 'htmx:timeout']) {
  document.addEventListener(event, () => {
    const error = document.querySelector('#request-error');
    if (error) {
      error.textContent = 'Unable to update the greeting. Please try again.';
      error.hidden = false;
    }
  });
}