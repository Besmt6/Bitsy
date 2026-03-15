import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'bitsy_saas';

async function generateSlugs() {
  try {
    await mongoose.connect(`${MONGO_URL}/${DB_NAME}`);
    console.log('✅ Connected to MongoDB');

    const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));
    
    // Find all hotels without slugs
    const hotels = await Hotel.find({ 
      $or: [
        { publicSlug: { $exists: false } }, 
        { publicSlug: null }, 
        { publicSlug: '' }
      ] 
    });
    
    console.log(`📋 Found ${hotels.length} hotels without slugs`);
    
    for (const hotel of hotels) {
      // Generate slug
      let baseSlug = hotel.hotelName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check for collisions
      let slug = baseSlug;
      let counter = 1;
      while (await Hotel.findOne({ publicSlug: slug, _id: { $ne: hotel._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Update hotel
      await Hotel.updateOne({ _id: hotel._id }, { $set: { publicSlug: slug } });
      console.log(`✓ ${hotel.hotelName} -> ${slug}`);
    }
    
    console.log('\n🎉 All slugs generated successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateSlugs();
