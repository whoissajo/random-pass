const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const length = 12;
  const chars = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  let password = '';
  // Ensure at least one of each type
  password += chars.lowercase[crypto.randomInt(chars.lowercase.length)];
  password += chars.uppercase[crypto.randomInt(chars.uppercase.length)];
  password += chars.numbers[crypto.randomInt(chars.numbers.length)];
  password += chars.symbols[crypto.randomInt(chars.symbols.length)];

  // Fill the rest randomly
  const allChars = chars.lowercase + chars.uppercase + chars.numbers + chars.symbols;
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Shuffle the password
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  res.status(200).json({ password });
};
