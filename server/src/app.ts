import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import gamesRouter from './routes/games';
import genresRouter from './routes/genres';
import gameGenresRouter from './routes/gameGenres';
import collectionsRouter from './routes/collections';
import collectionGamesRouter from './routes/collectionGames';
import steamApiRouter from './routes/steamApi';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.frontend_host,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/users', usersRouter);
app.use('/games', gamesRouter);
app.use('/genres', genresRouter);
app.use('/game-genres', gameGenresRouter);
app.use('/collections', collectionsRouter);
app.use('/collection-games', collectionGamesRouter);
app.use('/steam-api', steamApiRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});