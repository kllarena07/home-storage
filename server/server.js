// Install Express and CORS by running: npm install express cors
import express from 'express';
import cors from 'cors';

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());

app.get('/', (req, res) => {
  console.log('[GET /] Request received');
  res.send('hello world');
  console.log('[GET /] Response sent: hello world');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
