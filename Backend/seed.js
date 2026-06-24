import mongoose from "mongoose";

import dotenv from 'dotenv';

dotenv.config();

// 1. MongoDB Setup & Connection

const MONGO_URI = `mongodb+srv://${process.env.USER}:${process.env.PASS}@clusterproduct.vvfbzyh.mongodb.net/`;

mongoose.connect(MONGO_URI)

  .then(() => console.log('MongoDB connected successfully.'))

  .catch(err => console.error('Database connection error:', err));



// 2. Product Schema Setup

const productSchema = new mongoose.Schema({

  name: { type: String, required: true },

  category: { type: String, required: true },

  price: { type: Number, required: true },

  unique_id: { type: String, required: true, unique: true },

  created_at: { type: Date, default: Date.now },

  updated_at: { type: Date, default: Date.now }

});



// 3. Performance ke liye Compound Index lagana (Covered Query ke liye)

productSchema.index({ category: 1, updated_at: -1, name: 1, price: 1 });



const Product = mongoose.model('Product', productSchema);



// Dummy categories array data variations ke liye

const categories = ['Shirt', 'Shoe', 'Polo', 'Top', 'Knitwear', 'Bag', 'Waistcoat', 'Co-Ord Set', 'Electronics', 'Appliances'];

const adjectives = ['Cotton', 'Retoro Multi', 'Open Back', 'Tailored blend', 'Linen Blend', 'Classic', 'Premium', 'Urban', 'Sports'];

const items = ['Shirt', 'Sneakers', 'Top', 'Sweat Shirt', 'Knitwear', 'Bag', 'Waistcoat', 'Blazer', 'Jacket', 'Watch'];



// 4. Fast Data Generation Logic

async function seedDatabase() {

  try {

    const existingCount = await Product.countDocuments();
    if (existingCount >= 200000) {
      console.log(`📊 Database mein pehle se ${existingCount} products hain. Seeding ki zaroorat nahi hai!`);
      process.exit(0);
    }
    console.log('Clearing existing products...');

    await Product.deleteMany({}); // Purana data clear karne ke liye



    const totalRecords = 200000; // 2 Lakh products

    const batchSize = 10000;     // 10k ka ek batch (RAM crash hone se bachane ke liye)

    let currentTimestamp = Date.now();



    console.log(`Starting generation of ${totalRecords} records...`);



    for (let i = 0; i < totalRecords; i += batchSize) {

      const productsBatch = [];



      for (let j = 0; j < batchSize; j++) {

        const globalIndex = i + j;

       

        // Random par structured names banana

        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];

        const randomItem = items[Math.floor(Math.random() * items.length)];

        const productName = `${randomAdj} ${randomItem} v${globalIndex}`;

        const categoryName = categories[Math.floor(Math.random() * categories.length)];

        const productPrice = Math.floor(Math.random() * 900) + 100; // $100 to $1000



        // Timestamps ko thoda-thoda subtract kar rahe hain taaki 'Newest First' simulate ho sake

        // Har product 1 second purana banta jayega

        const simulatedTime = new Date(currentTimestamp - globalIndex * 1000);



        productsBatch.push({

          name: productName,

          category: categoryName,

          price: productPrice,

          unique_id: `PROD-${globalIndex}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,

          created_at: simulatedTime,

          updated_at: simulatedTime

        });

      }



      // Bulk Insert - Yeh step 10,000 records ek saath daalega

      await Product.insertMany(productsBatch, { ordered: false });

      console.log(`Inserted ${i + batchSize} / ${totalRecords} products...`);

    }



    console.log('🎉 Database Seeding Completed Successfully!');

    process.exit();

  } catch (error) {

    console.error('Error seeding database:', error);

    process.exit(1);

  }

}



seedDatabase(); 