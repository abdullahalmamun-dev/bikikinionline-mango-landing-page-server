// backend/src/routes/mango.ts
import express, { Request, Response } from 'express';
import Mango from '../models/Mango';

const router = express.Router();

// Get all mangoes
router.get('/', (async (req: Request, res: Response) => {
  try {
    const mangoes = await Mango.find();
    res.json(mangoes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mangoes', error });
  }
}) as express.RequestHandler);

// Get mango by ID
router.get('/:id', (async (req: Request, res: Response) => {
  try {
    const mango = await Mango.findById(req.params.id);
    if (!mango) {
      return res.status(404).json({ message: 'Mango not found' });
    }
    res.json(mango);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mango', error });
  }
}) as express.RequestHandler);

// Create new mango
router.post('/', (async (req: Request, res: Response) => {
  try {
    const mango = new Mango(req.body);
    await mango.save();
    res.status(201).json(mango);
  } catch (error) {
    res.status(500).json({ message: 'Error creating mango', error });
  }
}) as express.RequestHandler);

export default router;
