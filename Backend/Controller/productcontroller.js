import Product from "../models/Product.js"; // Apne product model ka path check kar lein

export const getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { category, cursor } = req.query;

    // 1. DYNAMIC FILTER OBJECT
    let query = {};
    if (category) {
      query.category = category;
    }

    // 2. GET LIVE ACCURATE TOTAL COUNT FOR THIS SPECIFIC FILTER
    const totalMatchingRecords = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalMatchingRecords / limit);

    // 3. CURSOR LOGIC FOR PAGINATION
    if (cursor) {
      query.updated_at = { $lt: new Date(cursor) };
    }

    // Fetch data chunks
    const products = await Product.find(query)
      .sort({ updated_at: -1 })
      .limit(limit);

    const nextCursor = products.length === limit ? products[products.length - 1].updated_at : null;

    return res.status(200).json({
      success: true,
      totalCount: totalMatchingRecords, // Live count trigger
      totalPages,
      nextCursor,
      data: products
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
// Product Controller - Add New Product
export const addProduct = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Dynamic unique index simulation
    const randomHex = Math.random().toString(36).substr(2, 5).toUpperCase();
    const unique_id = `PROD-NEW-${randomHex}`;
    
    const now = new Date();

    const newProduct = new Product({
      name,
      category,
      price: Number(price),
      unique_id,
      created_at: now,
      updated_at: now // Current high timestamp taaki yeh Newest First query mein fit ho sake
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully!",
      data: newProduct
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;

    // Hum updated_at ko refresh kar rahe hain taaki cursor sorting smooth rahe
    const updatedData = {
      name,
      category,
      price: Number(price),
      updated_at: new Date() // Isse product top par bump ho jayega (Option B)
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};