import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (_, res) => {
  res.send('API Similar Products working 🚀');
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
