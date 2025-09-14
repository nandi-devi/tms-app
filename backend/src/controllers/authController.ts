import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Setting from '../models/setting';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const setup = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const passwordHashSetting = await Setting.findOne({ key: 'passwordHash' });
        if (passwordHashSetting) {
            return res.status(400).json({ message: 'Password already set' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await Setting.create({ key: 'passwordHash', value: passwordHash });

        res.status(201).json({ message: 'Password set successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const passwordHashSetting = await Setting.findOne({ key: 'passwordHash' });
        if (!passwordHashSetting) {
            return res.status(401).json({ message: 'Application not set up yet.' });
        }

        const isMatch = await bcrypt.compare(password, passwordHashSetting.value);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// A check to see if the app has a password set already
export const checkSetup = async (req: Request, res: Response) => {
    try {
        const passwordHashSetting = await Setting.findOne({ key: 'passwordHash' });
        res.json({ isSetup: !!passwordHashSetting });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
