const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('App rodando 🚀');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Servidor na porta 3000');
});

app.get('/heavy', (req, res) => {
  let total = 0;

  for (let i = 0; i < 1e8; i++) {
    total += i;
  }

  res.send(`Processamento pesado: ${total}`);
});