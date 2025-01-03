const fastify = require('fastify')({ logger: true });

let users = []; // Lista em memória para armazenar usuários

// Função para validar o formato de email
const isValidEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);

fastify.post('/api/users', async (request, reply) => {
  const usersData = request.body; // Espera um array de usuários

  // Validação de dados
  if (!Array.isArray(usersData)) {
    return reply.status(400).send({ message: 'O corpo da requisição deve ser um array de usuários' });
  }

  const invalidUsers = usersData.filter(user => !user.name || !user.email || !isValidEmail(user.email));

  if (invalidUsers.length > 0) {
    return reply.status(400).send({ message: 'Alguns usuários têm dados inválidos', invalidUsers });
  }

  // Adiciona todos os usuários ao array
  const newUsers = usersData.map(user => {
    const newUser = { id: users.length + 1, name: user.name, email: user.email };
    users.push(newUser);
    return newUser;
  });

  reply.status(201).send(newUsers);
});

fastify.get('/api/users', async (request, reply) => {
  const { name, email } = request.query;

  let filteredUsers = users;

  if (name) {
    filteredUsers = filteredUsers.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (email) {
    filteredUsers = filteredUsers.filter(user => user.email.toLowerCase().includes(email.toLowerCase()));
  }

  reply.send(filteredUsers);
});

fastify.get('/api/users/:id', async (request, reply) => {
  const user = users.find((u) => u.id === parseInt(request.params.id));
  if (user) {
    reply.send(user);
  } else {
    reply.status(404).send({ message: "Usuário não encontrado" });
  }
});

fastify.put('/api/users/:id', async (request, reply) => {
  const { id } = request.params;
  const { name, email } = request.body;

  const userIndex = users.findIndex((u) => u.id === parseInt(id));
  if (userIndex !== -1) {
    if (name) users[userIndex].name = name;
    if (email) {
      if (!isValidEmail(email)) {
        return reply.status(400).send({ message: 'Email inválido' });
      }
      users[userIndex].email = email;
    }
    reply.send(users[userIndex]);
  } else {
    reply.status(404).send({ message: "Usuário não encontrado" });
  }
});

fastify.delete('/api/users/:id', async (request, reply) => {
  const { id } = request.params;
  const userIndex = users.findIndex((u) => u.id === parseInt(id));
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    reply.send({ message: "Usuário deletado com sucesso" });
  } else {
    reply.status(404).send({ message: "Usuário não encontrado" });
  }
});

// Rota para contar o número de usuários
fastify.get('/api/users/count', async (request, reply) => {
  reply.send({ count: users.length });
});

// Rota para buscar usuários por nome (case-insensitive)
fastify.get('/api/users/search', async (request, reply) => {
  const { name } = request.query;
  if (!name) {
    return reply.status(400).send({ message: 'Nome é obrigatório para a busca' });
  }

  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
  reply.send(filteredUsers);
});

const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
    console.log('Servidor rodando na porta 5000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
