import express, { Request, Response } from 'express';
import { UsersModel } from '../models/users.model';

const usersModel = new UsersModel();

const router = express.Router();

router.post('/', async function (req: Request, res: Response) {
  const { steam_id, steam_api_key } = req.body || {};
  
  if (!steam_id || !steam_api_key) {
    return res.status(400).json({ error: "Dados necessarios não informados para a criação do usuário." });
  }

  try {
    const user = await usersModel.getUserBySteamId(steam_id);

    if (user) {
      return res.status(409).json({ error: "Usuário com esse id steam já existe." });
    }

    const newUser = await usersModel.createUser(steam_id, steam_api_key);

    if (!newUser) {
      return res.status(500).json({ error: "Erro ao adicionar usuário no banco de dados." });
    }

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});


router.get('/', async function (req: Request, res: Response) {
  try {
    const user = await usersModel.getUser();

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.put('/', async function (req: Request, res: Response) {
  const { steam_api_key } = req.body || {};
  
  if (!steam_api_key || steam_api_key === undefined) {
    return res.status(400).json({ error: "Chave da api não informada." });
  }

  try {
    const user = await usersModel.getUser();

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const updatedUser = await usersModel.updateApiKey(user.steam_id, steam_api_key);

    if (!updatedUser) {
      return res.status(500).json({ error: "Erro ao atualizar usuário no banco de dados." });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.delete('/', async function (req: Request, res: Response) {
  const { steam_id } = req.body || {};

  if (!steam_id) {
    return res.status(400).json({ error: "id steam não informada." });
  }

  try {
    const user = await usersModel.deleteUser(steam_id);

    if (!user) {
      return res.status(500).json({ error: "Erro ao excluir usuário no banco de dados." });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;