import { useEffect, useState, useCallback } from 'react';
import apiClient, { orderService, supplierService, productService, warehouseService, customerService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import PurchaseOrdersTable from '../components/PurchaseOrdersTable';
import { ShoppingCart, DollarSign, X, Plus, Package, MessageSquare, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Layers, TrendingUp, Loader2, Eye, Printer, Trash2 } from 'lucide-react';

// ── Initial form states ────────────────────────────────────────────────────────
const INIT_PO = {
  supplierId: '',
  warehouseId: '',
  refNo: '',
  notes: '',
  items: [{ productId: '', productName: '', quantity: '', unitPrice: '' }],
};

const INIT_SO = {
  customerId: '',
  customerName: '',
  warehouseId: '',
  refNo: '',
  notes: '',
  items: [{ productId: '', productName: '', quantity: '', unitPrice: '' }],
};

// ── Create Purchase Order Modal ────────────────────────────────────────────────
function CreatePurchaseOrderModal({ suppliers, onClose, onCreated }) {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [availableWarehouses, setAvailableWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orgId = user.orgId;

    productService.getAll()
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        const prods = list.map(p => ({
          id: p.id,
          name: p.name || p.productName || p.sku || `Product #${p.id}`,
          price: p.price !== undefined && p.price !== null ? p.price : '',
        }));
        setAvailableProducts(prods);
      })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setProductsLoading(false));

    const warehouseFetch = orgId
      ? warehouseService.getByOrganization(orgId)
      : warehouseService.getAll();
    warehouseFetch
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        setAvailableWarehouses(list.filter(w => w.isActive !== false));
      })
      .catch(err => console.error('Failed to load warehouses:', err))
      .finally(() => setWarehousesLoading(false));
  }, []);

  const [form, setForm] = useState(INIT_PO);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateItem = (idx, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const handleProductSelect = (idx, productId) => {
    const product = availableProducts.find(p => String(p.id) === String(productId));
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = {
        ...items[idx],
        productId: product ? product.id : '',
        productName: product ? product.name : '',
        unitPrice: product && product.price !== '' ? product.price : items[idx].unitPrice,
      };
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', productName: '', quantity: '', unitPrice: '' }] }));

  const removeItem = (idx) =>
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const computedTotal = form.items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId) { setError('Please select a supplier.'); return; }
    if (!form.warehouseId) { setError('Please select a warehouse.'); return; }
    if (form.items.some(it => !it.productId || !it.quantity || !it.unitPrice)) {
      setError('Please fill in all item fields.'); return;
    }
    setSubmitting(true); setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        supplierId: Number(form.supplierId),
        warehouseId: Number(form.warehouseId),
        orgId: user.orgId ? Number(user.orgId) : null,
        refNo: form.refNo.trim() || null,
        notes: form.notes.trim() || null,
        items: form.items.map(it => ({
          productId: Number(it.productId),
          quantity: parseInt(it.quantity, 10),
          unitPrice: parseFloat(it.unitPrice),
        })),
      };
      await orderService.createPurchaseOrder(payload);
      onCreated('Purchase order created successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupplierSelect = (supplierId) => {
    if (!supplierId) {
      setForm(prev => ({ ...prev, supplierId: "" }));
      return;
    }

    const supplier = suppliers.find(s => String(s.id) === String(supplierId));
    const mappings = supplier?.contactInfo?.mappings || [];

    setForm(prev => {
      if (mappings.length > 0) {
        const newItems = mappings.map(mapping => {
          const product = availableProducts.find(p => String(p.id) === String(mapping.productId));
          return {
            productId: mapping.productId || '',
            productName: product ? product.name : mapping.productName || '',
            quantity: '',
            unitPrice: mapping.defaultPrice !== undefined && mapping.defaultPrice !== null ? mapping.defaultPrice : ''
          };
        });
        return { ...prev, supplierId, items: newItems };
      }
      return { ...prev, supplierId };
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">🛒 Create Purchase Order</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Approval Sequence</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier *</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                value={form.supplierId}
                onChange={e => handleSupplierSelect(e.target.value)}
                required
              >
                <option value="">— Select supplier —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Warehouse *</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                value={form.warehouseId}
                onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))}
                required
                disabled={warehousesLoading}
              >
                <option value="">
                  {warehousesLoading ? '⏳ Loading Warehouses…' : '— Select warehouse —'}
                </option>
                {availableWarehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name || w.warehouseName || `Warehouse #${w.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Number / Reference <span className="normal-case opacity-40 font-bold ml-1">(Optional)</span></label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. PO-99238"
                value={form.refNo}
                onChange={e => setForm(p => ({ ...p, refNo: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory List</label>
              <button type="button" onClick={addItem} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                <Plus size={10} className="inline mr-1" /> Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2 duration-200">
                  <select
                    className="flex-[2] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-400"
                    value={item.productId}
                    onChange={e => handleProductSelect(idx, e.target.value)}
                    required
                    disabled={productsLoading}
                  >
                    <option value="">{productsLoading ? 'Loading…' : '— Product —'}</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:border-indigo-400" type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} required />
                  <input className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:border-indigo-400" type="number" placeholder="Price" min="0.01" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} required />
                  <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length === 1} className="p-2 bg-rose-50 text-rose-600 rounded-lg disabled:opacity-30 hover:bg-rose-100 mt-0.5">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4">Projected Total</span>
                <span className="text-xl font-black text-indigo-600">Rs.{computedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Notes <span className="normal-case opacity-40 font-bold ml-1">(Optional)</span></label>
            <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 min-h-[80px]" placeholder="e.g. Terms for bulk discount applying next month…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-10 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:grayscale">
              {submitting ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Create Sales Order Modal ───────────────────────────────────────────────────
function CreateSalesOrderModal({ onClose, onCreated }) {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [availableWarehouses, setAvailableWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [form, setForm] = useState(INIT_SO);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orgId = user.orgId;

    productService.getAll()
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        const prods = list.map(p => ({
          id: p.id,
          name: p.name || p.productName || p.sku || `Product #${p.id}`,
        }));
        setAvailableProducts(prods);
      })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setProductsLoading(false));

    customerService.getByOrganization(orgId)
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        const customers = list.map(customer => ({
          id: customer.id,
          name: customer.customerName || customer.name || `Customer #${customer.id}`,
        }));
        setAvailableCustomers(customers);
      })
      .catch(err => console.error('Failed to load customers:', err))
      .finally(() => setCustomersLoading(false));

    const warehouseFetch = orgId
      ? warehouseService.getByOrganization(orgId)
      : warehouseService.getAll();
    warehouseFetch
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        setAvailableWarehouses(list.filter(w => w.isActive !== false));
      })
      .catch(err => console.error('Failed to load warehouses:', err))
      .finally(() => setWarehousesLoading(false));
  }, []);

  const updateItem = (idx, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const handleProductSelect = (idx, productId) => {
    const product = availableProducts.find(p => String(p.id) === String(productId));
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = {
        ...items[idx],
        productId: product ? product.id : '',
        productName: product ? product.name : '',
      };
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', productName: '', quantity: '', unitPrice: '' }] }));

  const removeItem = (idx) =>
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const computedTotal = form.items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleCustomerSelect = (customerId) => {
    if (!customerId) {
      setForm(prev => ({ ...prev, customerId: '', customerName: '' }));
      return;
    }

    const customer = availableCustomers.find(c => String(c.id) === String(customerId));
    setForm(prev => ({
      ...prev,
      customerId,
      customerName: customer ? customer.name : prev.customerName,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim()) { setError('Please select a customer.'); return; }
    if (!form.warehouseId) { setError('Please select a warehouse.'); return; }
    if (form.items.some(it => !it.productId || !it.quantity || !it.unitPrice)) {
      setError('Please fill in all item fields.'); return;
    }
    setSubmitting(true); setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        customerName: form.customerName.trim(),
        customerId: form.customerId ? Number(form.customerId) : null,
        warehouseId: Number(form.warehouseId),
        orgId: user.orgId ? Number(user.orgId) : null,
        refNo: form.refNo.trim() || null,
        notes: form.notes.trim() || null,
        totalAmount: computedTotal,
        items: form.items.map(it => ({
          productId: Number(it.productId),
          quantity: parseInt(it.quantity, 10),
          unitPrice: parseFloat(it.unitPrice),
        })),
      };
      await orderService.createSalesOrder(payload);
      onCreated('Sales order created successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to create sales order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-emerald-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">💰 Create Sales Order</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Customer Transaction</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer Entity *</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                value={form.customerId}
                onChange={e => handleCustomerSelect(e.target.value)}
                required
                disabled={customersLoading}
              >
                <option value="">{customersLoading ? '⏳ Loading customers…' : '— Select customer —'}</option>
                {availableCustomers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Warehouse *</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                value={form.warehouseId}
                onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))}
                required
                disabled={warehousesLoading}
              >
                <option value="">{warehousesLoading ? '⏳ Loading…' : '— Select warehouse —'}</option>
                {availableWarehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name || w.warehouseName || `WH-${w.id}`}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Number / Reference <span className="normal-case opacity-40 font-bold ml-1">(Optional)</span></label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. SO-2026-0091"
                value={form.refNo}
                onChange={e => setForm(p => ({ ...p, refNo: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Line Items</label>
              <button type="button" onClick={addItem} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                <Plus size={10} className="inline mr-1" /> Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2 duration-200">
                  <select
                    className="flex-[2] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-400"
                    value={item.productId}
                    onChange={e => handleProductSelect(idx, e.target.value)}
                    required
                    disabled={productsLoading}
                  >
                    <option value="">{productsLoading ? 'Loading…' : '— Product —'}</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:border-emerald-400" type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} required />
                  <input className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:border-emerald-400" type="number" placeholder="Price" min="0.01" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} required />
                  <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length === 1} className="p-2 bg-rose-50 text-rose-600 rounded-lg disabled:opacity-30 hover:bg-rose-100 mt-0.5">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mr-4">Settlement Value</span>
                <span className="text-xl font-black text-emerald-600">Rs.{computedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Memo / Notes</label>
            <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 min-h-[80px]" placeholder="e.g. Special packaging instructions or discount context…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-10 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:grayscale">
              {submitting ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Receive Purchase Order Modal ───────────────────────────────────────────────
function ReceiveOrderModal({ order, products, onClose, onReceived }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Track received quantities for each item (initially set to full ordered qty)
  const [receiveQtys, setReceiveQtys] = useState(() => {
    const qtys = {};
    order.items?.forEach(it => {
      qtys[it.id] = it.quantity || 0;
    });
    return qtys;
  });

  const getProductName = (id) => {
    const p = products.find(p => String(p.id) === String(id));
    return p ? p.name : `Product #${id}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if at least one item has a receive qty > 0
    const totalReceiveQty = Object.values(receiveQtys).reduce((sum, q) => sum + Number(q), 0);
    if (totalReceiveQty <= 0) {
      setError('Please specify at least one item quantity to receive.');
      return;
    }

    // Verify receive qty does not exceed ordered qty
    for (const item of order.items || []) {
      const rq = Number(receiveQtys[item.id] || 0);
      if (rq > item.quantity) {
        setError(`Received quantity for ${getProductName(item.productId)} cannot exceed the ordered quantity (${item.quantity}).`);
        return;
      }
      if (rq < 0) {
        setError(`Received quantity for ${getProductName(item.productId)} cannot be negative.`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        items: Object.entries(receiveQtys).map(([itemId, qty]) => ({
          itemId: Number(itemId),
          quantity: Number(qty)
        }))
      };

      await apiClient.patch(`/api/orders/purchase/${order.id}/receive`, payload);
      onReceived('Inventory reception registered & stock updated.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process reception.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-purple-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">📦 Receive Purchase Order</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: #PO-{String(order.id).padStart(3, '0')}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block px-1">Items to Receive</label>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 truncate">{getProductName(item.productId)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ordered Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Receive:</span>
                    <input
                      type="number"
                      max={item.quantity}
                      min="0"
                      className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                      value={receiveQtys[item.id] ?? 0}
                      onChange={(e) => setReceiveQtys(prev => ({ ...prev, [item.id]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-10 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95 disabled:grayscale flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Confirm Receive'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Return Purchase Order Modal ───────────────────────────────────────────────
function ReturnOrderModal({ order, products, onClose, onReturned }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');

  // Track quantities for each item being returned (initially full qty)
  const [returnQtys, setReturnQtys] = useState(() => {
    const qtys = {};
    order.items?.forEach(it => {
      const maxQty = (it.receivedQuantity !== undefined && it.receivedQuantity !== null ? it.receivedQuantity : it.quantity) - (it.returnedQuantity || 0);
      qtys[it.id] = Math.max(maxQty, 0);
    });
    return qtys;
  });

  const getProductName = (id) => {
    const p = products.find(p => String(p.id) === String(id));
    return p ? p.name : `Product #${id}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please provide a reason for the return.'); return; }

    // Check if at least one item has a return qty > 0
    const totalReturnQty = Object.values(returnQtys).reduce((sum, q) => sum + Number(q), 0);
    if (totalReturnQty <= 0) {
      setError('Please specify at least one item quantity to return.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // We send back the quantities map and the reason
      const payload = {
        reason: reason.trim(),
        items: Object.entries(returnQtys).map(([itemId, qty]) => ({
          itemId: Number(itemId),
          quantity: Number(qty)
        }))
      };

      await apiClient.patch(`/api/orders/purchase/${order.id}/return`, payload);
      onReturned('Return processed & inventory updated.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-purple-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">↩️ Return Purchase Order</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: #PO-{String(order.id).padStart(3, '0')}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Items to Return</label>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 truncate">{getProductName(item.productId)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {`Ordered: ${item.quantity}`}
                      {item.receivedQuantity !== undefined && item.receivedQuantity !== null && ` | Received: ${item.receivedQuantity}`}
                      {item.returnedQuantity !== undefined && item.returnedQuantity !== null && item.returnedQuantity > 0 && ` | Returned: ${item.returnedQuantity}`}
                      {item.receivedQuantity !== undefined && item.receivedQuantity !== null && ` | Net Qty: ${item.receivedQuantity - (item.returnedQuantity || 0)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Return:</span>
                    <input
                      type="number"
                      max={(item.receivedQuantity !== undefined && item.receivedQuantity !== null ? item.receivedQuantity : item.quantity) - (item.returnedQuantity || 0)}
                      min="0"
                      className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                      value={returnQtys[item.id] || 0}
                      onChange={(e) => setReturnQtys(prev => ({ ...prev, [item.id]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Reason for Return *</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-purple-400 min-h-[80px]"
              placeholder="e.g. Expired on arrival, Physical damage to packaging..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-10 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95 disabled:grayscale flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Submit Return'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Orders Page ───────────────────────────────────────────────────────────
function Orders() {
  const { confirm } = useNotification();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchase');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [showCreateSO, setShowCreateSO] = useState(false);
  const [showReturnPO, setShowReturnPO] = useState(null); // stores the order to return
  const [showReceivePO, setShowReceivePO] = useState(null); // stores the order to receive
  const [viewOrder, setViewOrder] = useState(null);

  const getProductName = (productId) => {
    const p = products.find(p => String(p.id) === String(productId));
    return p ? p.name : `Product #${productId}`;
  };

  const getViewOrderTotal = (order) => {
    if (!order) return 0;
    if (!order.customerName && (order.status === 'RECEIVED' || order.status === 'RETURNED')) {
      return order.items?.reduce((sum, item) => {
        const qty = (item.receivedQuantity !== undefined && item.receivedQuantity !== null ? item.receivedQuantity : item.quantity) - (item.returnedQuantity || 0);
        return sum + (Math.max(qty, 0) * item.unitPrice);
      }, 0) || 0;
    }
    return order.totalAmount ?? 0;
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setActionError('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orgId = user.orgId;

    try {
      const [purchaseRes, salesRes, suppliersRes, productsRes, warehousesRes] = await Promise.allSettled([
        orderService.getPurchaseOrders(),
        orderService.getSalesOrders(),
        orgId ? supplierService.getByOrganization(orgId) : supplierService.getAll(),
        productService.getAll(),
        orgId ? warehouseService.getByOrganization(orgId) : warehouseService.getAll(),
      ]);
      if (purchaseRes.status === 'fulfilled') {
        const data = purchaseRes.value.data;
        const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        setPurchaseOrders(list);
        setViewOrder(prev => {
          if (prev && !prev.customerName) {
            const updated = list.find(o => String(o.id) === String(prev.id));
            return updated || prev;
          }
          return prev;
        });
      }
      if (salesRes.status === 'fulfilled') {
        const data = salesRes.value.data;
        const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        setSalesOrders(list);
        setViewOrder(prev => {
          if (prev && prev.customerName) {
            const updated = list.find(o => String(o.id) === String(prev.id));
            return updated || prev;
          }
          return prev;
        });
      }
      if (warehousesRes.status === 'fulfilled') {
        const data = warehousesRes.value.data;
        setWarehouses(Array.isArray(data) ? data : (data?.content ?? data?.data ?? []));
      }
      if (suppliersRes.status === 'fulfilled') {
        const data = suppliersRes.value.data;
        const sList = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        setSuppliers(sList.map((s) => ({
          ...s,
          id: s.id,
          name: s.name || s.supplierName || s.companyName || `Supplier #${s.id}`,
        })));
      }
      if (productsRes.status === 'fulfilled') {
        const data = productsRes.value.data;
        const pList = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
        setProducts(pList.map((p) => ({
          id: p.id,
          name: p.name || p.productName || p.sku || `Product #${p.id}`,
        })));
      }
    } catch (err) {
      setActionError('Failed to load orders. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const isActionLoading = (type, id) => actionLoading?.type === type && actionLoading?.id === id;

  const handleApprove = async (orderId) => {
    const isConfirmed = await confirm({
      title: 'Approve Purchase Order',
      message: 'This will authorize the procurement protocol for this order. Continue?',
      type: 'info',
      confirmLabel: 'Approve',
      cancelLabel: 'Cancel'
    });
    if (!isConfirmed) return;
    try {
      await apiClient.patch(`/api/orders/purchase/${orderId}/approve`);
      showSuccess(`Order approved.`);
      fetchOrders();
    } catch (e) { setActionError(e.response?.data?.error || 'Failed to approve order.'); }
  };

  const handleReceive = (orderId) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (order) setShowReceivePO(order);
  };

  const handleReturnAction = (orderId, reason) => {
    // This is called from the table directly by clicking the button
    const order = purchaseOrders.find(o => o.id === orderId);
    if (order) setShowReturnPO(order);
  };

  const handleReturn = async (orderId, payload) => {
    // This is called from the ReturnOrderModal
    try {
      await apiClient.patch(`/api/orders/purchase/${orderId}/return`, payload);
      showSuccess(`Order returned & stock adjusted.`);
      fetchOrders();
    } catch (e) { setActionError(e.response?.data?.error || 'Failed to return order.'); }
  };

  const handleCancel = async (orderId) => {
    const isConfirmed = await confirm({
      title: 'Terminate Order',
      message: 'This will irreversibly cancel the procurement lifecycle for this record. Confirm termination?',
      type: 'danger',
      confirmLabel: 'Cancel Order',
      cancelLabel: 'Retain'
    });
    if (!isConfirmed) return;
    try {
      await apiClient.patch(`/api/orders/purchase/${orderId}/cancel`);
      showSuccess(`Order cancelled.`);
      fetchOrders();
    } catch (e) { setActionError(e.response?.data?.error || 'Failed to cancel order.'); }
  };

  const handleDeletePurchaseOrder = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Purchase Order',
      message: 'This will purge this purchase order from the system database. Confirm deletion?',
      type: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!isConfirmed) return;
    try {
      setActionLoading({ type: 'delete', id });
      await orderService.deletePurchaseOrder(id);
      showSuccess(`Purchase order successfully deleted`);
      fetchOrders();
    } catch (e) {
      setActionError(e.response?.data?.error || 'Failed to delete purchase order.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSalesOrder = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Sales Order',
      message: 'This will purge this sales order from the system database. Confirm deletion?',
      type: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!isConfirmed) return;
    try {
      setActionLoading({ type: 'delete', id });
      await orderService.deleteSalesOrder(id);
      showSuccess(`Sales order successfully deleted`);
      fetchOrders();
    } catch (e) {
      setActionError(e.response?.data?.error || 'Failed to delete sales order.');
    } finally {
      setActionLoading(null);
    }
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find(w => String(w.id) === String(id));
    return w ? (w.name || w.warehouseName) : `WH-${id}`;
  };

  const handleView = (order) => {
    setViewOrder(order);
  };

  const handlePrintPO = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print manifests.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const companyName = user.orgName || 'KNOWEB INVENTORY';
    const supplierName = suppliers.find(s => String(s.id) === String(order.supplierId))?.name || `Supplier #${order.supplierId}`;

    const isReceivedOrReturned = order.status === 'RECEIVED' || order.status === 'RETURNED';
    let computedTotal = 0;

    const itemsHtml = order.items?.map((item, idx) => {
      const hasReceived = item.receivedQuantity !== undefined && item.receivedQuantity !== null;
      const netQty = hasReceived ? (item.receivedQuantity - (item.returnedQuantity || 0)) : item.quantity;
      const lineTotal = netQty * item.unitPrice;
      computedTotal += lineTotal;

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; font-size: 13px;">
          <td style="padding: 12px; font-weight: bold; color: #334155; text-align: left;">${getProductName(item.productId)}</td>
          <td style="padding: 12px; text-align: center; color: #475569;">${item.quantity}</td>
          <td style="padding: 12px; text-align: center; color: #10b981; font-weight: bold;">${hasReceived ? item.receivedQuantity : '-'}</td>
          <td style="padding: 12px; text-align: center; color: #ef4444; font-weight: bold;">${item.returnedQuantity || 0}</td>
          <td style="padding: 12px; text-align: center; color: #2563eb; font-weight: bold;">${hasReceived ? netQty : item.quantity}</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; color: #0f172a;">Rs. ${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('') || `<tr><td colspan="6" style="padding: 12px; text-align: center; color: #94a3b8;">No items</td></tr>`;

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order Manifest - #PO-${String(order.id).padStart(3, '0')}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .company-details h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 900;
            color: #4f46e5;
            letter-spacing: -0.025em;
          }
          .company-details p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
            font-weight: 500;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h2 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.025em;
          }
          .invoice-title p {
            margin: 0;
            font-family: monospace;
            font-weight: bold;
            color: #4f46e5;
            background-color: #e0e7ff;
            padding: 4px 12px;
            border-radius: 6px;
            display: inline-block;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .info-block label {
            display: block;
            font-size: 10px;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 6px;
          }
          .info-block value {
            display: block;
            font-size: 15px;
            font-weight: 700;
            color: #334155;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          th {
            background-color: #f8fafc;
            color: #64748b;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
          .totals-block {
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 300px;
            margin-bottom: 0;
          }
          .totals-table tr td {
            padding: 8px 12px;
          }
          .final-total {
            font-size: 20px;
            font-weight: 900;
            color: #4f46e5;
          }
          .footer {
            margin-top: 48px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 24px;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 500;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-card {
              border: none;
              box-shadow: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div class="company-details">
              <h1>${companyName}</h1>
              <p>Supply Chain & Procurement Bill</p>
            </div>
            <div class="invoice-title">
              <h2>PURCHASE Bill</h2>
              <p>#PO-${String(order.id).padStart(3, '0')}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-block">
              <label>Supplier</label>
              <value>${supplierName}</value>
            </div>
            <div class="info-block" style="text-align: right;">
              <label>Warehouse</label>
              <value>${getWarehouseName(order.warehouseId)}</value>
            </div>
            <div class="info-block">
              <label>status</label>
              <value style="color: #4f46e5; font-weight: 800;">
                📦 ${order.status}
              </value>
            </div>
            <div class="info-block" style="text-align: right;">
              <label>Order Date</label>
              <value>${new Date(order.createdAt).toLocaleDateString()}</value>
            </div>
            ${order.refNo ? `
            <div class="info-block" style="grid-column: span 2; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #f1f5f9;">
              <label>Order Number / Reference</label>
              <value style="font-size: 16px; font-weight: 800; color: #4f46e5;">${order.refNo}</value>
            </div>
            ` : ''}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="width: 30%; padding: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: left; color: #64748b;">Product Details</th>
                <th style="width: 14%; padding: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: center; color: #64748b;">Ordered</th>
                <th style="width: 14%; padding: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: center; color: #64748b;">Received</th>
                <th style="width: 14%; padding: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: center; color: #64748b;">Returned</th>
                <th style="width: 14%; padding: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: center; color: #64748b;">Net Qty</th>
                <th style="width: 14%; padding: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: right; color: #64748b;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            ${isReceivedOrReturned ? `
            <tfoot>
              <tr style="background-color: #f8fafc; font-weight: 800; border-top: 2px solid #e2e8f0; font-size: 13px;">
                <td style="padding: 12px; text-align: left; color: #475569;">Total Summary (Rs.)</td>
                <td style="padding: 12px; text-align: center; color: #475569;">${(order.items?.reduce((sum, it) => sum + ((it.quantity || 0) * it.unitPrice), 0) || 0).toFixed(2)}</td>
                <td style="padding: 12px; text-align: center; color: #10b981;">${(order.items?.reduce((sum, it) => sum + ((it.receivedQuantity || 0) * it.unitPrice), 0) || 0).toFixed(2)}</td>
                <td style="padding: 12px; text-align: center; color: #ef4444;">${(order.items?.reduce((sum, it) => sum + ((it.returnedQuantity || 0) * it.unitPrice), 0) || 0).toFixed(2)}</td>
                <td style="padding: 12px; text-align: center; color: #2563eb;">${computedTotal.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; color: #4f46e5; font-size: 14px;">${computedTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
            ` : ''}
          </table>

          <div class="totals-block" style="display: flex; justify-content: flex-end; margin-top: 24px;">
            <table class="totals-table">
              <tr>
                <td style="color: #64748b; font-weight: bold;">Subtotal</td>
                <td style="text-align: right; font-weight: bold; color: #334155;">Rs. ${(isReceivedOrReturned ? computedTotal : (order.totalAmount || 0)).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #e2e8f0;">
                <td class="final-total">Total Due</td>
                <td class="final-total" style="text-align: right;">Rs. ${(isReceivedOrReturned ? computedTotal : (order.totalAmount || 0)).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${order.notes ? `
            <div style="margin-top: 32px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0;">
              <span style="font-size: 10px; font-weight: 800; color: #94a3b8; uppercase tracking-widest block mb-1">Internal Notes</span>
              <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic;">${order.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is an electronically generated document.</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const handlePrintSO = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print invoices.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const companyName = user.orgName || 'KNOWEB INVENTORY';

    const itemsHtml = order.items?.map((item, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px; font-weight: bold; color: #334155;">${getProductName(item.productId)}</td>
        <td style="padding: 12px; text-align: center; color: #475569;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #475569;">Rs. ${Number(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: #0f172a;">Rs. ${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('') || `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #94a3b8;">No items</td></tr>`;

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Order Invoice - #SO-${String(order.id).padStart(3, '0')}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .company-details h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 900;
            color: #10b981;
            letter-spacing: -0.025em;
          }
          .company-details p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
            font-weight: 500;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h2 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.025em;
          }
          .invoice-title p {
            margin: 0;
            font-family: monospace;
            font-weight: bold;
            color: #10b981;
            background-color: #ecfdf5;
            padding: 4px 12px;
            border-radius: 6px;
            display: inline-block;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .info-block label {
            display: block;
            font-size: 10px;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 6px;
          }
          .info-block value {
            display: block;
            font-size: 15px;
            font-weight: 700;
            color: #334155;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          th {
            background-color: #f8fafc;
            color: #64748b;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
          .totals-block {
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 300px;
            margin-bottom: 0;
          }
          .totals-table tr td {
            padding: 8px 12px;
          }
          .final-total {
            font-size: 20px;
            font-weight: 900;
            color: #10b981;
          }
          .footer {
            margin-top: 48px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 24px;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 500;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-card {
              border: none;
              box-shadow: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div class="company-details">
              <h1>${companyName}</h1>
              <p>Customer Chain & Inventory Management</p>
            </div>
            <div class="invoice-title">
              <h2>SALES BILL</h2>
              <p>#SO-${String(order.id).padStart(3, '0')}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-block">
              <label>Customer</label>
              <value>${order.customerName}</value>
            </div>
            <div class="info-block" style="text-align: right;">
              <label>Warehouse</label>
              <value>${getWarehouseName(order.warehouseId)}</value>
            </div>
            <div class="info-block">
              <label>Status</label>
              <value style="color: ${order.status === 'COMPLETED' ? '#10b981' : '#f59e0b'}; font-weight: 800;">
                ${order.status === 'COMPLETED' ? '✅ COMPLETED' : '⏳ PENDING'}
              </value>
            </div>
            <div class="info-block" style="text-align: right;">
              <label>Billing Date</label>
              <value>${new Date(order.createdAt).toLocaleDateString()}</value>
            </div>
            ${order.refNo ? `
            <div class="info-block" style="grid-column: span 2; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #f1f5f9;">
              <label>Order Number / Reference</label>
              <value style="font-size: 16px; font-weight: 800; color: #10b981;">${order.refNo}</value>
            </div>
            ` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Product Details</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Unit Price</th>
                <th style="width: 20%; text-align: right;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-block">
            <table class="totals-table">
              <tr>
                <td style="color: #64748b; font-weight: bold;">Subtotal</td>
                <td style="text-align: right; font-weight: bold; color: #334155;">Rs. ${(order.totalAmount || 0).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #e2e8f0;">
                <td class="final-total">Total Due</td>
                <td class="final-total" style="text-align: right;">Rs. ${(order.totalAmount || 0).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${order.notes ? `
            <div style="margin-top: 32px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0;">
              <span style="font-size: 10px; font-weight: 800; color: #94a3b8; uppercase tracking-widest block mb-1">Memo / Notes</span>
              <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic;">${order.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for your business! This is an electronically generated document.</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const handleComplete = async (orderId) => {
    const isConfirmed = await confirm({
      title: 'Order Fulfillment',
      message: 'Completing this sales order will automatically deduct stock from the source warehouse. Finalize transaction?',
      type: 'info',
      confirmLabel: 'Complete Order',
      cancelLabel: 'Cancel'
    });
    if (!isConfirmed) return;
    try {
      setActionLoading({ type: 'complete', id: orderId });
      await orderService.completeSalesOrder(orderId);
      showSuccess(`Sales Order fulfilled — stock updated ✅`);
      fetchOrders();
    } catch (e) {
      setActionError(e.response?.data?.error || 'Failed to complete order. Check stock availability.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {viewOrder && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className={`px-8 py-8 text-white ${viewOrder.customerName ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <ShoppingCart size={32} />
                  {viewOrder.customerName ? 'Sales Order Details' : 'Purchase Order Details'}
                </h2>
                <button onClick={() => setViewOrder(null)} className="text-white/60 hover:text-white transition-colors"><X size={28} /></button>
              </div>
              <div className="mt-4 flex gap-4 items-center">
                <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  Ref ID: {viewOrder.customerName ? `#SO-${String(viewOrder.id).padStart(3, '0')}` : `#PO-${String(viewOrder.id).padStart(3, '0')}`}
                  {viewOrder.refNo ? ` (${viewOrder.refNo})` : ''}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Created: {new Date(viewOrder.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Lifecycle</label>
                  {(() => {
                    const s = viewOrder.status;
                    const cfg = {
                      PENDING: { bg: 'bg-amber-100', color: 'text-amber-700', label: '⏳ Pending' },
                      APPROVED: { bg: 'bg-blue-100', color: 'text-blue-700', label: '✔ Approved' },
                      RECEIVED: { bg: 'bg-emerald-100', color: 'text-emerald-700', label: '📦 Received' },
                      CANCELLED: { bg: 'bg-rose-100', color: 'text-rose-700', label: '✕ Cancelled' },
                      RETURNED: { bg: 'bg-purple-100', color: 'text-purple-700', label: '↩ Returned' },
                    }[s] || { bg: 'bg-slate-100', color: 'text-slate-700', label: s };
                    return <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
                  })()}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contract Valuation</label>
                  <div className="text-xl font-black text-slate-800 tracking-tight">Rs.{Number(getViewOrderTotal(viewOrder)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className={viewOrder.customerName ? "p-3 bg-white rounded-lg shadow-sm text-emerald-500" : "p-3 bg-white rounded-lg shadow-sm text-indigo-500"}><Layers size={20} /></div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Resource Composition</span>
                    <span className="text-sm font-bold text-slate-700">{viewOrder.items?.length ?? 0} Distinct Line Items</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Manifest Breakdown</label>
                <div className="rounded-xl border border-slate-100 overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                        <th className="p-3 text-left">Product</th>
                        {!viewOrder.customerName ? (
                          <>
                            <th className="p-3 text-center">Ordered</th>
                            <th className="p-3 text-center">Received</th>
                            <th className="p-3 text-center">Returned</th>
                            <th className="p-3 text-center">Net Qty</th>
                          </>
                        ) : (
                          <th className="p-3 text-center">Qty</th>
                        )}
                        <th className="p-3 text-right">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                      {viewOrder.items?.map((item, i) => {
                        const hasReceived = (viewOrder.status === 'RECEIVED' || viewOrder.status === 'RETURNED') &&
                          item.receivedQuantity !== undefined && 
                          item.receivedQuantity !== null;
                        
                        const netQty = hasReceived ? (item.receivedQuantity - (item.returnedQuantity || 0)) : item.quantity;
                        const lineTotal = Math.max(netQty, 0) * item.unitPrice;
                        
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-left truncate max-w-[200px]">{getProductName(item.productId)}</td>
                            {!viewOrder.customerName ? (
                              <>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-center text-emerald-600">{hasReceived ? item.receivedQuantity : '-'}</td>
                                <td className="p-3 text-center text-rose-600">{item.returnedQuantity || 0}</td>
                                <td className="p-3 text-center text-blue-600">{hasReceived ? netQty : item.quantity}</td>
                              </>
                            ) : (
                              <td className="p-3 text-center">{item.quantity}</td>
                            )}
                            <td className={`p-3 text-right ${viewOrder.customerName ? 'text-emerald-600' : 'text-indigo-600'}`}>Rs.{Number(lineTotal).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {!viewOrder.customerName && (viewOrder.status === 'RECEIVED' || viewOrder.status === 'RETURNED') && (
                      <tfoot>
                        <tr className="bg-slate-50/50 font-black border-t border-slate-100 text-[11px] text-slate-700">
                          <td className="p-3 text-left">Total Summary (Rs.)</td>
                          <td className="p-3 text-center">{viewOrder.items?.reduce((sum, item) => sum + ((item.quantity || 0) * item.unitPrice), 0).toFixed(2)}</td>
                          <td className="p-3 text-center text-emerald-700">{viewOrder.items?.reduce((sum, item) => sum + ((item.receivedQuantity || 0) * item.unitPrice), 0).toFixed(2)}</td>
                          <td className="p-3 text-center text-rose-700">{viewOrder.items?.reduce((sum, item) => sum + ((item.returnedQuantity || 0) * item.unitPrice), 0).toFixed(2)}</td>
                          <td className="p-3 text-center text-blue-700">{viewOrder.items?.reduce((sum, item) => sum + (((item.receivedQuantity || 0) - (item.returnedQuantity || 0)) * item.unitPrice), 0).toFixed(2)}</td>
                          <td className="p-3 text-right text-indigo-700">{getViewOrderTotal(viewOrder).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              {viewOrder.customerName ? (
                <button
                  onClick={() => handlePrintSO(viewOrder)}
                  className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Printer size={14} /> Print Bill
                </button>
              ) : (
                <button
                  onClick={() => handlePrintPO(viewOrder)}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Printer size={14} /> Print Manifest
                </button>
              )}
              <button onClick={() => setViewOrder(null)} className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95">Dismiss Detail</button>
            </div>
          </div>
        </div>
      )}

      {showCreatePO && <CreatePurchaseOrderModal suppliers={suppliers} onClose={() => setShowCreatePO(false)} onCreated={(msg) => { showSuccess(msg); fetchOrders(); }} />}
      {showCreateSO && <CreateSalesOrderModal onClose={() => setShowCreateSO(false)} onCreated={(msg) => { showSuccess(msg); fetchOrders(); }} />}
      {showReturnPO && <ReturnOrderModal order={showReturnPO} products={products} onClose={() => setShowReturnPO(null)} onReturned={(msg) => { showSuccess(msg); fetchOrders(); }} />}
      {showReceivePO && <ReceiveOrderModal order={showReceivePO} products={products} onClose={() => setShowReceivePO(null)} onReceived={(msg) => { showSuccess(msg); fetchOrders(); }} />}

      <header className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Lifecycle</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 italic tracking-tight">Manage supply chain procurement and customer fulfillment pipelines</p>
        </div>
      </header>

      {/* Notifications */}
      <div className="space-y-3">
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <span className="font-bold text-sm">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')}><X size={16} /></button>
          </div>
        )}
        {actionError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500" />
              <span className="font-bold text-sm tracking-tight">{actionError}</span>
            </div>
            <button onClick={() => setActionError('')}><X size={16} /></button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-6 border-b border-slate-50 bg-slate-50/20 flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-1.5 p-1.5 bg-slate-100/60 rounded-2xl shadow-inner">
            <button onClick={() => setActiveTab('purchase')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all ${activeTab === 'purchase' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
              <ShoppingCart size={16} /> Purchase Order
              <span className={`ml-1 text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === 'purchase' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{purchaseOrders.length}</span>
            </button>
            <button onClick={() => setActiveTab('sales')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all ${activeTab === 'sales' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
              <TrendingUp size={16} /> Sales Order
              <span className={`ml-1 text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === 'sales' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{salesOrders.length}</span>
            </button>
          </div>

          <div>
            {activeTab === 'purchase' && (
              <button
                id="create-purchase-order-btn"
                onClick={() => setShowCreatePO(true)}
                className="px-8 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 shadow-[0_8px_30px_rgb(99,102,241,0.2)]"
              >
                <Plus size={18} /> New PO manifest
              </button>
            )}

            {activeTab === 'sales' && (
              <button
                id="create-sales-order-btn"
                onClick={() => setShowCreateSO(true)}
                className="px-8 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 shadow-[0_8px_30px_rgb(16,185,129,0.2)]"
              >
                <Plus size={18} /> New Sales Order
              </button>
            )}
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-300">
              <RefreshCw size={40} className="animate-spin mb-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synching Ledger...</span>
            </div>
          ) : activeTab === 'purchase' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              <PurchaseOrdersTable
                orders={purchaseOrders}
                suppliers={suppliers}
                products={products}
                warehouses={warehouses}
                onView={handleView}
                onApprove={handleApprove}
                onReceive={handleReceive}
                onCancel={handleCancel}
                onReturn={handleReturnAction}
                onPrint={handlePrintPO}
                onDelete={handleDeletePurchaseOrder}
                actionLoading={actionLoading}
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reference</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Entity</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Logic</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {salesOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-20 text-center text-slate-300 italic text-sm">No sales records available in this node.</td>
                      </tr>
                    ) : (
                      salesOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-center"><span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded shadow-inner tracking-widest font-mono">#SO-{String(order.id).padStart(3, '0')}</span></td>
                          <td className="px-6 py-4"><span className="text-sm font-black text-slate-800">{order.customerName}</span></td>
                          <td className="px-6 py-4 font-bold text-slate-400 text-xs italic">{getWarehouseName(order.warehouseId)}</td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900 tracking-tighter">Rs.{(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                              {order.status === 'COMPLETED' ? '✅ Completed' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-black text-slate-300 uppercase italic tracking-tighter">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {order.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleComplete(order.id)}
                                  disabled={isActionLoading('complete', order.id)}
                                  className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                  {isActionLoading('complete', order.id) ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                  {isActionLoading('complete', order.id) ? 'Completing...' : 'Mark Completed'}
                                </button>
                              )}
                              <button
                                onClick={() => handleView(order)}
                                className="p-2 bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all"
                                title="View Detail"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handlePrintSO(order)}
                                className="p-2 bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all"
                                title="Print Invoice"
                              >
                                <Printer size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSalesOrder(order.id)}
                                className="p-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                title="Delete Sales Order"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
