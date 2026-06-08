import { useState, useEffect } from "react";
import { Heading } from "@/src/components/ui/Heading";
import { Badge } from "@/src/components/ui/Badge";
import { 
  Lock, 
  Package, 
  FileText, 
  Users, 
  Check, 
  TrendingUp, 
  Compass, 
  Phone, 
  Scissors, 
  ShieldCheck, 
  RefreshCw,
  Plus,
  Edit2,
  Trash,
  X,
  Eye,
  PlusCircle,
  MinusCircle,
  Sparkles,
  Layers,
  Tag,
  Star,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export function Manager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"orders" | "products" | "bespoke" | "inquiries" | "reviews">("orders");
  const [loading, setLoading] = useState(false);

  // Synchronized server databases
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bespoke, setBespoke] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Search, Sort, and Pagination for Orders Tab
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSortBy, setOrderSortBy] = useState<"date_desc" | "date_asc" | "status" | "total_desc" | "total_asc">("date_desc");
  const [orderPage, setOrderPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  // Order editing caches
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrderFields, setEditingOrderFields] = useState({
    status: "",
    courierService: "",
    trackingNumber: ""
  });

  // Product CRUD interactive workspaces
  const [showProductForm, setShowProductForm] = useState<"none" | "create" | "edit">("none");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);

  // Master fabric product draft form state
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Cotton",
    slug: "",
    description: "",
    material: "",
    isNew: false,
    isFeatured: false,
    minOrder: 4,
    priceMin: 1200,
    priceMax: 1600,
    images: "",
    specifications: {
      threadCount: "120s Double-Ply",
      width: "54 Inches (Standard Suit)",
      weight: "145 GSM",
      composition: "100s Giza Cotton",
      dyeType: "Vat Dyed Premium White"
    },
    swatches: [
      { name: "Super White", color: "#FFFFFF" },
      { name: "Off-White", color: "#FDFCFA" }
    ]
  });

  // Temp swatch variables
  const [newSwatchName, setNewSwatchName] = useState("");
  const [newSwatchColor, setNewSwatchColor] = useState("#C5A880");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setAuthError("");
        sessionStorage.setItem("larson_manager_passcode", passcode.trim());
      } else {
        setAuthError(data.error || "Invalid access token. Showroom manager credentials required.");
      }
    } catch (err) {
      setAuthError("Failed to connect to the verification server.");
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${passcode}` };
      const [ordersRes, bespokeRes, inquiriesRes, productsRes, reviewsRes] = await Promise.all([
        fetch("/api/orders", { headers }).then((r) => { 
          if (r.status === 401) throw new Error("Unauthorized"); 
          return r.json(); 
        }),
        fetch("/api/bespoke", { headers }).then((r) => { 
          if (r.status === 401) throw new Error("Unauthorized"); 
          return r.json(); 
        }),
        fetch("/api/inquiries", { headers }).then((r) => { 
          if (r.status === 401) throw new Error("Unauthorized"); 
          return r.json(); 
        }),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/admin/reviews", { headers }).then((r) => {
          if (r.status === 401) throw new Error("Unauthorized");
          return r.json();
        }).catch(() => []) // Gracefully default to empty is server is starting up
      ]);

      setOrders(ordersRes || []);
      setBespoke(bespokeRes || []);
      setInquiries(inquiriesRes || []);
      setProducts(productsRes || []);
      setReviews(reviewsRes || []);
    } catch (err: any) {
      console.error("Failed to sync system databases:", err);
      if (err.message === "Unauthorized") {
        setAuthError("Session expired or token invalid. Please log in again.");
        setIsAuthenticated(false);
        sessionStorage.removeItem("larson_manager_passcode");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReview = async (id: string, status: "approved" | "rejected" | "pending") => {
    try {
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${passcode}` 
      };
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(prev => prev.map(r => r._id === id ? updated : r));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to moderate feedback status.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect with moderation service.");
    }
  };

  useEffect(() => {
    const savedPasscode = sessionStorage.getItem("larson_manager_passcode");
    if (savedPasscode) {
      setPasscode(savedPasscode);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && passcode) {
      fetchAllData();
    }
  }, [isAuthenticated, passcode]);

  // Order updates saving logic
  const startEditingOrder = (order: any) => {
    setEditingOrderId(order.id);
    setEditingOrderFields({
      status: order.status,
      courierService: order.courierService || "",
      trackingNumber: order.trackingNumber || ""
    });
  };

  const saveOrderUpdates = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${passcode}`
        },
        body: JSON.stringify(editingOrderFields)
      });

      if (!response.ok) {
        throw new Error("Unable to save order logistics updates.");
      }

      const updated = await response.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setEditingOrderId(null);
    } catch (err) {
      alert("Error saving updates. Please check backend connection.");
    }
  };

  // Product creation & edit triggers
  const handleAddNewProductClick = () => {
    setShowProductForm("create");
    setSelectedProductId(null);
    setProductError(null);
    setProductSuccess(null);
    setProductForm({
      name: "",
      category: "Cotton",
      slug: "",
      description: "",
      material: "",
      isNew: true,
      isFeatured: false,
      minOrder: 4,
      priceMin: 1200,
      priceMax: 1600,
      images: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800",
      specifications: {
        threadCount: "120s Double-Ply",
        width: "54 Inches (Standard Suit)",
        weight: "145 GSM",
        composition: "100s Giza Cotton",
        dyeType: "Vat Dyed Premium White"
      },
      swatches: [
        { name: "Super White", color: "#FFFFFF" },
        { name: "Creamy Ivory", color: "#FFF8EA" }
      ]
    });
  };

  const handleEditProductClick = (p: any) => {
    setShowProductForm("edit");
    setSelectedProductId(p._id);
    setProductError(null);
    setProductSuccess(null);
    setProductForm({
      name: p.name,
      category: p.category,
      slug: p.slug,
      description: p.description,
      material: p.material || "",
      isNew: p.isNew ?? false,
      isFeatured: p.isFeatured ?? false,
      minOrder: p.minOrder || 4,
      priceMin: p.priceRange?.min || 1000,
      priceMax: p.priceRange?.max || 2000,
      images: Array.isArray(p.images) ? p.images.join(", ") : p.images || "",
      specifications: {
        threadCount: p.specifications?.threadCount || "N/A",
        width: p.specifications?.width || "54 Inches",
        weight: p.specifications?.weight || "N/A",
        composition: p.specifications?.composition || "N/A",
        dyeType: p.specifications?.dyeType || "N/A"
      },
      swatches: p.swatches || []
    });
  };

  const handleNameChange = (val: string) => {
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    setProductForm((prev) => ({
      ...prev,
      name: val,
      slug: showProductForm === "create" ? slugified : prev.slug
    }));
  };

  const handleAddSwatch = () => {
    if (!newSwatchName.trim()) {
      alert("Please provide a name for this fabric swatch color shade.");
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      swatches: [...prev.swatches, { name: newSwatchName.trim(), color: newSwatchColor }]
    }));
    setNewSwatchName("");
  };

  const handleRemoveSwatch = (idx: number) => {
    setProductForm((prev) => ({
      ...prev,
      swatches: prev.swatches.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError(null);
    setProductSuccess(null);

    // Structural validations
    if (!productForm.name.trim() || !productForm.category.trim() || !productForm.slug.trim()) {
      setProductError("Sartorial brand name, category tab, and unique URL identifier are mandatory.");
      return;
    }

    const payload = {
      _id: selectedProductId || undefined,
      name: productForm.name.trim(),
      category: productForm.category,
      slug: productForm.slug.trim(),
      description: productForm.description.trim(),
      material: productForm.material.trim() || "Premium Weft Weave",
      isNew: productForm.isNew,
      isFeatured: productForm.isFeatured,
      minOrder: Number(productForm.minOrder) || 4,
      priceRange: {
        min: Number(productForm.priceMin),
        max: Number(productForm.priceMax)
      },
      images: productForm.images.split(",").map((url) => url.trim()).filter((url) => url.length > 0),
      specifications: productForm.specifications,
      swatches: productForm.swatches
    };

    try {
      const url = showProductForm === "create" ? "/api/products" : `/api/products/${selectedProductId}`;
      const method = showProductForm === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${passcode}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to synchronize product ledger.");
      }

      setProductSuccess(
        showProductForm === "create" 
          ? "Unstitched luxury fabric successfully added to catalogs!"
          : "Fabric attributes successfully synchronized in databases."
      );

      // Re-fetch database lists
      const prodRes = await fetch("/api/products").then((r) => r.json());
      setProducts(prodRes || []);

      setTimeout(() => {
        setShowProductForm("none");
        setSelectedProductId(null);
      }, 1000);

    } catch (err: any) {
      setProductError(err.message || "Failed to commit product variables. Check Atlas logs.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const proceed = window.confirm(`Are you absolutely sure you want to remove the fabric design "${name}" from your active looms catalog?`);
    if (!proceed) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${passcode}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete item.");
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
      alert(`"${name}" successfully archived from show panels.`);
    } catch (err: any) {
      alert(`Deletion failure: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-[#FBF9F6] text-navy flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-white border border-navy/15 p-8 rounded-sm shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="font-display text-4xl italic block text-[#0A1F5C]">Larson</span>
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold-dark block font-bold">
              Showroom Operations
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-body text-xs uppercase tracking-wider text-navy-mid mb-2 font-bold flex items-center gap-1.5 justify-center">
                <Lock className="w-3.5 h-3.5 text-gold-dark" /> Manager Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter showroom manager passcode"
                className="w-full px-4 py-3 font-body text-xs border border-navy/20 rounded-sm text-center focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white text-navy"
                required
              />
            </div>

            {authError && (
              <p className="text-red-600 font-body text-xs font-semibold text-center leading-relaxed">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-navy hover:bg-[#0A1F5C] text-white font-body font-bold uppercase tracking-widest text-xs rounded-sm transition-all cursor-pointer"
            >
              Verify & Unlock Files
            </button>
          </form>

          <p className="font-body text-[10px] text-navy-mid text-center leading-normal">
            Authorized store employees and showroom handlers only. Logs are kept securely for compliance.
          </p>
        </div>
      </div>
    );
  }

  // Calculated Metrics
  const totalMetersDispatched = orders
    .filter((o) => o.status !== "Order Placed")
    .reduce((acc, o) => acc + o.items.reduce((sum: number, it: any) => sum + (it.length * it.quantity), 0), 0);

  const totalBillingCod = orders
    .filter((o) => o.status !== "Order Placed")
    .reduce((acc, o) => acc + o.total, 0);

  // Derived filtered, sorted, paginated orders for Admin list view
  const filteredOrders = orders.filter((o) => {
    const term = orderSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (o.id || "").toLowerCase().includes(term) ||
      (o.customerName || "").toLowerCase().includes(term) ||
      (o.phone || "").toLowerCase().includes(term) ||
      (o.city || "").toLowerCase().includes(term)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (orderSortBy === "date_desc") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    if (orderSortBy === "date_asc") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    }
    if (orderSortBy === "status") {
      return (a.status || "").localeCompare(b.status || "");
    }
    if (orderSortBy === "total_desc") {
      return (b.total || 0) - (a.total || 0);
    }
    if (orderSortBy === "total_asc") {
      return (a.total || 0) - (b.total || 0);
    }
    return 0;
  });

  const totalFilteredCount = sortedOrders.length;
  const totalPages = Math.ceil(totalFilteredCount / ordersPerPage) || 1;
  const activeOrderPage = Math.min(orderPage, totalPages);
  const startIndex = (activeOrderPage - 1) * ordersPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + ordersPerPage);

  return (
    <div className="flex-1 bg-[#FBF9F6] text-navy font-body">
      {/* Top Admin banner bar */}
      <section className="bg-[#0A1F5C] text-white px-6 py-12 md:px-12 lg:px-20 border-b border-gold/20 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold font-bold block">
              Showroom Control Centre
            </span>
            <Heading level="h1" className="text-white italic text-2xl sm:text-3xl leading-none">
              Store Manager Desk
            </Heading>
            <p className="font-body text-xs text-white/70">
              Real-time synchronization with Azam Market looms and Leopards Logistics databases.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-4 py-2 border border-white/20 hover:border-gold text-white hover:text-gold rounded-sm text-xs font-semibold uppercase tracking-wider transition-all bg-white/5 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync Database
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Quick Strip */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-white border border-navy/10 rounded-sm shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-body text-[10px] text-navy-mid uppercase tracking-widest font-bold block">
                Total Bookings
              </span>
              <p className="font-mono text-xl font-bold text-navy">{orders.length}</p>
            </div>
            <Package className="w-8 h-8 text-gold-dark opacity-80" />
          </div>

          <div className="p-4 bg-white border border-navy/10 rounded-sm shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-body text-[10px] text-navy-mid uppercase tracking-widest font-bold block">
                Fabrics In Catalog
              </span>
              <p className="font-mono text-xl font-bold text-[#0A1F5C]">{products.length}</p>
            </div>
            <Layers className="w-8 h-8 text-navy opacity-80" />
          </div>

          <div className="p-4 bg-white border border-navy/10 rounded-sm shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-body text-[10px] text-navy-mid uppercase tracking-widest font-bold block">
                Logged Revenue
              </span>
              <p className="font-mono text-xl font-bold text-[#0A1F5C]">
                Rs. {totalBillingCod.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-700 opacity-80" />
          </div>

          <div className="p-4 bg-white border border-navy/10 rounded-sm shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-body text-[10px] text-navy-mid uppercase tracking-widest font-bold block">
                Direct Loom Cuts
              </span>
              <p className="font-mono text-xl font-bold text-navy">
                {totalMetersDispatched.toFixed(1)}m
              </p>
            </div>
            <Scissors className="w-8 h-8 text-gold-dark opacity-80" />
          </div>

          <div className="p-4 bg-white border border-navy/10 rounded-sm shadow-xs flex items-center justify-between opacity-95">
            <div className="space-y-1">
              <span className="font-body text-[10px] text-navy-mid uppercase tracking-widest font-bold block">
                Total Leads
              </span>
              <p className="font-mono text-xl font-bold text-navy">
                {bespoke.length + inquiries.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-[#0A1F5C] opacity-80" />
          </div>
        </div>
      </section>

      {/* Main UI body controls */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Navigation Sidebar Drawer */}
          <div className="w-full lg:w-64 bg-white border border-navy/10 p-4 rounded-sm flex flex-col md:flex-row lg:flex-col gap-2 overflow-x-auto select-none flex-shrink-0">
            <button
              onClick={() => { setActiveTab("orders"); setShowProductForm("none"); }}
              className={`flex-1 py-2 px-4 rounded-xs text-xs font-semibold tracking-wider uppercase transition-all text-left flex items-center gap-2 cursor-pointer ${
                activeTab === "orders" ? "bg-[#0A1F5C] text-white" : "hover:bg-neutral-100 text-navy-mid"
              }`}
            >
              <Package className="w-4 h-4 flex-shrink-0" /> Bolts Dispatch ({orders.length})
            </button>

            <button
              onClick={() => { setActiveTab("products"); setShowProductForm("none"); }}
              className={`flex-1 py-2 px-4 rounded-xs text-xs font-semibold tracking-wider uppercase transition-all text-left flex items-center gap-2 cursor-pointer ${
                activeTab === "products" ? "bg-[#0A1F5C] text-white" : "hover:bg-neutral-100 text-navy-mid"
              }`}
            >
              <Layers className="w-4 h-4 flex-shrink-0" /> Fabric Catalog ({products.length})
            </button>

            <button
              onClick={() => { setActiveTab("bespoke"); setShowProductForm("none"); }}
              className={`flex-1 py-2 px-4 rounded-xs text-xs font-semibold tracking-wider uppercase transition-all text-left flex items-center gap-2 cursor-pointer ${
                activeTab === "bespoke" ? "bg-[#0A1F5C] text-white" : "hover:bg-neutral-100 text-navy-mid"
              }`}
            >
              <Compass className="w-4 h-4 flex-shrink-0" /> Styling Consults ({bespoke.length})
            </button>

            <button
              onClick={() => { setActiveTab("inquiries"); setShowProductForm("none"); }}
              className={`flex-1 py-2 px-4 rounded-xs text-xs font-semibold tracking-wider uppercase transition-all text-left flex items-center gap-2 cursor-pointer ${
                activeTab === "inquiries" ? "bg-[#0A1F5C] text-white" : "hover:bg-neutral-100 text-navy-mid"
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" /> Swatch Inquiries ({inquiries.length})
            </button>

            <button
              onClick={() => { setActiveTab("reviews"); setShowProductForm("none"); }}
              className={`flex-1 py-2 px-4 rounded-xs text-xs font-semibold tracking-wider uppercase transition-all text-left flex items-center gap-2 cursor-pointer ${
                activeTab === "reviews" ? "bg-[#0A1F5C] text-white" : "hover:bg-neutral-100 text-navy-mid"
              }`}
            >
              <Star className="w-4 h-4 flex-shrink-0" /> Reviews Moderation ({reviews.length})
            </button>
          </div>

          {/* Records Display Board (Table Containers) */}
          <div className="flex-1 w-full bg-white border border-navy/10 rounded-sm shadow-xs overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-gold-dark border-t-transparent animate-spin" />
                <p className="font-body text-xs uppercase tracking-widest text-navy-mid">Refreshing registers...</p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                
                {/* TAB 1: ORDERS SECTION */}
                {activeTab === "orders" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-navy/5 gap-2">
                      <div>
                        <Heading level="h3" className="text-navy text-sm uppercase tracking-wider font-bold">Unstitched Bolt Orders</Heading>
                        <p className="text-[10px] text-navy-mid/70 leading-none mt-0.5">Filter, search, sort, and slice through order records</p>
                      </div>
                      <span className="font-mono text-[10px] text-navy/40">Total: {orders.length} orders · Filtered: {totalFilteredCount}</span>
                    </div>

                    {/* Search & Sort bar */}
                    <div className="flex flex-col md:flex-row gap-3 pb-2 border-b border-navy/5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={(e) => {
                            setOrderSearch(e.target.value);
                            setOrderPage(1);
                          }}
                          placeholder="Search details (Ref, Name, Phone, City)..."
                          className="w-full px-4 py-2 pl-9 font-body text-xs border border-navy/15 rounded-sm bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold focus:border-transparent transition-all"
                        />
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-navy-mid/60" />
                        {orderSearch && (
                          <button
                            onClick={() => { setOrderSearch(""); setOrderPage(1); }}
                            className="absolute right-3 top-2.5 font-body text-[10px] font-bold text-navy-mid hover:text-navy cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-body text-xs text-navy/60 font-medium whitespace-nowrap">Sort By:</span>
                        <select
                          value={orderSortBy}
                          onChange={(e) => {
                            setOrderSortBy(e.target.value as any);
                            setOrderPage(1);
                          }}
                          className="px-3 py-1.5 border border-navy/15 rounded-sm bg-white text-navy font-body text-xs focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
                        >
                          <option value="date_desc">Date: Newest First</option>
                          <option value="date_asc">Date: Oldest First</option>
                          <option value="status">Status (A-Z)</option>
                          <option value="total_desc">Value: High to Low</option>
                          <option value="total_asc">Value: Low to High</option>
                        </select>
                        <span className="font-body text-xs text-navy/60 font-medium whitespace-nowrap ml-2">Show:</span>
                        <select
                          value={ordersPerPage}
                          onChange={(e) => {
                            setOrdersPerPage(Number(e.target.value));
                            setOrderPage(1);
                          }}
                          className="px-2 py-1.5 border border-navy/15 rounded-sm bg-white text-navy font-body text-xs focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>

                    {totalFilteredCount === 0 ? (
                      <div className="p-12 text-center bg-neutral-50/50 rounded-sm border border-navy/5">
                        <Package className="w-8 h-8 text-navy-mid/40 mx-auto mb-2" />
                        <p className="font-body text-xs text-navy-mid text-center">No orders matched your search query or database is empty.</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-body text-xs min-w-[700px]">
                            <thead>
                              <tr className="bg-neutral-50 font-bold uppercase tracking-wider text-[10px] text-navy/60 border-b border-navy/10">
                                <th className="py-2 px-3">Order Ref</th>
                                <th className="py-2 px-3">Recipient / City</th>
                                <th className="py-2 px-3">Fabric lines</th>
                                <th className="py-2 px-3 text-right">Cost (COD)</th>
                                <th className="py-2 px-3 text-center">Dispatch Status</th>
                                <th className="py-2 px-3 text-right">Operations</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedOrders.map((o) => (
                                <tr key={o.id} className="border-b border-navy/5 hover:bg-neutral-50/50">
                                  <td className="py-3 px-3 font-mono font-bold text-gold-dark">{o.id}</td>
                                  <td className="py-3 px-3">
                                    <p className="font-sans font-bold text-navy">{o.customerName}</p>
                                    <p className="text-[10px] text-navy/60 leading-none mt-1">{o.phone} · {o.city}</p>
                                  </td>
                                  <td className="py-3 px-3">
                                    {o.items.map((it: any, i: number) => (
                                      <p key={i} className="text-navy leading-normal text-[11px]">
                                        {it.quantity}x {it.productName} ({it.length}m - {it.swatchName})
                                      </p>
                                    ))}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono font-bold text-navy-dark">
                                    Rs. {o.total.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    {editingOrderId === o.id ? (
                                      <div className="space-y-1.5 inline-block text-left p-1 bg-gold/10 border border-gold/20 rounded-xs">
                                        <select
                                          value={editingOrderFields.status}
                                          onChange={(e) => setEditingOrderFields((p) => ({ ...p, status: e.target.value }))}
                                          className="w-full p-1 bg-white border border-navy/20 rounded-xs text-[10px] font-semibold text-navy focus:outline-none"
                                        >
                                          <option value="Order Placed">Order Placed</option>
                                          <option value="Fabric Cutting">Fabric Cutting</option>
                                          <option value="Quality Check">Quality Check</option>
                                          <option value="Signature Packaging">Signature Packaging</option>
                                          <option value="Dispatched">Dispatched</option>
                                          <option value="Delivered">Delivered</option>
                                        </select>
                                        <input
                                          type="text"
                                          placeholder="Carrier Service"
                                          value={editingOrderFields.courierService}
                                          onChange={(e) => setEditingOrderFields((p) => ({ ...p, courierService: e.target.value }))}
                                          className="w-full px-1.5 py-0.5 border border-navy/20 bg-white text-[10px] rounded-xs text-navy"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Tracking AW Bill"
                                          value={editingOrderFields.trackingNumber}
                                          onChange={(e) => setEditingOrderFields((p) => ({ ...p, trackingNumber: e.target.value }))}
                                          className="w-full px-1.5 py-0.5 border border-navy/20 bg-white text-[10px] rounded-xs text-navy"
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <Badge variant={o.status === "Delivered" ? "navy" : "gold"}>{o.status}</Badge>
                                        {o.trackingNumber && (
                                          <p className="text-[9px] font-mono text-navy/50 leading-none">
                                            {o.courierService}: {o.trackingNumber}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    {editingOrderId === o.id ? (
                                      <button
                                        onClick={() => saveOrderUpdates(o.id)}
                                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-xs text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-0.5 animate-pulse"
                                      >
                                        <Check className="w-3 h-3" /> Save
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => startEditingOrder(o)}
                                        className="px-2.5 py-1 border border-navy/20 hover:border-gold hover:text-gold-dark rounded-xs text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                      >
                                        Edit Dispatch
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Section controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-navy/5 gap-3">
                          <span className="font-body text-xs text-navy-mid">
                            Showing <strong className="text-navy">{startIndex + 1}</strong> to{" "}
                            <strong className="text-navy">{Math.min(startIndex + ordersPerPage, totalFilteredCount)}</strong> of{" "}
                            <strong className="text-navy">{totalFilteredCount}</strong> filtered orders
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                              disabled={activeOrderPage === 1}
                              className="p-1 px-2.5 border border-navy/10 rounded-sm hover:border-gold text-navy disabled:opacity-40 disabled:hover:border-navy/10 disabled:cursor-not-allowed text-xs transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" /> Prev
                            </button>
                            <span className="font-body text-xs text-navy-mid px-2">
                              Page <strong className="text-navy">{activeOrderPage}</strong> of <strong className="text-navy">{totalPages}</strong>
                            </span>
                            <button
                              onClick={() => setOrderPage((p) => Math.min(totalPages, p + 1))}
                              disabled={activeOrderPage === totalPages}
                              className="p-1 px-2.5 border border-navy/10 rounded-sm hover:border-gold text-navy disabled:opacity-40 disabled:hover:border-navy/10 disabled:cursor-not-allowed text-xs transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              Next <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 2: PRODUCTS CATALOGUE PIM (NEW BRAND CAPABILITY) */}
                {activeTab === "products" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-navy/10 gap-4">
                      <div>
                        <Heading level="h3" className="text-navy text-sm uppercase tracking-wider font-bold">Unstitched Fabrics Catalog</Heading>
                        <p className="text-[11px] text-navy-mid">Set seasonal collections, prices, fabric specifications, and custom color palette bolts.</p>
                      </div>
                      
                      {showProductForm === "none" && (
                        <button
                          onClick={handleAddNewProductClick}
                          className="px-4 py-2 bg-[#0A1F5C] hover:bg-gold hover:text-navy text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add New Weave Design
                        </button>
                      )}
                    </div>

                    {/* PRODUCT WORKSPACE DRAFT FORM (INLINE CRUDS) */}
                    {showProductForm !== "none" && (
                      <div className="bg-[#FAF8F5] border border-gold/30 p-6 rounded-xs gap-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-navy/10 pb-3">
                          <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-[#0A1F5C] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-gold-dark" />
                            {showProductForm === "create" ? "Weave Draft Studio (Add Product)" : `Revise Weave Catalog: #${selectedProductId}`}
                          </h4>
                          <button
                            onClick={() => setShowProductForm("none")}
                            className="p-1 hover:bg-neutral-200 text-navy rounded-full transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveProductForm} className="space-y-6 font-body text-xs text-navy">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Product Name */}
                            <div>
                              <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1.5">Fabric Design Name</label>
                              <input
                                type="text"
                                required
                                placeholder="eg. Pure Handspun Karandi"
                                value={productForm.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className="w-full p-2.5 bg-white border border-navy/20 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                              />
                            </div>

                            {/* Category selector */}
                            <div>
                              <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1.5">Fabric Collection Tab</label>
                              <select
                                value={productForm.category}
                                onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                                className="w-full p-2.5 bg-white border border-navy/20 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                              >
                                <option value="Cotton">Cotton (Classic Latha/Khadar)</option>
                                <option value="Boski">Boski (Spun Mulberry Silk)</option>
                                <option value="Wash & Wear">Wash & Wear (Easy-care Polyviscose)</option>
                                <option value="Karandi">Karandi (Premium Slub-spun)</option>
                                <option value="Winter Wool">Winter Wool (Cashmere/Merino blends)</option>
                              </select>
                            </div>

                            {/* URL Slug */}
                            <div>
                              <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1.5">URL Slug Segment</label>
                              <input
                                type="text"
                                required
                                value={productForm.slug}
                                onChange={(e) => setProductForm((p) => ({ ...p, slug: e.target.value }))}
                                className="w-full p-2.5 bg-white border border-navy/20 rounded-xs font-mono text-[10px] focus:ring-1 focus:ring-gold focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Materials specifications */}
                            <div className="md:col-span-2">
                              <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1.5">Material Composition Label</label>
                              <input
                                type="text"
                                placeholder="eg. 100% long-staple cotton wefts"
                                value={productForm.material}
                                onChange={(e) => setProductForm((p) => ({ ...p, material: e.target.value }))}
                                className="w-full p-2.5 bg-white border border-navy/20 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                              />
                            </div>

                            {/* Price range min */}
                            <div>
                              <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1.5">Minimum Price (Rs. per meter)</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={productForm.priceMin || ""}
                                onChange={(e) => setProductForm((p) => ({ ...p, priceMin: Number(e.target.value) }))}
                                className="w-full p-2.5 bg-white border border-navy/20 rounded-xs font-mono focus:ring-1 focus:ring-gold"
                              />
                            </div>

                            {/* Price range max */}
                            <div>
                              <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1.5">Maximum Price (Rs. per meter)</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={productForm.priceMax || ""}
                                onChange={(e) => setProductForm((p) => ({ ...p, priceMax: Number(e.target.value) }))}
                                className="w-full p-2.5 bg-white border border-navy/20 rounded-xs font-mono focus:ring-1 focus:ring-gold"
                              />
                            </div>
                          </div>

                          {/* Image URLs */}
                          <div className="space-y-2">
                            <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1">Image Asset URLs (Unsplash or direct absolute link, comma-separated)</label>
                            <input
                              type="text"
                              value={productForm.images}
                              onChange={(e) => setProductForm((p) => ({ ...p, images: e.target.value }))}
                              className="w-full p-2.5 bg-white border border-navy/20 rounded-xs font-mono text-[10px] focus:ring-1 focus:ring-gold"
                              placeholder="https://images.unsplash.com/..."
                            />
                            
                            {/* Premium File Uploader */}
                            <div className="bg-neutral-50 border border-dashed border-navy/15 rounded-xs p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="text-left space-y-0.5">
                                <p className="font-bold text-[10px] uppercase font-sans tracking-tight text-navy">Direct Image Upload to Cloudinary</p>
                                <p className="text-[9px] text-navy-mid">Choose an image from your device to automatically compile and generate absolute CDN links.</p>
                              </div>
                              
                              <label className="flex-shrink-0 cursor-pointer text-center">
                                <span className="inline-block bg-[#0A1F5C] hover:bg-navy text-white text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors select-none">
                                  {isUploadingProductImg ? "Uploading to Cloud..." : "Upload local asset"}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingProductImg}
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    
                                    if (file.size > 2 * 1024 * 1024) {
                                      alert("Maximum image upload size limit is 2MB.");
                                      return;
                                    }
                                    
                                    setIsUploadingProductImg(true);
                                    const fileReader = new FileReader();
                                    fileReader.onloadend = async () => {
                                      try {
                                        const res = await fetch("/api/reviews/upload", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ image: fileReader.result as string })
                                        });
                                        if (res.ok) {
                                          const data = await res.json();
                                          const currentImages = productForm.images ? productForm.images.trim() : "";
                                          const finalImages = currentImages ? `${currentImages}, ${data.url}` : data.url;
                                          setProductForm((prev) => ({ ...prev, images: finalImages }));
                                        } else {
                                          const err = await res.json();
                                          alert(err.error || "Failed to process image upload.");
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert("Connection failure during image upload.");
                                      } finally {
                                        setIsUploadingProductImg(false);
                                      }
                                    };
                                    fileReader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Catalog Badges */}
                          <div className="flex gap-6 select-none bg-white p-3 border border-navy/10 rounded-xs">
                            <label className="flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider text-[10px]">
                              <input
                                type="checkbox"
                                checked={productForm.isNew}
                                onChange={(e) => setProductForm((p) => ({ ...p, isNew: e.target.checked }))}
                                className="accent-[#0A1F5C] w-4 h-4 cursor-pointer"
                              />
                              Show "New Arrival" Tag
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider text-[10px]">
                              <input
                                type="checkbox"
                                checked={productForm.isFeatured}
                                onChange={(e) => setProductForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                                className="accent-[#0A1F5C] w-4 h-4 cursor-pointer"
                              />
                              Show Featured Block (Homepage)
                            </label>

                            <div className="flex items-center gap-2 ml-auto">
                              <span className="font-bold text-[10px] uppercase tracking-wider">Min Cut Bolt Length:</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={productForm.minOrder}
                                onChange={(e) => setProductForm((p) => ({ ...p, minOrder: Number(e.target.value) }))}
                                className="w-12 text-center border border-navy/20 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gold py-1 rounded-sm text-navy font-bold"
                              />
                              <span className="text-[10px] uppercase text-navy-mid">meters</span>
                            </div>
                          </div>

                          {/* FABRIC ATTRIBUTES & SPECIFICATIONS PANEL */}
                          <div className="space-y-3">
                            <h5 className="font-sans font-bold uppercase tracking-wider text-[10px] text-gold-dark border-b border-navy/5 pb-1">Fabric Quality Specifications</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-navy-mid mb-1">Thread Count / Ply</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 120s Double-Ply"
                                  value={productForm.specifications.threadCount}
                                  onChange={(e) => setProductForm((p) => ({
                                    ...p,
                                    specifications: { ...p.specifications, threadCount: e.target.value }
                                  }))}
                                  className="w-full p-2 bg-white border border-navy/20 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-navy-mid mb-1">Standard Cut Width</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 54 Inches"
                                  value={productForm.specifications.width}
                                  onChange={(e) => setProductForm((p) => ({
                                    ...p,
                                    specifications: { ...p.specifications, width: e.target.value }
                                  }))}
                                  className="w-full p-2 bg-white border border-navy/20 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-navy-mid mb-1">Weight (GSM)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 145 GSM"
                                  value={productForm.specifications.weight}
                                  onChange={(e) => setProductForm((p) => ({
                                    ...p,
                                    specifications: { ...p.specifications, weight: e.target.value }
                                  }))}
                                  className="w-full p-2 bg-white border border-navy/10 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-navy-mid mb-1">Loom Composition</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 100% Mulberry Spun Silk"
                                  value={productForm.specifications.composition}
                                  onChange={(e) => setProductForm((p) => ({
                                    ...p,
                                    specifications: { ...p.specifications, composition: e.target.value }
                                  }))}
                                  className="w-full p-2 bg-white border border-navy/10 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase font-bold text-navy-mid mb-1">Dye Finishing Process</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Vat Dyed"
                                  value={productForm.specifications.dyeType}
                                  onChange={(e) => setProductForm((p) => ({
                                    ...p,
                                    specifications: { ...p.specifications, dyeType: e.target.value }
                                  }))}
                                  className="w-full p-2 bg-white border border-navy/10 rounded-xs focus:ring-1 focus:ring-gold focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* INTERACTIVE COLOR SWATCH PALETTES BUILDER (Sapphire Standard) */}
                          <div className="space-y-3 bg-[#FCFAF7] border border-gold/15 p-4 rounded-sm">
                            <h5 className="font-sans font-bold uppercase tracking-wider text-[10px] text-gold-dark flex items-center justify-between">
                              <span>Weave Bolt Color Swatches Palette</span>
                              <span className="font-mono text-[9px] text-[#0A1F5C] font-semibold">{productForm.swatches.length} active shades</span>
                            </h5>

                            {/* Color items list */}
                            {productForm.swatches.length === 0 ? (
                              <p className="text-[10px] italic text-navy/40">No color shade blocks configured. Unstitched cloth is sold in standard ivory white by default.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2 py-1 select-none">
                                {productForm.swatches.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 p-1 px-2.5 bg-white border border-navy/10 rounded-full shadow-2xs font-semibold text-[10px]">
                                    <span
                                      className="inline-block w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span>{item.name}</span>
                                    <span className="text-gray-400 font-mono">({item.color})</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSwatch(idx)}
                                      className="ml-1 text-red-500 hover:text-red-700 cursor-pointer text-[12px] font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Swatch shade controller */}
                            <div className="flex items-end gap-3 pt-2">
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-navy-mid mb-1">Shade Color Name</label>
                                <input
                                  type="text"
                                  value={newSwatchName}
                                  onChange={(e) => setNewSwatchName(e.target.value)}
                                  placeholder="e.g. Emerald Forest"
                                  className="p-2 bg-white border border-navy/20 rounded-xs text-[10px] focus:outline-none focus:ring-1 focus:ring-gold"
                                />
                              </div>

                              <div>
                                <label className="block text-[8px] uppercase font-bold text-navy-mid mb-1">Color Picker / Hex Code</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={newSwatchColor}
                                    onChange={(e) => setNewSwatchColor(e.target.value)}
                                    className="w-8 h-8 rounded-sm cursor-pointer p-0 bg-transparent border-0"
                                  />
                                  <input
                                    type="text"
                                    value={newSwatchColor}
                                    onChange={(e) => setNewSwatchColor(e.target.value)}
                                    placeholder="# Hex"
                                    className="p-2 bg-white border border-navy/20 rounded-xs text-[10px] font-mono w-20 text-center focus:outline-none"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleAddSwatch}
                                className="px-4 py-2 bg-navy hover:bg-gold hover:text-navy text-white text-[10px] font-bold uppercase tracking-widest rounded-xs cursor-pointer transition-all flex items-center gap-1.5"
                              >
                                <PlusCircle className="w-3.5 h-3.5" /> Bind Color
                              </button>
                            </div>
                          </div>

                          {/* Form Description */}
                          <div>
                            <label className="block uppercase tracking-wider font-bold text-[10px] text-navy-mid mb-1.5">Sartorial Narrative Description (Sapphire Heritage Copy)</label>
                            <textarea
                              rows={3}
                              value={productForm.description}
                              onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                              placeholder="Describe the weave density, comfort profile, appropriate celebratory occasions, styling advice, and heritage attributes elegantly..."
                              className="w-full p-2.5 bg-white border border-navy/20 rounded-xs leading-relaxed focus:ring-1 focus:ring-gold"
                            />
                          </div>

                          {/* Response banners */}
                          {productError && (
                            <p className="p-3 bg-red-50 text-red-600 font-bold rounded-xs leading-relaxed border-l-2 border-red-500">
                              {productError}
                            </p>
                          )}
                          {productSuccess && (
                            <p className="p-3 bg-green-50 text-green-700 font-bold rounded-xs leading-relaxed border-l-2 border-green-600">
                              {productSuccess}
                            </p>
                          )}

                          {/* Trigger actions */}
                          <div className="flex gap-2 justify-end border-t border-navy/10 pt-4">
                            <button
                              type="button"
                              onClick={() => setShowProductForm("none")}
                              className="px-4 py-2.5 border border-navy/25 text-navy hover:bg-neutral-100 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-[#0A1F5C] hover:bg-gold hover:text-navy text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <Check className="w-4 h-4" /> Save Weave Product
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* DYNAMIC PRODUCTS REGISTER VIEW PANEL (Sapphire Grid) */}
                    {showProductForm === "none" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {products.map((p) => {
                          const displayImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800";
                          const maxPrice = p.priceRange?.max || p.priceRange?.min || 1500;
                          return (
                            <div key={p._id} className="bg-white border border-navy/10 rounded-sm hover:border-[#0A1F5C] transition-all overflow-hidden flex flex-col justify-between group">
                              <div className="relative aspect-video w-full bg-neutral-100 overflow-hidden flex-shrink-0">
                                <img
                                  src={displayImg}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-2 left-2 bg-[#0A1F5C] text-white px-2 py-0.5 rounded-sm uppercase font-mono text-[9px] font-bold tracking-widest leading-none">
                                  {p.category}
                                </span>
                                {p.isNew && (
                                  <span className="absolute top-2 right-2 bg-gold text-navy font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono text-[9px] leading-none">
                                    New In Weave
                                  </span>
                                )}
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-sans font-bold text-sm text-navy uppercase tracking-tight leading-snug">{p.name}</h4>
                                    <span className="font-mono text-gold-dark font-extrabold text-xs flex-shrink-0">
                                      Rs.{p.priceRange?.min} - {maxPrice}
                                    </span>
                                  </div>
                                  <p className="font-body text-[10px] text-navy-mid leading-relaxed italic line-clamp-2">{p.description}</p>
                                </div>

                                <div className="border-t border-navy/5 pt-3 space-y-1.5">
                                  <div className="grid grid-cols-2 gap-x-2 text-[10px]">
                                    <p className="text-navy-mid">Thread Count: <strong className="text-navy font-semibold">{p.specifications?.threadCount || "N/A"}</strong></p>
                                    <p className="text-navy-mid">Width: <strong className="text-navy font-semibold">{p.specifications?.width || "54\""}</strong></p>
                                  </div>

                                  {/* Swatches display inside list */}
                                  {p.swatches && p.swatches.length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center pt-1.5 select-none hover:opacity-100 transition-opacity">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-navy/40 mr-1">Shades:</span>
                                      {p.swatches.map((s: any, idx: number) => (
                                        <span
                                          key={idx}
                                          title={s.name}
                                          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shadow-3xs"
                                          style={{ backgroundColor: s.color }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 pt-2 border-t border-navy/5 select-none">
                                  <a
                                    href={`/collections/${p.slug}`}
                                    className="px-2.5 py-1.5 text-navy hover:text-gold-dark border border-navy/15 rounded-xs hover:border-gold-dark text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1"
                                    title="Inspect Client Listing"
                                  >
                                    <Eye className="w-3 h-3" /> View Site
                                  </a>

                                  <button
                                    onClick={() => handleEditProductClick(p)}
                                    className="px-2.5 py-1.5 hover:bg-gold hover:text-navy hover:border-gold text-navy border border-navy/15 rounded-xs text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1 ml-auto cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" /> Attributes
                                  </button>

                                  <button
                                    onClick={() => handleDeleteProduct(p._id, p.name)}
                                    className="p-1.5 hover:bg-red-50 text-red-500 border border-transparent rounded-xs cursor-pointer transition-all inline-flex items-center"
                                    title="Archive Product"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CONSULTATIONS SECTION */}
                {activeTab === "bespoke" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-navy/5">
                      <Heading level="h3" className="text-navy text-sm uppercase tracking-wider font-bold">Showroom Consults</Heading>
                      <span className="font-mono text-[10px] text-navy/40">Total: {bespoke.length} in database</span>
                    </div>

                    {bespoke.length === 0 ? (
                      <p className="p-10 font-body text-xs text-navy-mid text-center">No bespoke styling consults registered on server DB.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-body text-xs min-w-[700px]">
                          <thead>
                            <tr className="bg-neutral-50 font-bold uppercase tracking-wider text-[10px] text-navy/60 border-b border-navy/10">
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Client</th>
                              <th className="py-2 px-3">Suit Length Pref</th>
                              <th className="py-2 px-3">Fabrics of Interest</th>
                              <th className="py-2 px-3">Technical / Styling Comments</th>
                              <th className="py-2 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bespoke.map((b) => (
                              <tr key={b.id} className="border-b border-navy/5 hover:bg-neutral-50/50">
                                <td className="py-3 px-3 font-mono text-[10px] text-navy/50">
                                  {new Date(b.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-3">
                                  <p className="font-sans font-bold text-navy">{b.customerName}</p>
                                  <p className="text-[10px] text-navy/60 mt-0.5">{b.phone}</p>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-sans bg-gray-100 text-navy-mid text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                    {b.suitLengthPref}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  {b.fabricTypesOfInterest && b.fabricTypesOfInterest.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {b.fabricTypesOfInterest.map((f: string) => (
                                        <span key={f} className="bg-gold/15 text-gold-dark text-[9px] px-1.5 py-0.5 font-bold rounded-xs">
                                          {f}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Not specified</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-navy-mid italic max-w-xs truncate" title={b.customRequirementMsg}>
                                  {b.customRequirementMsg || "No matching custom requests"}
                                </td>
                                <td className="py-3 px-3 text-right text-nowrap">
                                  <a
                                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-xs text-[10px] font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" /> WhatsApp
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: SWATCH INQUIRIES SECTION */}
                {activeTab === "inquiries" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-navy/5">
                      <Heading level="h3" className="text-navy text-sm uppercase tracking-wider font-bold">Swatch Detail Queries</Heading>
                      <span className="font-mono text-[10px] text-navy/40">Total: {inquiries.length} in database</span>
                    </div>

                    {inquiries.length === 0 ? (
                      <p className="p-10 font-body text-xs text-navy-mid text-center">No catalog detail inquiries returned from database.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-body text-xs min-w-[700px]">
                          <thead>
                            <tr className="bg-neutral-50 font-bold uppercase tracking-wider text-[10px] text-navy/60 border-b border-navy/10">
                              <th className="py-2 px-3">Query ID</th>
                              <th className="py-2 px-3">Inquirer</th>
                              <th className="py-2 px-3">Product Reference</th>
                              <th className="py-2 px-3 text-center">Meters specification</th>
                              <th className="py-2 px-3">Comment / Query details</th>
                              <th className="py-2 px-3 text-right">Initiated At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inquiries.map((inq) => (
                              <tr key={inq.id} className="border-b border-navy/5 hover:bg-neutral-50/50">
                                <td className="py-3 px-3 font-mono font-bold text-gold-dark">{inq.id}</td>
                                <td className="py-3 px-3">
                                  <p className="font-sans font-bold text-navy">{inq.name}</p>
                                  <p className="text-[10px] text-navy-mid font-semibold">{inq.phone}</p>
                                </td>
                                <td className="py-3 px-3 font-sans font-semibold text-navy">
                                  {inq.productName} (ID: {inq.productId})
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-bold">
                                  {inq.quantity} meters
                                </td>
                                <td className="py-3 px-3 text-navy-mid italic max-w-sm truncate" title={inq.message}>
                                  {inq.message || "Generic details"}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-[10px] text-navy/40 text-nowrap">
                                  {new Date(inq.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: REVIEWS MODERATION SECTION */}
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-navy/5">
                      <Heading level="h3" className="text-navy text-sm uppercase tracking-wider font-bold">Product Review Moderations</Heading>
                      <span className="font-mono text-[10px] text-navy/40">Total: {reviews.length} reviews</span>
                    </div>

                    {reviews.length === 0 ? (
                      <p className="p-10 font-body text-xs text-navy-mid text-center">No fabric reviews in database.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-body text-xs min-w-[700px]">
                          <thead>
                            <tr className="bg-neutral-50 font-bold uppercase tracking-wider text-[10px] text-navy/60 border-b border-navy/10">
                              <th className="py-2 px-3">Fabric Weave</th>
                              <th className="py-2 px-3">Inquirer / Author</th>
                              <th className="py-2 px-3">Score rating</th>
                              <th className="py-2 px-3">Review feedback content</th>
                              <th className="py-2 px-3">Image attached</th>
                              <th className="py-2 px-3 text-center">Moderation status</th>
                              <th className="py-2 px-3 text-right">Moderations</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviews.map((rev) => (
                              <tr key={rev._id} className="border-b border-navy/5 hover:bg-neutral-50/50">
                                <td className="py-3 px-3 font-sans font-semibold text-navy">
                                  {rev.productName}
                                  <p className="text-[9px] font-mono text-navy-mid capitalize">ID: {rev.productId}</p>
                                </td>
                                <td className="py-3 px-3">
                                  <p className="font-sans font-bold text-navy">
                                    {rev.isAnonymous ? `${rev.displayName} (Incognito)` : rev.displayName}
                                  </p>
                                  <p className="text-[10px] text-navy-mid">{rev.email}</p>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex text-gold">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3 h-3 fill-current ${s <= rev.rating ? "text-gold" : "text-neutral-200"}`}
                                      />
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-navy-mid italic max-w-xs break-words font-body" title={rev.content}>
                                  "{rev.content}"
                                </td>
                                <td className="py-3 px-3">
                                  {rev.imageUrl ? (
                                    <a href={rev.imageUrl} target="_blank" rel="noopener noreferrer" className="relative block w-10 h-12 bg-neutral-100 rounded-xs overflow-hidden border border-navy/15 hover:border-gold transition-all select-none">
                                      <img src={rev.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    </a>
                                  ) : (
                                    <span className="text-navy-mid opacity-40 font-mono text-[9px]">- none -</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <Badge variant={rev.status === "approved" ? "gold" : rev.status === "rejected" ? "outline" : "navy"} size="sm">
                                    {rev.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                                  {rev.status !== "approved" && (
                                    <button
                                      onClick={() => handleModerateReview(rev._id, "approved")}
                                      className="px-2 py-1 bg-green-700 hover:bg-green-800 text-white font-body font-bold text-[9px] uppercase tracking-wider rounded-xs cursor-pointer transition-all"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {rev.status !== "rejected" && (
                                    <button
                                      onClick={() => handleModerateReview(rev._id, "rejected")}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-body font-bold text-[9px] uppercase tracking-wider rounded-xs cursor-pointer transition-all"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </section>

      {/* Trust reassurance strip */}
      <section className="bg-white border-t border-navy/10 py-8 select-none">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-navy-mid space-y-1.5">
          <p className="font-bold flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-navy" /> Secure Mill Operations Hub
          </p>
          <p>
            Larson Lahori Operations Console. Real-time encryption active · Confirmed unstitched fabrics only.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Manager;
