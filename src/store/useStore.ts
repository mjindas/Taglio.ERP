import { create } from "zustand";

// ─── Module-level CRUD permission block ────────────────────────────────────
export interface CrudPerm {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

const fullPerm  = (): CrudPerm => ({ create: true,  read: true,  update: true,  delete: true  });
const readOnly  = (): CrudPerm => ({ create: false, read: true,  update: false, delete: false });
const noPerm    = (): CrudPerm => ({ create: false, read: false, update: false, delete: false });

// ─── Per-module permission map ────────────────────────────────────────────
export interface UserPermissions {
  masters: {
    clients:    CrudPerm;
    suppliers:  CrudPerm;
    categories: CrudPerm;
    products:   CrudPerm;
    users:      CrudPerm; // Admin-only meaningful
  };
  transactions: {
    quotations:    CrudPerm;
    salesOrders:   CrudPerm;
    invoices:      CrudPerm;
    purchaseOrders: CrudPerm;
    receiptNotes:  CrudPerm;
  };
}

export const adminPermissions = (): UserPermissions => ({
  masters:      { clients: fullPerm(), suppliers: fullPerm(), categories: fullPerm(), products: fullPerm(), users: fullPerm() },
  transactions: { quotations: fullPerm(), salesOrders: fullPerm(), invoices: fullPerm(), purchaseOrders: fullPerm(), receiptNotes: fullPerm() },
});

export const defaultUserPermissions = (): UserPermissions => ({
  masters:      { clients: readOnly(), suppliers: readOnly(), categories: readOnly(), products: readOnly(), users: noPerm() },
  transactions: { quotations: readOnly(), salesOrders: readOnly(), invoices: readOnly(), purchaseOrders: readOnly(), receiptNotes: readOnly() },
});

// ─── SMTP Settings ────────────────────────────────────────────────────────
export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  useSsl: boolean;
}

// ─── User ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  employeeCode: string;
  employeeName: string;
  role: "Admin" | "User";
  smtp: SmtpSettings;
  permissions: UserPermissions;
}

// ─── Company (full) ───────────────────────────────────────────────────────
export interface CompanyInfo {
  id: string;
  code: string;
  name: string;
  mailingName: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  website: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  financialYearStart: string; // e.g. "April"
  logo?: string;
}

// ─── Client ───────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  mailingName: string;
  phone: string;
  email: string;
  contactPerson: string;
  contactPersonNumber: string;
  gstNumber: string;
  isGstApplicable: boolean;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

// ─── Supplier ─────────────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  mailingName: string;
  gstNumber: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

// ─── Category ─────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
}

// ─── Product ──────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  masterCode: string; // Auto-generated sequential (e.g. PRD-1001)
  productCode: string; // User-defined typable code
  name: string;
  categoryId: string;
  description: string;
  unit: "Per Unit" | "Per 1000";
  purchasePrice: number;
  price: number; 
  hsn: string;
  gstRate: number;
  currentStock: number;
  imageUrl?: string;
}

// ─── Quote / Order / Invoice ──────────────────────────────────────────────
export interface QuoteItem {
  productId: string;
  qty: number;
  price: number; // Base price
}

export interface Quote {
  id: string;
  clientId: string;
  date: string;
  items: QuoteItem[];
  profitPercent: number;     // New
  discountPercent: number;   // New
  isTaxApplicable: boolean;  // New
  totalAmount: number;
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Converted";
  approvedBy?: string;
  approvedAt?: string;
}

export interface SalesOrder {
  id: string;
  clientId: string;
  quoteId?: string; // Optional: direct SO or from Quote
  date: string;
  items: QuoteItem[];
  status: "Booked" | "Dispatched" | "Cancelled";
  totalAmount: number;
}

// ─── Purchase Order ───────────────────────────────────────────────────────
export interface PurchaseOrderItem {
  productId: string;
  qty: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  date: string;
  items: PurchaseOrderItem[];
  total: number;
  status: "Pending" | "Received";
}

// ─── Inventory Tracking ──────────────────────────────────────────────────
export interface InventoryTransaction {
  id: string;
  productId: string;
  type: "Receipt" | "Sale" | "Adjustment";
  qty: number;
  date: string;
}

// ─── Auth slice ───────────────────────────────────────────────────────────
export interface AuthState {
  company: CompanyInfo | null;
  user: User | null;
  login: (c: CompanyInfo, u: User) => void;
  logout: () => void;
}

// ─── Full store ───────────────────────────────────────────────────────────
export interface StoreState extends AuthState {
  companyInfo: CompanyInfo;
  users: User[];
  clients: Client[];
  suppliers: Supplier[];
  categories: Category[];
  products: Product[];
  quotes: Quote[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  inventoryTransactions: InventoryTransaction[];

  // ── Actions ──
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  addUser:     (u: Omit<User, "id">) => void;
  updateUser:  (id: string, u: Partial<Omit<User, "id">>) => void;
  deleteUser:  (id: string) => void;

  addClient:    (c: Omit<Client, "id">)    => void;
  updateClient: (id: string, c: Partial<Omit<Client, "id">>) => void;
  deleteClient: (id: string) => void;

  addSupplier:    (s: Omit<Supplier, "id">)    => void;
  updateSupplier: (id: string, s: Partial<Omit<Supplier, "id">>) => void;
  deleteSupplier: (id: string) => void;

  addCategory:    (c: Omit<Category, "id">)    => void;
  updateCategory: (id: string, c: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;

  addProduct:    (p: Omit<Product, "id">)    => void;
  updateProduct: (id: string, p: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;

  // Quotes
  addQuote:       (q: Omit<Quote, "id" | "status">) => void;
  updateQuoteStatus: (id: string, status: Quote["status"], userId: string) => void;
  
  // Sales Orders
  addSalesOrder: (so: Omit<SalesOrder, "id">) => void;
  dispatchSalesOrder: (soId: string) => void;

  // Inventory
  addInventoryTransaction: (t: Omit<InventoryTransaction, "id">) => void;

  // Purchase Order
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "status">) => void;
  receivePurchaseOrder: (poId: string) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────
const seedCompany: CompanyInfo = {
  id: "CO1",
  code: "TAGLIO",
  name: "Taglio Industries Pvt Ltd",
  mailingName: "Taglio Industries",
  gstin: "27AABCT1234A1Z5",
  pan: "AABCT1234A",
  phone: "022-12345678",
  email: "info@taglio.in",
  website: "www.taglio.in",
  addressLine: "Plot 5, MIDC, Andheri East",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  pinCode: "400093",
  financialYearStart: "April",
};

const seedAdmin: User = {
  id: "U1",
  username: "admin",
  password: "test123",
  email: "admin@taglio.in",
  employeeCode: "EMP001",
  employeeName: "System Administrator",
  role: "Admin",
  smtp: { host: "smtp.gmail.com", port: 587, username: "admin@taglio.in", password: "", fromEmail: "admin@taglio.in", fromName: "Taglio ERP", useSsl: true },
  permissions: adminPermissions(),
};

// ─── Store ────────────────────────────────────────────────────────────────
export const useStore = create<StoreState>((set) => ({
  company: null,
  user: null,

  login:  (company, user) => set({ company, user }),
  logout: () => set({ company: null, user: null }),

  companyInfo: seedCompany,
  users: [seedAdmin],

  clients: [
    { id: "C1", name: "Acme Corp", mailingName: "Acme Corporation Pvt Ltd", phone: "9876543210", email: "contact@acme.inc", contactPerson: "Rahul Sharma", contactPersonNumber: "9876500000", gstNumber: "27AABCU9603R1ZM", isGstApplicable: true, addressLine: "Plot 12, Andheri East", city: "Mumbai", state: "Maharashtra", country: "India", pinCode: "400069" },
  ],
  suppliers: [
    { id: "S1", name: "Global Supplies Ltd", mailingName: "Global Supplies Limited", gstNumber: "07AAACG1234A1Z5", addressLine: "45-B, Industrial Area", city: "New Delhi", state: "Delhi", country: "India", pinCode: "110020" },
  ],
  categories: [
    { id: "CAT1", name: "Electronics" },
    { id: "CAT2", name: "Stationery" },
  ],
  products: [
    { id: "P1", masterCode: "PRD-1001", productCode: "WM-X1", name: "Wireless Mouse",  categoryId: "CAT1", description: "Ergonomic", unit: "Per Unit",  purchasePrice: 400, price: 500,   hsn: "8471", gstRate: 18, currentStock: 50, imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200&auto=format&fit=crop" },
    { id: "P2", masterCode: "PRD-1002", productCode: "NB-A4", name: "Notebooks",       categoryId: "CAT2", description: "A4 size",   unit: "Per 1000", purchasePrice: 12000, price: 15000, hsn: "4820", gstRate: 12, currentStock: 10000, imageUrl: "https://images.unsplash.com/photo-1531736222714-5d5196395b8d?q=80&w=200&auto=format&fit=crop" },
  ],
  quotes: [],
  salesOrders: [],
  purchaseOrders: [],
  inventoryTransactions: [],

  // Company
  updateCompanyInfo: (info) => set((s) => ({ companyInfo: { ...s.companyInfo, ...info } })),

  // Users
  addUser:    (u)        => set((s) => ({ users: [...s.users,    { ...u, id: "U"+Date.now() }] })),
  updateUser: (id, data) => set((s) => ({ users: s.users.map(u    => u.id === id ? { ...u, ...data } : u) })),
  deleteUser: (id)       => set((s) => ({ users: s.users.filter(u => u.id !== id) })),

  // Clients
  addClient:    (c)        => set((s) => ({ clients: [...s.clients,    { ...c, id: "C"+Date.now() }] })),
  updateClient: (id, data) => set((s) => ({ clients: s.clients.map(c    => c.id === id ? { ...c, ...data } : c) })),
  deleteClient: (id)       => set((s) => ({ clients: s.clients.filter(c => c.id !== id) })),

  // Suppliers
  addSupplier:    (sup)      => set((s) => ({ suppliers: [...s.suppliers,    { ...sup, id: "S"+Date.now() }] })),
  updateSupplier: (id, data) => set((s) => ({ suppliers: s.suppliers.map(su    => su.id === id ? { ...su, ...data } : su) })),
  deleteSupplier: (id)       => set((s) => ({ suppliers: s.suppliers.filter(su => su.id !== id) })),

  // Categories
  addCategory:    (c)        => set((s) => ({ categories: [...s.categories,    { ...c, id: "CAT"+Date.now() }] })),
  updateCategory: (id, data) => set((s) => ({ categories: s.categories.map(c    => c.id === id ? { ...c, ...data } : c) })),
  deleteCategory: (id)       => set((s) => ({ categories: s.categories.filter(c => c.id !== id) })),

  // Products
  addProduct: (p) => set((s) => {
    const nextCodeNum = s.products.length + 1001;
    return { products: [...s.products, { ...p, id: "P"+Date.now(), masterCode: `PRD-${nextCodeNum}` }] };
  }),
  updateProduct: (id, data) => set((s) => ({ products: s.products.map(p    => p.id === id ? { ...p, ...data } : p) })),
  deleteProduct: (id)       => set((s) => ({ products: s.products.filter(p => p.id !== id) })),

  // Quotes
  addQuote: (q) => set((s) => ({ quotes: [...s.quotes, { ...q, id: "Q"+Date.now(), status: "Pending Approval" }] })),
  updateQuoteStatus: (id, status, userId) => set((s) => ({
    quotes: s.quotes.map(q => q.id === id ? { ...q, status, approvedBy: userId, approvedAt: new Date().toISOString() } : q)
  })),

  // Sales Orders
  addSalesOrder: (so) => set((s) => ({ 
    salesOrders: [...s.salesOrders, { ...so, id: "SO"+Date.now(), status: "Booked" }],
    // If quote used, mark converted
    quotes: s.quotes.map(q => q.id === so.quoteId ? { ...q, status: "Converted" } : q)
  })),

  dispatchSalesOrder: (soId) => set((s) => {
    const so = s.salesOrders.find(o => o.id === soId);
    if (!so) return s;
    
    const logs: InventoryTransaction[] = so.items.map(item => ({
      id: "LOG"+Date.now()+Math.random(),
      productId: item.productId,
      type: "Sale",
      qty: item.qty,
      date: new Date().toISOString()
    }));

    return {
      salesOrders: s.salesOrders.map(o => o.id === soId ? { ...o, status: "Dispatched" } : o),
      products: s.products.map(p => {
        const item = so.items.find(i => i.productId === p.id);
        return item ? { ...p, currentStock: p.currentStock - item.qty } : p;
      }),
      inventoryTransactions: [...s.inventoryTransactions, ...logs]
    };
  }),

  // Inventory Transaction
  addInventoryTransaction: (t) => set((s) => ({
    inventoryTransactions: [...s.inventoryTransactions, { ...t, id: "LOG"+Date.now() }],
    products: s.products.map(p => p.id === t.productId ? { 
      ...p, 
      currentStock: p.currentStock + (t.type === "Receipt" ? t.qty : -t.qty) 
    } : p)
  })),

  addPurchaseOrder: (po) => set((s) => ({
    purchaseOrders: [...s.purchaseOrders, { ...po, id: "PO"+Date.now(), status: "Pending" }]
  })),

  receivePurchaseOrder: (poId) => set((s) => {
    const po = s.purchaseOrders.find(p => p.id === poId);
    if (!po) return s;
    const logs: InventoryTransaction[] = po.items.map(item => ({
      id: "LOG"+Date.now()+Math.random(),
      productId: item.productId,
      type: "Receipt",
      qty: item.qty,
      date: new Date().toISOString()
    }));
    return {
      purchaseOrders: s.purchaseOrders.map(p => p.id === poId ? { ...p, status: "Received" } : p),
      products: s.products.map(p => {
        const item = po.items.find(i => i.productId === p.id);
        return item ? { ...p, currentStock: p.currentStock + item.qty } : p;
      }),
      inventoryTransactions: [...s.inventoryTransactions, ...logs]
    };
  }),
}));
