import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';
import habitEntryRoutes from './routes/habitEntry.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://habit-tracker-sacha.netlify.app',
  credentials: true
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/habits', habitRoutes);
app.use('/habit-entries', habitEntryRoutes);

// Middleware global de gestion des erreurs (doit etre en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
