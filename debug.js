console.log('User from localStorage:', localStorage.getItem('user')); console.log('Parsed user:', JSON.parse(localStorage.getItem('user') || '{}'));
