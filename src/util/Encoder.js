const crypto = require('crypto');

function encode(password, round) {
  // Mã hóa mật khẩu sử dụng thuật toán sha256
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  // lây round ký tự đầu tiên
  return hash.substring(0, round);
}

module.exports = {encode}