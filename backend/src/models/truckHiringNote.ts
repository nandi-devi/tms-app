import { Schema, model, Document } from 'mongoose';
import { THNStatus } from '../types';

export interface ITransporter extends Document {
  name: string;
  phone?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  isActive: boolean;
}

export interface ITruckHiringNote extends Document {
  thnNumber: number;
  date: string;
  transporterId?: Schema.Types.ObjectId;
  truckOwnerName: string; // transporter name (for backward compatibility)
  transporterPhone?: string;
  transporterAddress?: string;
  transporterGstin?: string;
  transporterPan?: string;
  truckNumber: string;
  origin: string;
  destination: string;
  goodsType: string;
  weight: number;
  loadingDate?: string;
  loadingTime?: string;
  unloadingDate?: string;
  unloadingTime?: string;
  podImages?: string[];
  freight: number;
  fuelCharges?: number;
  tollCharges?: number;
  otherCharges?: number;
  totalCharges: number;
  advancePaid: number;
  balancePayable: number;
  expectedDeliveryDate: string;
  paymentTerms?: 'Cash' | 'Cheque' | 'NEFT' | 'UPI';
  paymentReference?: string;
  specialInstructions?: string;
  status: THNStatus;
  paidAmount: number;
  payments: Schema.Types.ObjectId[];
  isDraft: boolean;
  lastReminderDate?: string;
}

const TransporterSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  gstin: { type: String },
  pan: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const TruckHiringNoteSchema = new Schema({
  thnNumber: { type: Number, unique: true },
  date: { type: String, required: true },
  transporterId: { type: Schema.Types.ObjectId, ref: 'Transporter' },
  truckOwnerName: { type: String, required: true }, // for backward compatibility
  transporterPhone: { type: String },
  transporterAddress: { type: String },
  transporterGstin: { type: String },
  transporterPan: { type: String },
  truckNumber: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  goodsType: { type: String, required: true },
  weight: { type: Number, required: true },
  loadingDate: { type: String },
  loadingTime: { type: String },
  unloadingDate: { type: String },
  unloadingTime: { type: String },
  podImages: [{ type: String }],
  freight: { type: Number, required: true },
  fuelCharges: { type: Number, default: 0 },
  tollCharges: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },
  totalCharges: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  balancePayable: { type: Number, required: true },
  expectedDeliveryDate: { type: String, required: true },
  paymentTerms: { type: String, enum: ['Cash', 'Cheque', 'NEFT', 'UPI'] },
  paymentReference: { type: String },
  specialInstructions: { type: String },
  status: { type: String, enum: Object.values(THNStatus), default: THNStatus.UNPAID },
  paidAmount: { type: Number, default: 0 },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  isDraft: { type: Boolean, default: false },
  lastReminderDate: { type: String },
}, {
  timestamps: true,
});

// Pre-save middleware to calculate totalCharges and balancePayable
TruckHiringNoteSchema.pre('save', function(next) {
  this.totalCharges = this.freight + (this.fuelCharges || 0) + (this.tollCharges || 0) + (this.otherCharges || 0);
  this.balancePayable = this.totalCharges - this.advancePaid;
  next();
});

export const Transporter = model<ITransporter>('Transporter', TransporterSchema);
export default model<ITruckHiringNote>('TruckHiringNote', TruckHiringNoteSchema);
