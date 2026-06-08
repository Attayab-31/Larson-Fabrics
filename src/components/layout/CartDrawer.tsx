import { useState, useRef, useEffect } from "react";
import { useCart } from "@/src/lib/cart";
import { useTransition } from "@/src/components/layout";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Send, CheckCircle } from "lucide-react";

const PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Sialkot",
  "Gujranwala",
  "Quetta",
  "Hyderabad",
  "Sargodha",
  "Bahawalpur"
];

export function CartDrawer() {
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    updateLength,
    cartCount,
    cartSubtotal,
    placeOrder
  } = useCart();

  const { navigate } = useTransition();

  // "cart" | "shipping" | "success"
  const [step, setStep] = useState<"cart" | "shipping" | "success">("cart");
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Lahore",
    shippingMethod: "Standard",
    paymentMethod: "Cash on Delivery",
  });

  const wrapperRef = useRef<HTMLDialogElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // High performance GSAP animation controller for drawer backdrop slide and content revealing
  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const backdrop = backdropRef.current;
      const container = containerRef.current;
      if (!wrapper || !backdrop || !container) return;

      if (cartOpen) {
        previousActiveElementRef.current = document.activeElement as HTMLElement;
        if (!wrapper.open) {
          wrapper.showModal();
        }

        // Kill active tweens to prevent visual jittering on rapid clicks
        gsap.killTweensOf([wrapper, backdrop, container]);

        // Enable wrapper in DOM
        gsap.set(wrapper, { display: "block", pointerEvents: "auto" });

        // Fade state of Backdrop
        gsap.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 0.5, duration: 0.35, ease: "power2.out" }
        );

        // Slide drawer body in from the right pane (100% margin to 0 border limits)
        gsap.fromTo(
          container,
          { x: "100%" },
          { x: "0%", duration: 0.45, ease: "power2.out" }
        );
      } else {
        // Safe kill active tweens
        gsap.killTweensOf([wrapper, backdrop, container]);
        gsap.set(wrapper, { pointerEvents: "none" });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(wrapper, { display: "none" });
            if (wrapper.open) {
              wrapper.close();
            }
            if (previousActiveElementRef.current) {
              previousActiveElementRef.current.focus();
              previousActiveElementRef.current = null;
            }
          },
        });

        // Retract backdrop alpha
        tl.to(
          backdrop,
          { opacity: 0, duration: 0.3, ease: "power2.in" },
          0
        );

        // Slide drawer out to right boundaries
        tl.to(
          container,
          { x: "100%", duration: 0.35, ease: "power2.in" },
          0
        );
      }
    },
    { dependencies: [cartOpen] }
  );

  // Handle native ESC modal close event and map to react onClose state callback
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      handleClose();
    };

    el.addEventListener("cancel", handleCancel);
    return () => {
      el.removeEventListener("cancel", handleCancel);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (checkoutMethod: "website" | "whatsapp") => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Please fill in your name, phone and shipping address.");
      return;
    }
    try {
      setIsPending(true);
      const order = await placeOrder(customerInfo, checkoutMethod);
      setPlacedOrderId(order.id);
      setStep("success");
    } catch (err: any) {
      alert(err.message || "Failed to process order. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  // Synch reset ensures no visual jump and absolutely clean starting steps upon quick reopen
  const handleClose = () => {
    setCartOpen(false);
    setStep("cart");
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      city: "Lahore",
      shippingMethod: "Standard",
      paymentMethod: "Cash on Delivery",
    });
  };

  return (
    <dialog
      ref={wrapperRef}
      className="fixed inset-0 z-50 text-navy select-none bg-transparent border-0 outline-none p-0 overflow-visible max-w-none max-h-none h-full w-full backdrop:bg-transparent"
      style={{ display: "none", pointerEvents: "none" }}
    >
      {/* Backdrop overlay background */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer opacity-0"
      />

      {/* Slideout master panel body */}
      <div
        ref={containerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white text-navy flex flex-col shadow-2xl overflow-hidden translate-x-full"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-navy/10 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold-dark" />
            <h3 className="font-sans font-bold tracking-tight text-base sm:text-lg">
              {step === "cart" && `My Suit Drawer (${cartCount})`}
              {step === "shipping" && "Shipping & Review"}
              {step === "success" && "Fabric Order Placed"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-navy-mid hover:text-navy cursor-pointer transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Steps Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {step === "cart" && (
            <>
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-navy-mid">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-navy text-sm sm:text-base">Your Suit Drawer is empty</h4>
                    <p className="font-body text-xs text-navy-mid mt-1 max-w-xs mx-auto leading-relaxed">
                      Browse our premium Lahore stock of unstitched Giza cottons, raw Karandi, and luxury wash & wear fabrics.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate("/collections");
                    }}
                    className="py-2.5 px-6 border border-gold hover:bg-gold hover:text-navy text-gold-dark font-body text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-navy/10">
                  {cartItems.map((item, idx) => {
                    const pricePerMeter = item.product.priceRange.min;
                    const itemSubtotal = item.selectedLength * pricePerMeter * item.quantity;
                    return (
                      <div key={item.id} className={`flex gap-4 pt-4 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                        {/* Proportional image */}
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-sm border border-navy/5"
                        />

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-sans font-bold text-xs sm:text-sm text-navy leading-snug">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-navy-mid hover:text-red-700 transition-colors p-0.5 cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-navy/10 shadow-xs"
                                style={{ backgroundColor: item.selectedSwatch.color }}
                              />
                              <span className="font-body text-[10px] uppercase font-bold text-navy-mid">
                                {item.selectedSwatch.name}
                              </span>
                            </div>
                          </div>

                          {/* Fabric parameters selection */}
                          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 bg-neutral-50 p-2 rounded-sm border border-navy/5">
                            <div className="flex items-center gap-1">
                              <span className="font-body text-[9px] uppercase tracking-wider text-navy-mid font-bold">Cut:</span>
                              <select
                                value={item.selectedLength}
                                onChange={(e) => updateLength(item.id, parseFloat(e.target.value))}
                                className="font-body text-[11px] font-semibold text-navy bg-white border border-navy/15 rounded-sm px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
                              >
                                <option value={4.0}>4.0 Meters (Standard Suit)</option>
                                <option value={4.5}>4.5 Meters (Generous Tall)</option>
                                <option value={2.5}>2.5 Meters (Kurta Length)</option>
                                <option value={8.0}>8.0 Meters (Double Pack)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 bg-white border border-navy/15 hover:border-navy text-navy transition-colors rounded-sm cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-body text-xs font-bold text-navy w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 bg-white border border-navy/15 hover:border-navy text-navy transition-colors rounded-sm cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="font-body text-[10px] text-navy-mid">
                              Rs. {pricePerMeter.toLocaleString()} / meter
                            </span>
                            <span className="font-mono font-bold text-gold-dark">
                              Rs. {itemSubtotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === "shipping" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-navy/10 pb-2.5">
                <button
                  onClick={() => setStep("cart")}
                  className="p-1 -ml-1 text-navy-mid hover:text-navy cursor-pointer"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                </button>
                <span className="font-body text-xs font-bold uppercase tracking-wider text-navy-mid">Back to Suit Drawer</span>
              </div>

              <form className="space-y-3 font-body text-xs text-navy" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block font-bold text-navy/70 mb-1 text-[11px] uppercase tracking-wider">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Muhammad Bilal"
                    className="w-full px-3 py-2 font-body border border-navy/20 rounded-sm bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy/70 mb-1 text-[11px] uppercase tracking-wider">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 03001234567"
                    className="w-full px-3 py-2 font-body border border-navy/20 rounded-sm bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy/70 mb-1 text-[11px] uppercase tracking-wider">Destination City (Pakistan) *</label>
                  <select
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 font-body border border-navy/20 rounded-sm bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy/70 mb-1 text-[11px] uppercase tracking-wider">Complete Shipping Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    placeholder="e.g. House #32, Sector Y, DHA"
                    className="w-full px-3 py-2 font-body border border-navy/20 rounded-sm bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy/70 mb-1 text-[11px] uppercase tracking-wider">Shipping Speed</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`border rounded-sm p-2 flex flex-col justify-center cursor-pointer text-center select-none ${customerInfo.shippingMethod === "Standard" ? "border-gold bg-gold/5 text-gold-dark font-bold" : "border-navy/15"}`}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="Standard"
                        checked={customerInfo.shippingMethod === "Standard"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <p className="text-[10px] uppercase font-bold tracking-wide">Standard Courier</p>
                      <p className="text-[10px] text-navy/60 font-medium">3-5 days · Rs. 190</p>
                    </label>
                    <label className={`border rounded-sm p-2 flex flex-col justify-center cursor-pointer text-center select-none ${customerInfo.shippingMethod === "Express" ? "border-gold bg-gold/5 text-gold-dark font-bold" : "border-navy/15"}`}>
                    <input
                      name="shippingMethod"
                      type="radio"
                      value="Express"
                        checked={customerInfo.shippingMethod === "Express"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <p className="text-[10px] uppercase font-bold tracking-wide">TCS Air-Express</p>
                      <p className="text-[10px] text-navy/60 font-medium">1-2 days · Rs. 350</p>
                    </label>
                  </div>
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-sm border border-navy/5">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-navy/60">Payment Method Assured</p>
                  <p className="font-sans font-bold text-xs mt-0.5 text-navy">Cash on Delivery (COD)</p>
                  <p className="text-[10px] text-navy-mid leading-relaxed mt-1">Payment is collected safely in rupees upon doorstep delivery by leopards or TCS couriers.</p>
                </div>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              <div>
                <h4 className="font-sans font-bold text-navy text-lg leading-snug">Order Successfully Sent!</h4>
                <p className="font-mono text-xs text-gold-dark font-bold mt-1 bg-gold/15 px-3 py-1 rounded-full inline-block">
                  Order Reference: {placedOrderId}
                </p>
                <p className="font-body text-xs text-navy-mid mt-3 max-w-sm mx-auto leading-relaxed">
                  Your unstitched fabric request from Azam Market has been registered successfully. We are preparing to slice the cloth precisely from the master bolts!
                </p>
              </div>

              <div className="w-full bg-neutral-50 p-3.5 rounded-sm border border-navy/5 text-left font-body text-xs space-y-2">
                <p className="font-bold border-b border-navy/10 pb-1.5 uppercase text-[10px] tracking-wider text-navy-mid">What happens next?</p>
                <div className="space-y-1.5 text-[11px] text-navy-mid">
                  <p>1. Our loom dispatch team cuts exactly your requested meters of unstitched fabric.</p>
                  <p>2. Pressed, checked for weave defects, and packed in luxury Larson gift packaging.</p>
                  <p>3. Shipped with standard tracking which you can review instantly.</p>
                </div>
              </div>

              <div className="w-full grid gap-2 pt-2">
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate(`/track?id=${placedOrderId}`);
                  }}
                  className="w-full py-2.5 bg-navy hover:bg-navy-dark text-white font-body text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  Track Order Status
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 border border-navy/10 text-navy hover:bg-neutral-50 font-body text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footers (Subtotals & Checkout Actions) */}
        {step !== "success" && cartItems.length > 0 && (
          <div className="border-t border-navy/10 p-4 sm:p-5 bg-neutral-50 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-navy-mid">
                <span className="font-body uppercase tracking-wider font-semibold">Total Fabric Meters:</span>
                <span className="font-mono font-bold text-navy">
                  {cartItems.reduce((acc, item) => acc + (item.selectedLength * item.quantity), 0)}m
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="font-sans text-navy">Subtotal:</span>
                <span className="font-mono text-gold-dark text-base sm:text-lg">
                  Rs. {cartSubtotal.toLocaleString()}
                </span>
              </div>
              {step === "shipping" && (
                <div className="flex justify-between items-center text-[10px] text-navy-mid font-body border-t border-navy/5 pt-1.5">
                  <span>Shipping Fee ({customerInfo.shippingMethod}):</span>
                  <span>Rs. {customerInfo.shippingMethod === "Express" ? "350" : "190"}</span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              {step === "cart" ? (
                <button
                  onClick={() => setStep("shipping")}
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-navy font-body text-xs font-bold uppercase tracking-[0.12em] rounded-sm transition-colors cursor-pointer text-center"
                >
                  Proceed to Shipping
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCheckout("website")}
                    disabled={isPending || !customerInfo.name || !customerInfo.phone || !customerInfo.address}
                    className="py-3 bg-navy hover:bg-navy-dark text-white font-body text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isPending ? "Booking..." : "COD Order"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckout("whatsapp")}
                    disabled={isPending || !customerInfo.name || !customerInfo.phone || !customerInfo.address}
                    className="py-3 bg-green-600 hover:bg-green-700 text-white font-body text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isPending ? "Routing..." : "WhatsApp"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

export default CartDrawer;
