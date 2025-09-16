import React, { useState, useEffect } from 'react';
import type { TruckHiringNote, Transporter } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { getCurrentDate } from '../services/utils';
import { getLastTHNForTransporter } from '../services/truckHiringNoteService';
import { getAllTransporters } from '../services/transporterService';

interface TruckHiringNoteFormProps {
    existingNote?: TruckHiringNote;
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable' | 'totalCharges'>>) => Promise<any>;
    onCancel: () => void;
}

export const TruckHiringNoteForm: React.FC<TruckHiringNoteFormProps> = ({ existingNote, onSave, onCancel }) => {
    const getInitialState = (): Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'totalCharges'>> => ({
        date: getCurrentDate(),
        truckOwnerName: '',
        transporterPhone: '',
        transporterAddress: '',
        transporterGstin: '',
        transporterPan: '',
        truckNumber: '',
        origin: '',
        destination: '',
        goodsType: '',
        weight: 0,
        loadingDate: '',
        loadingTime: '',
        unloadingDate: '',
        unloadingTime: '',
        freight: 0,
        fuelCharges: 0,
        tollCharges: 0,
        otherCharges: 0,
        advancePaid: 0,
        expectedDeliveryDate: '',
        paymentTerms: 'Cash',
        paymentReference: '',
        specialInstructions: '',
        isDraft: false,
    });

    const [note, setNote] = useState(existingNote || getInitialState());
    const [isSaving, setIsSaving] = useState(false);
    const [transporters, setTransporters] = useState<Transporter[]>([]);
    const [selectedTransporterId, setSelectedTransporterId] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isDraft, setIsDraft] = useState(false);

    useEffect(() => {
        if (existingNote) {
            setNote(existingNote);
            setSelectedTransporterId(existingNote.transporterId || '');
        }
    }, [existingNote]);

    useEffect(() => {
        const fetchTransporters = async () => {
            try {
                const data = await getAllTransporters();
                setTransporters(data);
            } catch (error) {
                console.error('Failed to fetch transporters:', error);
            }
        };
        fetchTransporters();
    }, []);

    useEffect(() => {
        const loadLastTHN = async () => {
            if (selectedTransporterId && !existingNote) {
                try {
                    const lastTHN = await getLastTHNForTransporter(selectedTransporterId);
                    if (lastTHN) {
                        setNote(prev => ({
                            ...prev,
                            truckOwnerName: lastTHN.truckOwnerName,
                            transporterPhone: lastTHN.transporterPhone || '',
                            transporterAddress: lastTHN.transporterAddress || '',
                            transporterGstin: lastTHN.transporterGstin || '',
                            transporterPan: lastTHN.transporterPan || '',
                        }));
                    }
                } catch (error) {
                    console.error('Failed to fetch last THN:', error);
                }
            }
        };
        loadLastTHN();
    }, [selectedTransporterId, existingNote]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setNote(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
        
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleTransporterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const transporterId = e.target.value;
        setSelectedTransporterId(transporterId);
        
        if (transporterId) {
            const transporter = transporters.find(t => t._id === transporterId);
            if (transporter) {
                setNote(prev => ({
                    ...prev,
                    truckOwnerName: transporter.name,
                    transporterPhone: transporter.phone || '',
                    transporterAddress: transporter.address || '',
                    transporterGstin: transporter.gstin || '',
                    transporterPan: transporter.pan || '',
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFieldErrors({});
        
        try {
            const noteToSave = {
                ...note,
                transporterId: selectedTransporterId || undefined,
                isDraft,
            };
            await onSave(noteToSave);
        } catch (error: any) {
            console.error("Failed to save Truck Hiring Note", error);
            
            // Parse field errors from backend response
            if (error.message && error.message.includes('fieldErrors')) {
                try {
                    const errorData = JSON.parse(error.message);
                    if (errorData.fieldErrors) {
                        setFieldErrors(errorData.fieldErrors);
                    }
                } catch (parseError) {
                    // If parsing fails, just show the general error
                }
            }
        } finally {
            setIsSaving(false);
        }
    };

    const totalCharges = (note.freight || 0) + (note.fuelCharges || 0) + (note.tollCharges || 0) + (note.otherCharges || 0);
    const balancePayable = totalCharges - (note.advancePaid || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card title={existingNote ? `Edit Truck Hiring Note #${existingNote.thnNumber}` : 'Create New Truck Hiring Note'}>
                        {/* Basic Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input 
                                    label="Date" 
                                    name="date" 
                                    type="date" 
                                    value={note.date || ''} 
                                    onChange={handleChange} 
                                    required 
                                    error={fieldErrors.date}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
                                    <Select
                                        value={selectedTransporterId}
                                        onChange={handleTransporterChange}
                                        options={[
                                            { value: '', label: 'Select Transporter' },
                                            ...transporters.map(t => ({ value: t._id, label: t.name }))
                                        ]}
                                    />
                                </div>
                                <Input 
                                    label="Truck Number" 
                                    name="truckNumber" 
                                    value={note.truckNumber || ''} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="TN 20 AB 1234"
                                    error={fieldErrors.truckNumber}
                                />
                            </div>
                        </div>

                        {/* Transporter Details */}
                        <div className="mb-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transporter Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label="Transporter Name" 
                                    name="truckOwnerName" 
                                    value={note.truckOwnerName || ''} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <Input 
                                    label="Phone" 
                                    name="transporterPhone" 
                                    value={note.transporterPhone || ''} 
                                    onChange={handleChange} 
                                />
                                <Input 
                                    label="Address" 
                                    name="transporterAddress" 
                                    value={note.transporterAddress || ''} 
                                    onChange={handleChange} 
                                />
                                <Input 
                                    label="GSTIN" 
                                    name="transporterGstin" 
                                    value={note.transporterGstin || ''} 
                                    onChange={handleChange} 
                                />
                                <Input 
                                    label="PAN" 
                                    name="transporterPan" 
                                    value={note.transporterPan || ''} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>

                        {/* Route & Goods */}
                        <div className="mb-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Route & Goods</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label="Origin" 
                                    name="origin" 
                                    value={note.origin || ''} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <Input 
                                    label="Destination" 
                                    name="destination" 
                                    value={note.destination || ''} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <Input 
                                    label="Type of Goods" 
                                    name="goodsType" 
                                    value={note.goodsType || ''} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <Input 
                                    label="Weight (kg)" 
                                    name="weight" 
                                    type="number" 
                                    value={note.weight || 0} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Loading/Unloading Details */}
                        <div className="mb-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading/Unloading Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Loading Date" 
                                        name="loadingDate" 
                                        type="date" 
                                        value={note.loadingDate || ''} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label="Loading Time" 
                                        name="loadingTime" 
                                        type="time" 
                                        value={note.loadingTime || ''} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Unloading Date" 
                                        name="unloadingDate" 
                                        type="date" 
                                        value={note.unloadingDate || ''} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label="Unloading Time" 
                                        name="unloadingTime" 
                                        type="time" 
                                        value={note.unloadingTime || ''} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <Input 
                                    label="Expected Delivery Date" 
                                    name="expectedDeliveryDate" 
                                    type="date" 
                                    value={note.expectedDeliveryDate || ''} 
                                    onChange={handleChange} 
                                    required 
                                    error={fieldErrors.expectedDeliveryDate}
                                />
                            </div>
                        </div>

                        {/* Financial Details */}
                        <div className="mb-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Input 
                                        label="Freight (₹)" 
                                        name="freight" 
                                        type="number" 
                                        value={note.freight || 0} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                    <Input 
                                        label="Fuel Charges (₹)" 
                                        name="fuelCharges" 
                                        type="number" 
                                        value={note.fuelCharges || 0} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label="Toll Charges (₹)" 
                                        name="tollCharges" 
                                        type="number" 
                                        value={note.tollCharges || 0} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        label="Other Charges (₹)" 
                                        name="otherCharges" 
                                        type="number" 
                                        value={note.otherCharges || 0} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Charges (₹)</label>
                                        <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 font-semibold">
                                            {totalCharges.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <Input 
                                        label="Advance Paid (₹)" 
                                        name="advancePaid" 
                                        type="number" 
                                        value={note.advancePaid || 0} 
                                        onChange={handleChange} 
                                        error={fieldErrors.advancePaid}
                                    />
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Balance Payable (₹)</label>
                                        <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 font-semibold text-red-600">
                                    {balancePayable.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="mb-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Payment Terms"
                                    name="paymentTerms"
                                    value={note.paymentTerms || 'Cash'}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'Cash', label: 'Cash' },
                                        { value: 'Cheque', label: 'Cheque' },
                                        { value: 'NEFT', label: 'NEFT' },
                                        { value: 'UPI', label: 'UPI' }
                                    ]}
                                />
                                <Input 
                                    label="Payment Reference" 
                                    name="paymentReference" 
                                    value={note.paymentReference || ''} 
                                    onChange={handleChange} 
                                    placeholder="Reference number or UPI ID"
                                />
                            </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="mb-6 pt-6 border-t">
                            <Textarea 
                                label="Special Instructions" 
                                name="specialInstructions" 
                                value={note.specialInstructions || ''} 
                                onChange={handleChange} 
                                rows={4} 
                            />
                        </div>

                        {/* Draft Toggle */}
                        <div className="mb-6 pt-6 border-t">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isDraft"
                                    checked={isDraft}
                                    onChange={(e) => setIsDraft(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isDraft" className="ml-2 block text-sm text-gray-900">
                                    Save as Draft
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-6 mt-6 border-t">
                            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : isDraft ? 'Save as Draft' : 'Save Note'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};
