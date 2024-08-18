const crypto = require('crypto');

const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for hashing

function encodeID(password, round) {
  // Mã hóa mật khẩu sử dụng thuật toán sha256
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  // lây round ký tự đầu tiên
  return hash.substring(0, round);
}

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
    }
}

async function verifyPassword(plainPassword, hashedPassword) {
  try {
      return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
      console.error('Error verifying password:', err);
  }
}

module.exports = {encodeID, hashPassword, verifyPassword}