import { useState, useEffect } from "react";
import { Star, Camera, Check, AlertCircle, X, Shield } from "lucide-react";
import { Heading } from "@/src/components/ui/Heading";
import { Button } from "@/src/components/ui/Button";
import { Product } from "@/src/types";

export interface Review {
  _id: string;
  productId: string;
  productName: string;
  rating: number;
  content: string;
  email: string;
  displayName: string;
  isAnonymous: boolean;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ReviewsSectionProps {
  product: Product;
}

export function ReviewsSection({ product }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorSync, setErrorSync] = useState("");

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Submit Wizard Steps: 1 (Stars), 2 (Review Content), 3 (User Details), 4 (Upload Image), 5 (Thank you)
  const [step, setStep] = useState(1);
  
  // Form fields state
  const [ratingInput, setRatingInput] = useState<number>(0);
  const [contentInput, setContentInput] = useState("");
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isAnonymousInput, setIsAnonymousInput] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch approved product reviews
  const loadReviews = async () => {
    try {
      setLoading(true);
      setErrorSync("");
      const res = await fetch(`/api/reviews/${product._id || product.slug}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data || []);
      } else {
        setErrorSync("Failed to fetch product review list.");
      }
    } catch (err) {
      console.error(err);
      setErrorSync("Error syncing product reviews database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [product._id, product.slug]);

  // Handle Stars select & auto-advance to step 2
  const handleStarSelection = (selectedStars: number) => {
    setRatingInput(selectedStars);
    setStep(2);
  };

  // Convert uploaded image file to Base64 and send to server upload API
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Images must be under 2MB in size.");
      return;
    }

    setFormError("");
    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Str = reader.result as string;
      setPreviewImage(base64Str);

      try {
        const res = await fetch("/api/reviews/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Str }),
        });

        if (res.ok) {
          const data = await res.json();
          setUploadedImageUrl(data.url);
        } else {
          const errData = await res.json();
          setFormError(errData.error || "Failed to finalize image upload.");
        }
      } catch (err) {
        console.error(err);
        setFormError("Failed to upload image. Falls back smoothly if offline.");
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit complete review payload to backend
  const handleSubmitReview = async () => {
    if (!contentInput.trim()) {
      setFormError("Please write a sentence or feedback content about the fabric.");
      return;
    }
    if (!displayNameInput.trim()) {
      setFormError("Display name is required.");
      return;
    }
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setFormError("A valid email address is required.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id || product.slug,
          productName: product.name,
          rating: ratingInput,
          content: contentInput.trim(),
          email: emailInput.trim(),
          displayName: displayNameInput.trim(),
          isAnonymous: isAnonymousInput,
          imageUrl: uploadedImageUrl || undefined,
        }),
      });

      if (res.ok) {
        setStep(5); // Auto-advance to thank-you step
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to publish item review.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Failed to transmit review credentials to backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsModalOpen(false);
    setStep(1);
    setRatingInput(0);
    setContentInput("");
    setDisplayNameInput("");
    setEmailInput("");
    setIsAnonymousInput(false);
    setPreviewImage(null);
    setUploadedImageUrl(null);
    setFormError("");
  };

  // Compute stars stats summary
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
    : "5.0";

  return (
    <div className="border-t border-navy/15 pt-12 space-y-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-navy/5">
        <div>
          <Heading level="eyebrow" className="text-navy font-bold">Unbiased Customer Reviews</Heading>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-2xl font-extrabold text-navy">{averageRating}</span>
            <div className="flex text-gold">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 fill-current ${
                    s <= Math.round(Number(averageRating)) ? "text-gold" : "text-neutral-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-body text-xs text-navy-mid">
              Based on {totalReviewsCount} approved {totalReviewsCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-navy hover:bg-[#0A1F5C] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm cursor-pointer"
        >
          Publish Weave Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-white border border-navy/5 rounded-sm p-6">
          <p className="font-display text-lg italic text-navy/60">No reviews verified yet</p>
          <p className="font-body text-xs text-navy-mid mt-1">Be the first to share your loom craftsmanship experience!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-white border border-navy/10 p-5 rounded-sm shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-body text-xs font-bold text-navy">
                      {rev.isAnonymous ? "Anonymous Customer" : rev.displayName}
                    </span>
                    {rev.isAnonymous && (
                      <span className="inline-flex items-center gap-1 ml-1.5 px-1.5 py-0.5 rounded-full bg-neutral-100 text-[9px] text-navy-mid font-semibold uppercase">
                        <Shield className="w-2.5 h-2.5" /> Anonymous
                      </span>
                    )}
                  </div>
                  <span className="font-body text-[10px] text-navy-mid">
                    {new Date(rev.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex text-gold">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 fill-current ${
                        s <= rev.rating ? "text-gold" : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>

                <p className="font-body text-xs text-navy-mid leading-relaxed italic">
                  "{rev.content}"
                </p>
              </div>

              {rev.imageUrl && (
                <div className="pt-2">
                  <a href={rev.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative w-16 h-20 bg-neutral-100 rounded-sm overflow-hidden border border-navy/10 hover:border-gold transition-all select-none">
                    <img
                      src={rev.imageUrl}
                      alt="Review attachment"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RATING SUBMISSION MODAL WIZARD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-[#FBF9F6] border border-navy/25 rounded-sm w-full max-w-md p-6 shadow-2xl animate-fade-in text-navy max-h-[95vh] overflow-y-auto">
            {/* Close Button Header */}
            <button
              onClick={handleResetForm}
              className="absolute top-4 right-4 text-navy-mid hover:text-navy cursor-pointer transition-colors"
              aria-label="Dismiss Review Setup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: SELECT STARS PANEL */}
            {step === 1 && (
              <div className="text-center space-y-5 py-4">
                <Heading level="eyebrow" className="text-gold">Review Wizard — Step 1 of 4</Heading>
                
                {/* Product Metadata display */}
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-20 bg-neutral-150 rounded-sm overflow-hidden shadow-xs border border-navy/10 relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display text-xl italic text-navy">{product.name}</h3>
                </div>

                <h4 className="font-sans font-extrabold text-[13px] uppercase tracking-wide text-navy/80">
                  How would you rate this unstitched fabric?
                </h4>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStarSelection(s)}
                      className="p-1 hover:scale-125 transition-all text-neutral-200 hover:text-gold cursor-pointer"
                      title={`${s} Stars rating`}
                    >
                      <Star className="w-10 h-10 fill-current hover:text-gold hover:fill-gold" />
                    </button>
                  ))}
                </div>

                <p className="font-body text-[10px] text-navy-mid leading-relaxed pt-2">
                  Click a star count above to automatically proceed with writing your experience feedback.
                </p>
              </div>
            )}

            {/* STEP 2: WRITE EXPERIENCE FEEDBACK */}
            {step === 2 && (
              <div className="space-y-4 py-2">
                <Heading level="eyebrow" className="text-gold">Review Wizard — Step 2 of 4</Heading>
                
                <div className="flex items-center justify-between pb-2 border-b border-navy/5">
                  <span className="font-body text-xs font-bold uppercase tracking-wider text-navy">Rating Select:</span>
                  <div className="flex text-gold">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 fill-current ${s <= ratingInput ? "text-gold" : "text-neutral-200"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-body text-xs uppercase tracking-wider text-navy font-bold">
                    Write Product Review:
                  </label>
                  <p className="font-body text-[10px] text-navy-mid">Please type detailed feedback about unstitched quality, density, or loom texture.</p>
                  <textarea
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder="Weave quality, drape weight, or thread luster details..."
                    className="w-full h-24 p-3 bg-white border border-navy/20 rounded-sm font-body text-xs focus:outline-none focus:ring-1 focus:ring-gold text-navy"
                    required
                  />
                </div>

                <div className="p-3 bg-neutral-50 border border-navy/5 space-y-1.5 text-[10px] text-navy-mid rounded-sm leading-relaxed">
                  <p className="font-semibold flex items-center gap-1 text-gold-dark">
                    <Shield className="w-3.5 h-3.5" /> Client Terms Assurance
                  </p>
                  <p>By submitting this review, you agree to our corporate Terms & Conditions.</p>
                  <p>Our Lahori showroom managers will contact you about your review details if necessary.</p>
                </div>

                {formError && (
                  <p className="text-red-600 font-body text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{formError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="gold"
                    className="flex-1 text-xs"
                    disabled={!contentInput.trim()}
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: USER CREDENTIALS */}
            {step === 3 && (
              <div className="space-y-4 py-2">
                <Heading level="eyebrow" className="text-gold">Review Wizard — Step 3 of 4</Heading>
                
                <div className="space-y-3">
                  <div>
                    <label className="block font-body text-xs uppercase tracking-wider text-navy font-bold mb-1">
                      Display Name (Required)
                    </label>
                    <input
                      type="text"
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="e.g. Kamran Shah"
                      className="w-full px-3 py-2 bg-white border border-navy/20 rounded-sm font-body text-xs focus:outline-none focus:ring-1 focus:ring-gold text-navy"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-body text-xs uppercase tracking-wider text-navy font-bold mb-1">
                      Email address (Required)
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. kamran.shah@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-navy/20 rounded-sm font-body text-xs focus:outline-none focus:ring-1 focus:ring-gold text-navy"
                      required
                    />
                    <p className="font-body text-[8px] text-navy-mid mt-0.5">Used strictly for Verification Logs by showroom operations.</p>
                  </div>

                  <div className="pt-2 flex items-start gap-2 bg-neutral-50 p-3 border border-navy/5 rounded-sm">
                    <input
                      type="checkbox"
                      id="isAnonymousInput"
                      checked={isAnonymousInput}
                      onChange={(e) => setIsAnonymousInput(e.target.checked)}
                      className="mt-0.5"
                    />
                    <label htmlFor="isAnonymousInput" className="font-body text-[10px] text-navy hover:text-gold cursor-pointer leading-tight font-medium">
                      <span className="font-bold underline block mb-0.5 text-gold-dark">Submit Anonymously</span>
                      If checked, your name and email will be hidden from displaying under product reviews. Only rating and content will show publicly.
                    </label>
                  </div>
                </div>

                {formError && (
                  <p className="text-red-500 font-body text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{formError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="gold"
                    className="flex-1 text-xs"
                    disabled={!displayNameInput.trim() || !emailInput.trim()}
                    onClick={() => setStep(4)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: ATTACH PHOTO (CLOUDINARY IMAGE UPLOAD) */}
            {step === 4 && (
              <div className="space-y-4 py-2 text-center">
                <Heading level="eyebrow" className="text-gold">Review Wizard — Step 4 of 4</Heading>
                
                <div className="space-y-2">
                  <h4 className="font-sans font-extrabold text-[12px] uppercase tracking-wide text-navy">
                    Share a unstitched picture or photo
                  </h4>
                  <p className="font-body text-[10px] text-navy-mid max-w-xs mx-auto">
                    Highly recommended! Upload a snapshot of the box packaging or fabric drape pattern to assist other customers.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-navy/20 bg-neutral-50/50 rounded-sm hover:bg-neutral-50 hover:border-gold transition-all relative">
                  {previewImage ? (
                    <div className="relative w-28 h-36 bg-neutral-200 border border-navy/10 rounded-sm overflow-hidden flex items-center justify-center select-none">
                      <img src={previewImage} alt="Uploaded review" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      {isUploadingImage ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        </div>
                      ) : (
                        <div className="absolute top-1 right-1 p-1 bg-navy text-white rounded-full cursor-pointer hover:bg-red-600" onClick={() => { setPreviewImage(null); setUploadedImageUrl(null); }}>
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer py-4 select-none">
                      <Camera className="w-8 h-8 text-gold-dark" />
                      <span className="font-body text-xs font-bold uppercase tracking-wider text-navy">
                        Upload a photo
                      </span>
                      <span className="font-body text-[9px] text-[#A09CA3]">PNG / JPG, up to 2MB.</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {formError && (
                  <p className="text-red-500 font-body text-xs font-semibold flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{formError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="gold"
                    className="flex-1 text-xs"
                    disabled={isUploadingImage || isSubmitting}
                    onClick={handleSubmitReview}
                  >
                    {isSubmitting ? "Loodging Review..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: THANK YOU CONFIRMATION */}
            {step === 5 && (
              <div className="text-center space-y-5 py-6">
                <div className="w-12 h-12 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-6 h-6" />
                </div>

                <Heading level="h3" className="italic text-2xl text-navy">Thanks for your feedback!</Heading>
                
                <p className="font-body text-xs text-navy-mid leading-relaxed max-w-sm mx-auto">
                  Your luxury fabric review has been securely transmitted to our Showroom Operations Desk. We are processing it and it will appear on our online catalog after standard checks and moderation soon!
                </p>

                <Button
                  variant="gold"
                  className="w-full text-xs uppercase"
                  onClick={handleResetForm}
                >
                  Close & return
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
