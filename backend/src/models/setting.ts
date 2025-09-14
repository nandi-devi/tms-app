import { Schema, model, Document } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
}

const SettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
});

export default model<ISetting>('Setting', SettingSchema);
