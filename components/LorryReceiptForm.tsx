import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GstPayableBy } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { getCurrentDate } from '../services/utils';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { NewCustomerModal } from './NewCustomerModal';

import type { LorryReceipt, Customer, Vehicle } from '../types';

interface LorryReceiptFormProps {
  onSave: (lr: Partial<LorryReceipt>) => Promise<void>;
  onCancel: () => void;
  customers: Customer[];
  vehicles: Vehicle[];
  existingLr?: LorryReceipt;
  onSaveCustomer: (customer: Omit<Customer, 'id' | '_id'> & { _id?: string }) => Promise<Customer>;
  lorryReceipts: LorryReceipt[];
  onSaveVehicle: (vehicle: Omit<Vehicle, 'id' | '_id'>) => Promise<Vehicle>;
}

const TabButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
    >
        {children}
    </button>
);


export const LorryReceiptForm: React.FC<LorryReceiptFormProps> = ({ onSave, onCancel, customers, vehicles, existingLr, onSaveCustomer, lorryReceipts, onSaveVehicle }) => {
  
  const getInitialState = () => ({
    date: getCurrentDate(),
    consignorId: '',
    consigneeId: '',
    vehicleId: '',
    from: '',
    to: '',
    packages: [{ count: 1, packingMethod: '', description: '', actualWeight: 0, chargedWeight: 0 }],
    charges: { freight: 0, aoc: 0, hamali: 0, bCh: 0, trCh: 0, detentionCh: 0 },
    totalAmount: 0,
    eWayBillNo: '',
    valueGoods: 0,
    gstPayableBy: GstPayableBy.CONSIGNOR,
    insurance: { hasInsured: false },
    invoiceNo: '',
    sealNo: '',
    reportingDate: '',
    deliveryDate: '',
  });
    
  const [lr, setLr] = useState<Partial<LorryReceipt>>(existingLr ? { ...existingLr } : getInitialState());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  const [customNumber, setCustomNumber] = useState<string>('');
  const [activeTab, setActiveTab] = useState('shipment');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomerTarget, setNewCustomerTarget] = useState<'consignor' | 'consignee' | null>(null);
  
  const [vehicleNumber, setVehicleNumber] = useState(() => {
    if (existingLr && existingLr.vehicle) {
        return existingLr.vehicle.number;
    }
    return '';
  });

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    lorryReceipts.forEach(lr => {
      if (lr.from) locations.add(lr.from.trim());
      if (lr.to) locations.add(lr.to.trim());
    });
    return Array.from(locations).sort();
  }, [lorryReceipts]);

  const calculateTotal = useCallback(() => {
    if (!lr.charges) return 0;
    const { freight = 0, aoc = 0, hamali = 0, bCh = 0, trCh = 0, detentionCh = 0 } = lr.charges;
    return freight + aoc + hamali + bCh + trCh + detentionCh;
  }, [lr.charges]);

  useEffect(() => {
    setLr(prev => ({...prev, totalAmount: calculateTotal() }));
  }, [lr.charges, calculateTotal]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('charges.')) {
        const field = name.split('.')[1];
        setLr(prev => ({ ...prev, charges: { ...prev.charges, [field]: parseFloat(value) || 0 }}));
    } else if (name.startsWith('insurance.')) {
        const field = name.split('.')[1];
        if (field === 'hasInsured') {
             setLr(prev => ({ ...prev, insurance: { ...prev.insurance, hasInsured: (e.target as HTMLInputElement).checked }}));
        } else {
             setLr(prev => ({ ...prev, insurance: { ...prev.insurance, [field]: type === 'number' ? (parseFloat(value) || 0) : value }}));
        }
    }
    else {
        const isNumeric = type === 'number'; 
        setLr(prev => ({ ...prev, [name]: isNumeric ? (parseFloat(value) || 0) : value }));
    }
  };
  
  const handlePackageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newPackages = [...(lr.packages || [])];
    (newPackages[index] as any)[name] = type === 'number' ? parseFloat(value) || 0 : value;
    setLr(prev => ({...prev, packages: newPackages}));
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!lr.date) newErrors.date = 'Date is required.';
    if (!vehicleNumber.trim()) newErrors.vehicleId = 'Vehicle is required.';
    if (!lr.from) newErrors.from = 'Origin is required.';
    if (!lr.to) newErrors.to = 'Destination is required.';
    if (!lr.consignorId) newErrors.consignorId = 'Consignor is required.';
    if (!lr.consigneeId) newErrors.consigneeId = 'Consignee is required.';
    if (!lr.packages || lr.packages.some(p => !p.count || !p.description || !p.packingMethod)) {
        newErrors.packages = 'Package count, description, and packing method are required for all package lines.';
    }
    if (useCustomNumber) {
        const n = parseInt(customNumber, 10);
        if (!Number.isInteger(n) || n <= 0) newErrors.lrNumber = 'Enter a valid positive LR number.';
        else if (lorryReceipts.some(x => x.lrNumber === n && x._id !== (existingLr?._id))) newErrors.lrNumber = 'LR number already exists.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const trimmedVehicleNumber = vehicleNumber.trim();
      let vehicle = vehicles.find(v => v.number.toLowerCase() === trimmedVehicleNumber.toLowerCase());
      let finalVehicleId: string;

      if (vehicle) {
        finalVehicleId = vehicle._id;
      } else {
        const newVehicle = await onSaveVehicle({ number: trimmedVehicleNumber });
        finalVehicleId = newVehicle._id;
      }
      
      const lrDataToSave = {
        ...lr,
        vehicleId: finalVehicleId,
        ...(useCustomNumber ? { lrNumber: parseInt(customNumber, 10) } : {}),
      };

      try {
        await onSave(lrDataToSave);
      } catch (err: any) {
        const fe = err?.fieldErrors as Record<string, string[]> | undefined;
        if (fe) {
          const newErrors: { [key: string]: string } = {};
          Object.entries(fe).forEach(([key, messages]) => {
            if (key.startsWith('packages')) newErrors.packages = messages.join(', ');
            else newErrors[key] = messages.join(', ');
          });
          setErrors(newErrors);
        }
      }
    }
  };

  const handleOpenCustomerModal = (target: 'consignor' | 'consignee') => {
      setNewCustomerTarget(target);
      setIsCustomerModalOpen(true);
  }

  const handleCustomerAdded = (customer: Customer) => {
      if(newCustomerTarget === 'consignor') {
          setLr(prev => ({...prev, consignorId: customer._id}));
      } else if (newCustomerTarget === 'consignee') {
          setLr(prev => ({...prev, consigneeId: customer._id}));
      }
  }

  return (
    <>
    <NewCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSaveCustomer={onSaveCustomer}
        onCustomerAdded={handleCustomerAdded}
    />
    <form onSubmit={handleSubmit} className="space-y-6">
        <datalist id="locations-list">
            {uniqueLocations.map(location => ( <option key={location} value={location} /> ))}
        </datalist>
        <datalist id="vehicles-list">
            {vehicles.map(v => <option key={v._id} value={v.number} />)}
        </datalist>
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">{existingLr ? `Edit Lorry Receipt #${existingLr.lrNumber}` : 'Create Lorry Receipt'}</h2>
            <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">Total: ₹{(lr.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
        </div>

        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <TabButton active={activeTab === 'shipment'} onClick={() => setActiveTab('shipment')}>Shipment</TabButton>
                <TabButton active={activeTab === 'parties'} onClick={() => setActiveTab('parties')}>Parties</TabButton>
                <TabButton active={activeTab === 'packages'} onClick={() => setActiveTab('packages')}>Packages</TabButton>
                <TabButton active={activeTab === 'charges'} onClick={() => setActiveTab('charges')}>Charges</TabButton>
                <TabButton active={activeTab === 'other'} onClick={() => setActiveTab('other')}>Other</TabButton>
            </nav>
        </div>

        <div className="mt-6">
            {activeTab === 'shipment' && (
                <Card title="Shipment Details">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">LR Number</label>
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" id="lr-custom-num" checked={useCustomNumber} onChange={e => setUseCustomNumber(e.target.checked)} />
                                <label htmlFor="lr-custom-num" className="text-sm text-gray-700">Enter custom LR number</label>
                                {useCustomNumber && (
                                    <input type="number" className="border rounded px-2 py-1 w-40" value={customNumber} onChange={e => setCustomNumber(e.target.value)} placeholder="e.g. 1001" />
                                )}
                            </div>
                            {errors.lrNumber && <p className="text-xs text-red-600 mt-1">{errors.lrNumber}</p>}
                        </div>
                        <Input label="Date" type="date" name="date" value={lr.date || ''} onChange={handleChange} required error={errors.date} />
                        <Input label="Vehicle No." name="vehicleNumber" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} required error={errors.vehicleId} list="vehicles-list" wrapperClassName="md:col-span-1" />
                        <Input label="From" name="from" value={lr.from || ''} onChange={handleChange} required error={errors.from} list="locations-list" />
                        <Input label="To" name="to" value={lr.to || ''} onChange={handleChange} required error={errors.to} list="locations-list" />
                    </div>
                </Card>
            )}

            {activeTab === 'parties' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Consignor">
                        <Select name="consignorId" label="Select Consignor" value={lr.consignorId || ''} onChange={handleChange} required error={errors.consignorId}>
                            <option value="" disabled>Select Consignor</option>
                            {customers.map(c => <option key={c._id} value={c._id}>{c.tradeName || c.name}</option>)}
                        </Select>
                        <Button type="button" variant="link" onClick={() => handleOpenCustomerModal('consignor')}>Add New Consignor</Button>
                    </Card>
                    <Card title="Consignee">
                        <Select name="consigneeId" label="Select Consignee" value={lr.consigneeId || ''} onChange={handleChange} required error={errors.consigneeId}>
                            <option value="" disabled>Select Consignee</option>
                            {customers.map(c => <option key={c._id} value={c._id}>{c.tradeName || c.name}</option>)}
                        </Select>
                        <Button type="button" variant="link" onClick={() => handleOpenCustomerModal('consignee')}>Add New Consignee</Button>
                    </Card>
                </div>
            )}

            {activeTab === 'packages' && (
                <Card title="Packages">
                    {(lr.packages || []).map((pkg, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                        <Input label="No. of Pkgs" type="number" name="count" value={pkg.count} onChange={e => handlePackageChange(index, e)} onFocus={e => e.target.select()} />
                        <Input label="Method of Packing" name="packingMethod" value={pkg.packingMethod} onChange={e => handlePackageChange(index, e)} />
                        <Input label="Description" name="description" value={pkg.description} onChange={e => handlePackageChange(index, e)} wrapperClassName="md:col-span-3" />
                        <Input label="Actual Weight" type="number" name="actualWeight" value={pkg.actualWeight} onChange={e => handlePackageChange(index, e)} onFocus={e => e.target.select()} />
                        <Input label="Charged Weight" type="number" name="chargedWeight" value={pkg.chargedWeight} onChange={e => handlePackageChange(index, e)} onFocus={e => e.target.select()} />
                    </div>
                    ))}
                    {errors.packages && <p className="mt-1 text-xs text-red-600">{errors.packages}</p>}
                </Card>
            )}

            {activeTab === 'charges' && (
                <Card title="Charges">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Input label="Freight" type="number" name="charges.freight" value={lr.charges?.freight || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                        <Input label="AOC" type="number" name="charges.aoc" value={lr.charges?.aoc || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                        <Input label="Hamali" type="number" name="charges.hamali" value={lr.charges?.hamali || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                        <Input label="B. Ch." type="number" name="charges.bCh" value={lr.charges?.bCh || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                        <Input label="Tr. Ch." type="number" name="charges.trCh" value={lr.charges?.trCh || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                        <Input label="Detention Ch." type="number" name="charges.detentionCh" value={lr.charges?.detentionCh || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                    </div>
                </Card>
            )}

            {activeTab === 'other' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Insurance">
                        <div className="flex items-center mb-2">
                            <input type="checkbox" id="hasInsured" name="insurance.hasInsured" checked={lr.insurance?.hasInsured || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <label htmlFor="hasInsured" className="ml-3 block text-sm text-gray-900">Client has insured the consignment.</label>
                        </div>
                        {lr.insurance?.hasInsured && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                <Input label="Company" name="insurance.company" value={lr.insurance.company || ''} onChange={handleChange} />
                                <Input label="Policy No." name="insurance.policyNo" value={lr.insurance.policyNo || ''} onChange={handleChange} />
                                <Input label="Date" type="date" name="insurance.date" value={lr.insurance.date || ''} onChange={handleChange} />
                            </div>
                        )}
                    </Card>
                     <Card title="Other Details">
                        <div className="space-y-4">
                             <Input label="E-Way Bill No." name="eWayBillNo" value={lr.eWayBillNo || ''} onChange={handleChange} />
                             <Input label="Value of Goods" type="number" name="valueGoods" value={lr.valueGoods || 0} onChange={handleChange} onFocus={e => e.target.select()} />
                             <Select label="GST Payable By" name="gstPayableBy" value={lr.gstPayableBy || GstPayableBy.CONSIGNOR} onChange={handleChange}>
                                {Object.values(GstPayableBy).map(val => <option key={val} value={val}>{val}</option>)}
                             </Select>
                        </div>
                    </Card>
                </div>
            )}
        </div>

        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t -mx-6 px-6 py-3 flex justify-end space-x-3 shadow-sm">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Lorry Receipt</Button>
        </div>
    </form>
    </>
  );
};
