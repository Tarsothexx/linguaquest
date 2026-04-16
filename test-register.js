// Script de teste para registro
import { registerUser } from './firebase.js';

async function testRegister() {
  console.log('🧪 Testando registro...');

  const result = await registerUser('test@example.com', '123456', 'Test User');

  if (result.success) {
    console.log('✅ Registro bem-sucedido:', result.user);
  } else {
    console.log('❌ Erro no registro:', result.error);
  }
}

testRegister();