const bcrypt = require('bcrypt');

async function run() {
  const newPassword = '123456'; // mật khẩu mới
  const hash = await bcrypt.hash(newPassword, 10);
  console.log('Hash mới:', hash);
}

run();
