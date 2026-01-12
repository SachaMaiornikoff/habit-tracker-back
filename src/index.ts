import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/habits', habitRoutes);

// Middleware global de gestion des erreurs (doit etre en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
