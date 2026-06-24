import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  unique_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Yeh compound index humari Covered Queries ko super-fast chalayega
productSchema.index({ category: 1, updated_at: -1, name: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;