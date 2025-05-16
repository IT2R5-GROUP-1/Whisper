  const form = document.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Login successful! Welcome ' + data.user.username);
        // You can redirect or save token here
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  });
