import bcrypt from 'bcryptjs';

async function test() {
  const hash = '$2b$10$G6jPP6GUkonwLrtE7nNxSeQ5mx5SDhgoU8rB2qMnQ80PhvDoqX5/W';
  const isValid = await bcrypt.compare('admin', hash);
  console.log('Is valid:', isValid);
}

test();
