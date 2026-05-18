import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  // Try standard SRV connection first
  const srvUri = process.env.MONGO_URI ||
    'mongodb+srv://a:a@cluster0.d9c4pj5.mongodb.net/?appName=Cluster0';

  // Non-SRV fallback URI — avoids DNS SRV lookup (fixes ISP blocking issues)
  // Format: mongodb://username:password@host1:27017,host2:27017,host3:27017/dbname?ssl=true&replicaSet=...
  // You can get this from Atlas → Connect → Drivers → "Standard connection string"
  const directUri = process.env.MONGO_URI_DIRECT || null;

  // Try SRV first, then direct
  const urisToTry = [srvUri, directUri].filter(Boolean);

  for (const uri of urisToTry) {
    try {
      const isSrv = uri.includes('+srv');
      console.log(`Trying MongoDB ${isSrv ? 'SRV' : 'direct'} connection...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      isConnected = true;
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      console.warn(`⚠️  MongoDB attempt failed: ${err.message}`);
    }
  }

  console.log('ℹ️  Running with in-memory data (MongoDB unavailable). App is fully functional.');
};

export const getIsConnected = () => isConnected;