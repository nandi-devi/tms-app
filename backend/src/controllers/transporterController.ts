import { Request, Response } from 'express';
import { Transporter } from '../models/truckHiringNote';

export const getAllTransporters = async (req: Request, res: Response) => {
  try {
    const transporters = await Transporter.find({ isActive: true }).sort({ name: 1 });
    res.json(transporters);
  } catch (error) {
    console.error('Error fetching transporters:', error);
    res.status(500).json({ message: 'Failed to fetch transporters' });
  }
};

export const getTransporterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transporter = await Transporter.findById(id);
    
    if (!transporter) {
      return res.status(404).json({ message: 'Transporter not found' });
    }
    
    res.json(transporter);
  } catch (error) {
    console.error('Error fetching transporter:', error);
    res.status(500).json({ message: 'Failed to fetch transporter' });
  }
};

export const createTransporter = async (req: Request, res: Response) => {
  try {
    const transporter = new Transporter(req.body);
    await transporter.save();
    res.status(201).json(transporter);
  } catch (error) {
    console.error('Error creating transporter:', error);
    res.status(500).json({ message: 'Failed to create transporter' });
  }
};

export const updateTransporter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transporter = await Transporter.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!transporter) {
      return res.status(404).json({ message: 'Transporter not found' });
    }
    
    res.json(transporter);
  } catch (error) {
    console.error('Error updating transporter:', error);
    res.status(500).json({ message: 'Failed to update transporter' });
  }
};

export const deleteTransporter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transporter = await Transporter.findByIdAndUpdate(id, { isActive: false }, { new: true });
    
    if (!transporter) {
      return res.status(404).json({ message: 'Transporter not found' });
    }
    
    res.json({ message: 'Transporter deleted successfully' });
  } catch (error) {
    console.error('Error deleting transporter:', error);
    res.status(500).json({ message: 'Failed to delete transporter' });
  }
};
