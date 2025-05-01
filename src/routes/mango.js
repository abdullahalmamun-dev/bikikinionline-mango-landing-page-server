import express from 'express';
import Mango from '../models/Mango.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const mangoes = await Mango.find();
    res.json(mangoes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mangoes', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mango = await Mango.findById(req.params.id);
    if (!mango) {
      return res.status(404).json({ message: 'Mango not found' });
    }
    res.json(mango);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mango', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const mango = new Mango(req.body);
    await mango.save();
    res.status(201).json(mango);
  } catch (error) {
    res.status(500).json({ message: 'Error creating mango', error });
  }
});

export default router;
