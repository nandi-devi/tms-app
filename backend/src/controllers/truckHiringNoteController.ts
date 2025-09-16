import { Request, Response } from 'express';
import TruckHiringNote, { Transporter } from '../models/truckHiringNote';
import { getNextSequenceValue } from '../utils/sequence';

export const getTruckHiringNotes = async (req: Request, res: Response) => {
  try {
    const { status, sortBy, sortOrder, filter } = req.query;
    let query: any = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (filter === 'thisWeek') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      query.date = { $gte: startOfWeek.toISOString().split('T')[0] };
    } else if (filter === 'thisMonth') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query.date = { $gte: startOfMonth.toISOString().split('T')[0] };
    } else if (filter === 'outstanding') {
      query.balancePayable = { $gt: 0 };
    }
    
    // Sorting
    let sort: any = { thnNumber: -1 };
    if (sortBy) {
      sort = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };
    }
    
    const notes = await TruckHiringNote.find(query).populate('payments').sort(sort);
    res.json(notes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTruckHiringNoteById = async (req: Request, res: Response) => {
    try {
        const note = await TruckHiringNote.findById(req.params.id).populate('payments');
        if (note == null) {
            return res.status(404).json({ message: 'Cannot find Truck Hiring Note' });
        }
        res.json(note);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const createTruckHiringNote = async (req: Request, res: Response) => {
  const { 
    freight, 
    advancePaid, 
    fuelCharges = 0, 
    tollCharges = 0, 
    otherCharges = 0,
    transporterId,
    isDraft = false,
    ...rest 
  } = req.body;

  try {
    // Validate truck number format (e.g., TN 20 AB 1234)
    const truckNumberRegex = /^[A-Z]{2}\s\d{2}\s[A-Z]{2}\s\d{4}$/;
    if (!truckNumberRegex.test(rest.truckNumber)) {
      return res.status(400).json({ 
        message: 'Invalid truck number format. Expected format: XX 00 XX 0000',
        fieldErrors: { truckNumber: 'Invalid format. Use format like TN 20 AB 1234' }
      });
    }

    // Validate delivery date is after loading date
    if (rest.loadingDate && rest.expectedDeliveryDate) {
      if (new Date(rest.expectedDeliveryDate) <= new Date(rest.loadingDate)) {
        return res.status(400).json({
          message: 'Delivery date must be after loading date',
          fieldErrors: { expectedDeliveryDate: 'Must be after loading date' }
        });
      }
    }

    // Validate advance doesn't exceed total charges
    const totalCharges = freight + fuelCharges + tollCharges + otherCharges;
    if (advancePaid > totalCharges) {
      return res.status(400).json({
        message: 'Advance payment cannot exceed total charges',
        fieldErrors: { advancePaid: 'Cannot exceed total charges' }
      });
    }

    const nextThnNumber = await getNextSequenceValue('truckHiringNoteId');

    // If transporterId is provided, fetch transporter details
    let transporterDetails = {};
    if (transporterId) {
      const transporter = await Transporter.findById(transporterId);
      if (transporter) {
        transporterDetails = {
          transporterPhone: transporter.phone,
          transporterAddress: transporter.address,
          transporterGstin: transporter.gstin,
          transporterPan: transporter.pan,
        };
      }
    }

    const note = new TruckHiringNote({
      ...rest,
      ...transporterDetails,
      thnNumber: nextThnNumber,
      freight,
      advancePaid,
      fuelCharges,
      tollCharges,
      otherCharges,
      totalCharges,
      balancePayable: totalCharges - advancePaid,
      isDraft,
    });

    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTruckHiringNote = async (req: Request, res: Response) => {
    try {
        const { 
            freight, 
            advancePaid, 
            fuelCharges = 0, 
            tollCharges = 0, 
            otherCharges = 0,
            transporterId,
            ...rest 
        } = req.body;

        // Validate truck number format if provided
        if (rest.truckNumber) {
            const truckNumberRegex = /^[A-Z]{2}\s\d{2}\s[A-Z]{2}\s\d{4}$/;
            if (!truckNumberRegex.test(rest.truckNumber)) {
                return res.status(400).json({ 
                    message: 'Invalid truck number format. Expected format: XX 00 XX 0000',
                    fieldErrors: { truckNumber: 'Invalid format. Use format like TN 20 AB 1234' }
                });
            }
        }

        // Validate delivery date is after loading date
        if (rest.loadingDate && rest.expectedDeliveryDate) {
            if (new Date(rest.expectedDeliveryDate) <= new Date(rest.loadingDate)) {
                return res.status(400).json({
                    message: 'Delivery date must be after loading date',
                    fieldErrors: { expectedDeliveryDate: 'Must be after loading date' }
                });
            }
        }

        // Validate advance doesn't exceed total charges
        const totalCharges = freight + fuelCharges + tollCharges + otherCharges;
        if (advancePaid > totalCharges) {
            return res.status(400).json({
                message: 'Advance payment cannot exceed total charges',
                fieldErrors: { advancePaid: 'Cannot exceed total charges' }
            });
        }

        // If transporterId is provided, fetch transporter details
        let transporterDetails = {};
        if (transporterId) {
            const transporter = await Transporter.findById(transporterId);
            if (transporter) {
                transporterDetails = {
                    transporterPhone: transporter.phone,
                    transporterAddress: transporter.address,
                    transporterGstin: transporter.gstin,
                    transporterPan: transporter.pan,
                };
            }
        }

        const updatedData = {
            ...rest,
            ...transporterDetails,
            freight,
            advancePaid,
            fuelCharges,
            tollCharges,
            otherCharges,
            totalCharges,
            balancePayable: totalCharges - advancePaid,
        };

        const updatedNote = await TruckHiringNote.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (updatedNote == null) {
            return res.status(404).json({ message: 'Cannot find Truck Hiring Note' });
        }
        res.json(updatedNote);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getLastTHNForTransporter = async (req: Request, res: Response) => {
    try {
        const { transporterId } = req.params;
        const lastTHN = await TruckHiringNote.findOne({ transporterId })
            .sort({ createdAt: -1 })
            .select('truckOwnerName transporterPhone transporterAddress transporterGstin transporterPan');
        
        res.json(lastTHN);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const sendReminder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const note = await TruckHiringNote.findByIdAndUpdate(
            id, 
            { lastReminderDate: new Date().toISOString() }, 
            { new: true }
        );
        
        if (!note) {
            return res.status(404).json({ message: 'THN not found' });
        }
        
        // Here you would integrate with WhatsApp/SMS service
        // For now, just update the reminder date
        res.json({ message: 'Reminder sent successfully', lastReminderDate: note.lastReminderDate });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
