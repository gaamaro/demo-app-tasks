import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// --- Criar usuário ---
app.post('/users', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });
  console.log(`Respondendo com versão ${version}`);

  res.json({ id: user.id, email: user.email });
});

// --- Login do usuário ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Se deu tudo certo
  console.log(`Respondendo com versão ${version}`);
  return res.status(200).json({ userId: user.id });
});

// --- Listar usuários (debug) ---
app.get('/users', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });
  console.log(`Respondendo com versão ${version}`);
  res.json(users);
});

// --- CRUD Tasks ---
app.get('/tasks', async (_req: Request, res: Response) => {
  const tasks = await prisma.task.findMany();
  console.log(`Respondendo com versão ${version}`);
  res.json(tasks);
});

app.post('/tasks', async (req: Request, res: Response) => {
  const { name, priority, date, userId } = req.body;
  const task = await prisma.task.create({
    data: { name, priority, date: new Date(date), userId },
  });
  console.log(`Respondendo com versão ${version}`);
  res.json(task);
});

app.put('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, priority, date } = req.body;
  const task = await prisma.task.update({
    where: { id: Number(id) },
    data: { name, priority, date: new Date(date) },
  });
  console.log(`Respondendo com versão ${version}`);
  res.json(task);
});

app.delete('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.task.delete({
    where: { id: Number(id) },
  });
  console.log(`Respondendo com versão ${version}`);
  res.json({ message: 'Task removida' });
});

const version = process.env.VERSION || '1'; // default = v1

app.get('/version', (req, res) => {
  console.log(`Respondendo com versão ${version}`);
  res.json({ version });
});

app.listen(3001, () => {
  console.log('Backend Node rodando na porta 3001 🚀');
});
