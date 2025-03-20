import http from 'k6/http';
import { sleep } from 'k6';

function esperaAPI() {
  let tentativas = 0;
  while (tentativas < 5) {
    const res = http.get('http://api:3000/');
    if (res.status === 200) {
      console.log('✅ API Go disponível, iniciando testes...');
      return true;
    }
    console.log('⏳ Aguardando API Go...');
    sleep(2);
    tentativas++;
  }
  console.error('❌ API Go não respondeu a tempo.');
  return false;
}

export default function () {
  if (!esperaAPI()) return;

  const email = `user${Math.floor(Math.random() * 10000)}@homelab.com`;
  const password = "123456";

  // --- Cadastro ---
  const registerRes = http.post('http://api:3000/users', JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (registerRes.status !== 200) {
    console.error(`❌ Erro ao cadastrar usuário (${registerRes.status})`);
    return;
  }

  const userId = registerRes.json('id');
  if (!userId) {
    console.error("❌ ID do usuário não recebido.");
    return;
  }

  // --- Login ---
  const loginRes = http.post('http://api:3000/login', JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' }
  });

  const token = loginRes.json('token');
  if (!token) {
    console.error("❌ Token não recebido.");
    return;
  }

  // --- Criar Task ---
  const task = {
    name: 'Task LoadGen',
    priority: 'Alta',
    date: '2025-12-31',
    userId
  };

  const taskRes = http.post('http://api:3000/tasks', JSON.stringify(task), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (taskRes.status !== 200) {
    console.error(`❌ Erro ao criar task (${taskRes.status})`);
  } else {
    console.log(`✅ Task criada com sucesso para ${email}`);
  }

  sleep(1); // simula tempo entre ações
}
