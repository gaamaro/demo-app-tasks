import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  name: string;
  priority: string;
  date: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('Baixa');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const token = localStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:3000/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch {
      setError('Erro ao carregar tarefas.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await axios.put(`http://localhost:3000/tasks/${editingTaskId}`, {
          name, priority, date,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:3000/tasks', {
          name, priority, date,
          userId: getUserIdFromToken(), // pega userId real
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      clearForm();
      fetchTasks();
    } catch {
      setError('Erro ao salvar tarefa.');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setName(task.name);
    setPriority(task.priority);
    setDate(task.date.slice(0, 10));
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch {
      setError('Erro ao remover tarefa.');
    }
  };

  const clearForm = () => {
    setName('');
    setPriority('Baixa');
    setDate('');
    setEditingTaskId(null);
  };

  const getUserIdFromToken = (): number => {
    if (!token) return 0;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId; // precisa ter userId no token
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Suas Tarefas</h2>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Sair
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleAddOrUpdate} className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">{editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
        <input
          type="text"
          placeholder="Nome da tarefa"
          className="w-full p-2 mb-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="w-full p-2 mb-2 border rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Baixa">Baixa</option>
          <option value="Média">Média</option>
          <option value="Alta">Alta</option>
        </select>
        <input
          type="date"
          className="w-full p-2 mb-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {editingTaskId ? 'Atualizar' : 'Adicionar'}
          </button>
          {editingTaskId && (
            <button type="button" onClick={clearForm} className="flex-1 bg-gray-400 text-white p-2 rounded hover:bg-gray-500">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="mb-2 p-4 bg-gray-100 rounded shadow flex justify-between items-center">
            <div>
              <strong>{task.name}</strong> - {task.priority} - {new Date(task.date).toLocaleDateString()}
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(task)} className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500">
                Editar
              </button>
              <button onClick={() => handleDelete(task.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
