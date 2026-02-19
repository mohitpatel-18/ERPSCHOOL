const generatePassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const generateEmployeeId = (role, count) => {
  const prefix = role === 'teacher' ? 'TCH' : 'STU';
  const year = new Date().getFullYear().toString().slice(-2);
  const number = String(count + 1).padStart(4, '0');
  return `${prefix}${year}${number}`;
};

module.exports = {
  generatePassword,
  generateEmployeeId,
};