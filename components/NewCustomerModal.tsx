import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { indianStates } from '../constants';
import { fetchGstDetails } from '../services/utils';
import type { Customer } from '../types';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomer: (customer: Partial<Customer>) => Promise<Customer>;
  onCustomerAdded: (customer: Customer) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose, onSaveCustomer, onCustomerAdded }) => {
  const [mode, setMode] = useState<'gstin' | 'manual'>('gstin');
  const [gstin, setGstin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualTradeName, setManualTradeName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualGstin, setManualGstin] = useState('');
  const [manualContactPerson, setManualContactPerson] = useState('');
  const [manualContactPhone, setManualContactPhone] = useState('');
  const [manualContactEmail, setManualContactEmail] = useState('');
  const [manualError, setManualError] = useState('');

  const handleFetch = async () => {
    if (!gstin || gstin.length !== 15) {
      setFetchError('Please enter a valid 15-digit GSTIN.');
      return;
    }
    setIsLoading(true);
    setFetchError('');
    try {
      const customerData = await fetchGstDetails(gstin);
      const newCustomer = await onSaveCustomer(customerData);
      onCustomerAdded(newCustomer);
      resetAndClose();
    } catch (err: any) {
      setFetchError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = async () => {
    if (!manualName.trim() || !manualAddress.trim() || !manualState) {
      setManualError('Legal Name, Address, and State are required.');
      return;
    }
    setManualError('');
    const customerData: Partial<Customer> = {
      name: manualName.trim(),
      tradeName: manualTradeName.trim(),
      address: manualAddress.trim(),
      state: manualState,
      gstin: manualGstin.trim(),
      contactPerson: manualContactPerson.trim(),
      contactPhone: manualContactPhone.trim(),
      contactEmail: manualContactEmail.trim(),
    };
    const newCustomer = await onSaveCustomer(customerData);
    onCustomerAdded(newCustomer);
    resetAndClose();
  };

  const resetAndClose = () => {
    setGstin('');
    setFetchError('');
    setManualName('');
    setManualTradeName('');
    setManualAddress('');
    setManualState('');
    setManualGstin('');
    setManualContactPerson('');
    setManualContactPhone('');
    setManualContactEmail('');
    setManualError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Add New Customer</h2>
        <div className="mb-4 border-b">
            <button onClick={() => setMode('gstin')} className={`px-4 py-2 ${mode === 'gstin' ? 'border-b-2 border-indigo-500' : ''}`}>From GSTIN</button>
            <button onClick={() => setMode('manual')} className={`px-4 py-2 ${mode === 'manual' ? 'border-b-2 border-indigo-500' : ''}`}>Manual Entry</button>
        </div>

        {mode === 'gstin' ? (
          <div>
            <Input label="New Client GSTIN" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="Enter 15-digit GSTIN" error={fetchError} />
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
              <Button onClick={handleFetch} disabled={isLoading}>{isLoading ? 'Fetching...' : 'Fetch & Save'}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {manualError && <p className="text-xs text-red-600 -mt-2">{manualError}</p>}
            <Input label="Legal Name*" value={manualName} onChange={e => setManualName(e.target.value)} />
            <Input label="Trade Name (Optional)" value={manualTradeName} onChange={e => setManualTradeName(e.target.value)} />
            <Textarea label="Address*" value={manualAddress} onChange={e => setManualAddress(e.target.value)} rows={3} />
            <Select label="State*" value={manualState} onChange={e => setManualState(e.target.value)}>
              <option value="" disabled>Select State</option>
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input label="GSTIN (Optional)" value={manualGstin} onChange={e => setManualGstin(e.target.value)} />
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
              <Button onClick={handleManualSave}>Save Client</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
