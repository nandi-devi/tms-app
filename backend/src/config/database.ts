import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/all-india-logistics');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('✅ Data will be persisted to MongoDB database.');
    
    // Clean database connection established

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if MongoDB connection fails
  }
};

export default connectDB;
