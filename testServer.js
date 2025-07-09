import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/user', (req, res) => {
  res.json({ message: 'User-Route funktioniert!' });
});

app.listen(3000, () => {
  console.log('Server läuft auf Port 3000');
});

