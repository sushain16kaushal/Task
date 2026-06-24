import React, { useState, useEffect } from 'react';

import axios from 'axios';

import {

  LayoutDashboard, ShoppingBag, Users, FolderTree,

  ShoppingBasket, Ticket, MessageSquare, Settings,

  Search, ArrowUpDown, Download, Plus, Edit2, Trash2, MoreHorizontal, Bell, Loader2,X

} from 'lucide-react';



export default function ProductDashboard() {

  const [activeTab, setActiveTab] = useState('Products');

 

  // Data State Management

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(''); // Empty string means "All"
const [totalCount, setTotalCount] = useState(0); // LIVE TOTAL PRODUCTS STATE
 // Add Product Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Shirt', price: '' });

  // Cursor Pagination States

  const [totalPages, setTotalPages] = useState(0);

  const [currentCursor, setCurrentCursor] = useState(null);

  const [nextCursor, setNextCursor] = useState(null);

  const [cursorHistory, setCursorHistory] = useState([null]); // Tracking history for 'Prev' button

  const [currentPageIndex, setCurrentPageIndex] = useState(0);



  const categoriesList = ['Shirt', 'Shoe', 'Polo', 'Top', 'Knitwear', 'Bag', 'Waistcoat', 'Co-Ord Set', 'Electronics', 'Appliances'];



  const sidebarItems = [

    { name: 'Dashboard', icon: LayoutDashboard },

    { name: 'Products', icon: ShoppingBag },

    { name: 'Customers', icon: Users },

    { name: 'Category', icon: FolderTree },

    { name: 'Orders', icon: ShoppingBasket },

    { name: 'Coupons', icon: Ticket },

    { name: 'Message', icon: MessageSquare, badge: 3 },

    { name: 'Settings', icon: Settings },

  ];



  // 1. Fetch Data Function from Backend API

  const fetchProducts = async (cursorValue = null, categoryValue = '') => {

    setLoading(true);

    try {

      let url = `https://product-catalog-kfx3.onrender.com/api/products?limit=10`;

     

      if (categoryValue) {

        url += `&category=${categoryValue}`;

      }

      if (cursorValue) {

        url += `&cursor=${cursorValue}`;

      }



      const response = await axios.get(url);

      if (response.data.success) {

        setProducts(response.data.data);

        setNextCursor(response.data.nextCursor);

        setTotalPages(response.data.totalPages);

      }

    } catch (error) {

      console.error("Error fetching data from API:", error);

    } finally {

      setLoading(false);

    }

  };



  // 2. Trigger fetch on initial load or category change

  useEffect(() => {

    // Reset page states when category switches

    setCurrentCursor(null);

    setNextCursor(null);

    setCursorHistory([null]);

    setCurrentPageIndex(0);

   

    fetchProducts(null, selectedCategory);

  }, [selectedCategory]);



  // 3. Navigation Controls for Cursor Pagination

  const handleNextPage = () => {

    if (!nextCursor) return;

   

    // Add next cursor to history array so we can backtrack

    const updatedHistory = [...cursorHistory, nextCursor];

    setCursorHistory(updatedHistory);

   

    const nextIndex = currentPageIndex + 1;

    setCurrentPageIndex(nextIndex);

    setCurrentCursor(nextCursor);

   

    fetchProducts(nextCursor, selectedCategory);

  };



  const handlePrevPage = () => {

    if (currentPageIndex === 0) return;

   

    const prevIndex = currentPageIndex - 1;

    const prevCursorValue = cursorHistory[prevIndex]; // Fetching past cursor state

   

    // Remove the last cursor from history tracking

    const updatedHistory = cursorHistory.slice(0, prevIndex + 1);

    setCursorHistory(updatedHistory);

   

    setCurrentPageIndex(prevIndex);

    setCurrentCursor(prevCursorValue);

   

    fetchProducts(prevCursorValue, selectedCategory);

  };
  // Open Modal for Editing
  const openEditModal = (product) => {
    setIsEditMode(true);
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price
    });
    setIsModalOpen(true);
  };

  // Open Modal for Adding
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingProductId(null);
    setFormData({ name: '', category: 'Shirt', price: '' });
    setIsModalOpen(true);
  };
// 3. Form Submit Handler (POST API Integration)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitLoading(true);
    try {
      if (isEditMode) {
        // Option B Route: Product update call
        const response = await axios.put(`https://product-catalog-kfx3.onrender.com/api/products/${editingProductId}`, formData);
        if (response.data.success) {
          setIsModalOpen(false);
          setFormData({ name: '', category: 'Shirt', price: '' });

          // Option B Core Logic: State reset to Page 1 so newly bumped product shows on top
          setSelectedCategory('');
          setCurrentCursor(null);
          setNextCursor(null);
          setCursorHistory([null]);
          setCurrentPageIndex(0);

          fetchProducts(null, '');
        }
      } else {
      const response = await axios.post('https://product-catalog-kfx3.onrender.com/api/products', formData);
      if (response.data.success) {
        // Form close and reset
        setIsModalOpen(false);
        setFormData({ name: '', category: 'Shirt', price: '' });
        
        // Dynamic Reset: User ko page 1 par laao taaki naya inserted product live top par dikhe!
        setSelectedCategory(''); 
        setCurrentCursor(null);
        setNextCursor(null);
        setCursorHistory([null]);
        setCurrentPageIndex(0);
        
        fetchProducts(null, ''); // Reload Page 1 fresh data chunks
      }
    }
    } catch (error) {
      console.error("Error inserting product:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setFormSubmitLoading(false);
    }
  };


  return (

    <div className="flex h-screen bg-[#E2E6F2] font-sans antialiased p-6">

      {/* SIDEBAR */}

      <aside className="w-64 bg-[#0F111A] text-gray-400 rounded-3xl flex flex-col justify-between p-5 shadow-xl">

        <div>

          <div className="flex items-center gap-3 text-white px-3 py-4 mb-6">

            <div className="bg-blue-600 p-2 rounded-xl text-white">

              <ShoppingBag size={20} />

            </div>

            <span className="font-bold text-xl tracking-wide">Ecooma</span>

          </div>



          <nav className="space-y-1">

            {sidebarItems.map((item) => {

              const Icon = item.icon;

              const isActive = activeTab === item.name;

              return (

                <button

                  key={item.name}

                  onClick={() => setActiveTab(item.name)}

                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${

                    isActive

                      ? 'bg-[#3F61ED] text-white shadow-lg shadow-blue-600/30 font-semibold'

                      : 'hover:bg-gray-800/50 hover:text-gray-200'

                  }`}

                >

                  <div className="flex items-center gap-3">

                    <Icon size={18} />

                    <span>{item.name}</span>

                  </div>

                  {item.badge && (

                    <span className="bg-[#3F61ED] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">

                      {item.badge}

                    </span>

                  )}

                </button>

              );

            })}

          </nav>

        </div>



      

      </aside>



      {/* MAIN CONTENT AREA */}

      <main className="flex-1 flex flex-col px-8 py-2 overflow-y-auto">

        <header className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold text-gray-900">Products</h1>

          <div className="flex items-center gap-4">

            <button className="relative p-2 bg-white rounded-full text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm">

              <Bell size={20} />

              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>

            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 shadow-sm">

              <Download size={16} />

              <span>Import</span>

            </button>

            <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#3F61ED] text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20">

              <Plus size={16} />

              <span>Add Product</span>

            </button>

          </div>

        </header>



        {/* Filters & Action Bar */}

        <section className="flex justify-between items-center mb-5 gap-4">

          <div className="relative w-80">

            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">

              <Search size={18} />

            </span>

            <input

              type="text"

              placeholder="Search mock placeholder..."

              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"

            />

          </div>



          {/* Dynamic Category Selector Filter */}

          <div className="flex items-center gap-2">

            <select

              value={selectedCategory}

              onChange={(e) => setSelectedCategory(e.target.value)}

              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"

            >

              <option value="">All Categories</option>

              {categoriesList.map(cat => (

                <option key={cat} value={cat}>{cat}</option>

              ))}

            </select>

          </div>

        </section>



        {/* DATA TABLE CONTAINER */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-between overflow-hidden relative min-h-112.5">

         

          {loading ? (

            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-sm">

              <div className="flex flex-col items-center gap-2 text-[#3F61ED]">

                <Loader2 size={40} className="animate-spin" />

                <span className="text-sm font-semibold text-gray-600">Loading fast data chunks...</span>

              </div>

            </div>

          ) : null}



          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>

                <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-50/50">

                  <th className="py-4 px-6 w-12">

                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 h-4 w-4" />

                  </th>

                  <th className="py-4 px-4 font-medium text-gray-500">Product</th>

                  <th className="py-4 px-4 font-medium text-gray-500">Category</th>

                  <th className="py-4 px-4 font-medium text-gray-500">Price</th>

                  <th className="py-4 px-4 font-medium text-gray-500">Unique ID</th>

                  <th className="py-4 px-6 text-right font-medium text-gray-500">Action</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">

                {products.length === 0 && !loading ? (

                  <tr>

                    <td colSpan="6" className="text-center py-10 font-medium text-gray-400">No products found.</td>

                  </tr>

                ) : (

                  products.map((product) => (

                    <tr key={product._id} className="hover:bg-gray-50/70 transition-colors group">

                      <td className="py-3.5 px-6">

                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 h-4 w-4" />

                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-900">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-semibold flex items-center justify-center text-xs border border-blue-100 shrink-0">

                            {product.name.charAt(0)}

                          </div>

                          <span className="truncate max-w-50" title={product.name}>{product.name}</span>

                        </div>

                      </td>

                      <td className="py-3.5 px-4 text-gray-500">{product.category}</td>

                      <td className="py-3.5 px-4 font-semibold text-gray-900">${product.price}</td>

                      <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{product.unique_id}</td>

                      <td className="py-3.5 px-6 text-right">

                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">

                          <button onClick={() => openEditModal(product)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15} /></button>

                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>

                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><MoreHorizontal size={15} /></button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>



          {/* STABLE CURSOR PAGINATION FOOTER */}

         {/* TOTAL PAGES WALA LOOK (STILL USING CURSOR BACKGROUND) */}

<footer className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white text-xs text-gray-500 rounded-b-3xl">

 {/* FOOTER TEXT */}

<div>

  Page <span className="font-bold text-gray-800">{currentPageIndex + 1}</span> of <span className="font-bold text-gray-800">{totalPages || 1}</span>

</div>

 

  <div className="flex items-center gap-1.5">

    {/* PREV BUTTON */}

    <button

      onClick={handlePrevPage}

      disabled={currentPageIndex === 0 || loading}

      className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"

    >

      Prev

    </button>



    {/* FIRST PAGE */}

    {currentPageIndex > 1 && (

      <button

        onClick={() => {

          setCurrentPageIndex(0);

          fetchProducts(null, selectedCategory);

        }}

        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500"

      >

        1

      </button>

    )}

    {currentPageIndex > 2 && <span className="text-gray-400">...</span>}



    {/* PREVIOUS PAGE NUMBER */}

    {currentPageIndex > 0 && (

      <button

        onClick={handlePrevPage}

        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500"

      >

        {currentPageIndex}

      </button>

    )}



    {/* CURRENT ACTIVE PAGE */}

    <button className="w-8 h-8 flex items-center justify-center bg-[#3F61ED] text-white rounded-lg font-bold shadow-md">

      {currentPageIndex + 1}

    </button>



    {/* NEXT PAGE NUMBER */}

    {nextCursor && (

      <button

        onClick={handleNextPage}

        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500"

      >

        {currentPageIndex + 2}

      </button>

    )}



    {nextCursor && <span className="text-gray-400">...</span>}



   

 {/* LAST VIRTUAL PAGE PLUG */}

{nextCursor && (

  <button className="px-2 h-8 flex items-center justify-center border border-gray-200 text-gray-400 rounded-lg disabled:cursor-not-allowed" disabled>

    {totalPages}

  </button>

)}



    {/* NEXT BUTTON */}

    <button

      onClick={handleNextPage}

      disabled={!nextCursor || loading}

      className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-600 disabled:opacity-40"

    >

      Next

    </button>

  </div>

</footer>

        </section>

      </main>
    {/* FORM MODAL (HANDLES BOTH ADD & EDIT DYNAMICALLY) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F111A]/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Modify Product Details' : 'Create New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Premium Cotton Polo Shirt"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none text-gray-700 font-medium"
                  >
                    {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price ($)</label>
                  <input 
                    type="number" required min="1"
                    placeholder="250"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button 
                  type="submit"
                  disabled={formSubmitLoading}
                  className="px-5 py-2 bg-[#3F61ED] text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {formSubmitLoading ? <Loader2 size={16} className="animate-spin" /> : (isEditMode ? <Edit2 size={16} /> : <Plus size={16} />)}
                  <span>{formSubmitLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  );

} 