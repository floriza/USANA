"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, ShieldCheck } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    sku: string;
    description: string;
    shortDescription: string | null;
    brand: string;
    categoryId: string;
    price: string | number;
    salePrice: string | number | null;
    costPrice: string | number | null;
    stockQuantity: number;
    weight: string | number | null;
    lengthCm: string | number | null;
    widthCm: string | number | null;
    heightCm: string | number | null;
    status: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestseller: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    metaKeywords: string | null;
    lowStockThreshold: number;
    criticalThreshold: number;
    fdaRegistrationNo: string | null;
    isFdaEvaluated: boolean;
    ingredients: string | null;
    directions: string | null;
    warnings: string | null;
    storageInstructions: string | null;
    servingSize: string | null;
    servingsPerContainer: number | null;
  };
  categories: Category[];
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] transition-all";
const inputStyle = { borderColor: "#EAE7DF", background: "#fff", color: "var(--foreground)" };

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: product.name,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription ?? "",
    brand: product.brand,
    categoryId: product.categoryId,
    price: parseFloat(String(product.price)),
    salePrice: product.salePrice ? parseFloat(String(product.salePrice)) : "",
    costPrice: product.costPrice ? parseFloat(String(product.costPrice)) : "",
    stockQuantity: product.stockQuantity,
    weight: product.weight ? parseFloat(String(product.weight)) : "",
    status: product.status,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestseller: product.isBestseller,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    metaKeywords: product.metaKeywords ?? "",
    lowStockThreshold: product.lowStockThreshold,
    criticalThreshold: product.criticalThreshold,
    fdaRegistrationNo: product.fdaRegistrationNo ?? "",
    isFdaEvaluated: product.isFdaEvaluated,
    ingredients: product.ingredients ?? "",
    directions: product.directions ?? "",
    warnings: product.warnings ?? "",
    storageInstructions: product.storageInstructions ?? "",
    servingSize: product.servingSize ?? "",
    servingsPerContainer: product.servingsPerContainer ?? "",
  });

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice !== "" ? Number(form.salePrice) : null,
        costPrice: form.costPrice !== "" ? Number(form.costPrice) : null,
        stockQuantity: Number(form.stockQuantity),
        weight: form.weight !== "" ? Number(form.weight) : null,
        lowStockThreshold: Number(form.lowStockThreshold),
        criticalThreshold: Number(form.criticalThreshold),
        servingsPerContainer: form.servingsPerContainer !== "" ? Number(form.servingsPerContainer) : null,
        lengthCm: null,
        widthCm: null,
        heightCm: null,
      };

      const res = await fetch(`/api/v1/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.success("Product saved successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Basic Info */}
      <section className="rounded-2xl border p-6 space-y-4" style={{ background: "#fff", borderColor: "#EAE7DF" }}>
        <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Product Name *">
            <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="SKU *">
            <input className={inputCls} style={inputStyle} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          </Field>
        </div>

        <Field label="Short Description">
          <input className={inputCls} style={inputStyle} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="Brief one-liner shown under the product name" />
        </Field>

        <Field label="Full Description *">
          <textarea
            className={inputCls}
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Brand">
            <input className={inputCls} style={inputStyle} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </Field>
          <Field label="Category *">
            <select className={inputCls} style={inputStyle} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Pricing & Stock */}
      <section className="rounded-2xl border p-6 space-y-4" style={{ background: "#fff", borderColor: "#EAE7DF" }}>
        <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>Pricing & Stock</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Price (₱) *">
            <input type="number" min="0" step="0.01" className={inputCls} style={inputStyle} value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Sale Price (₱)">
            <input type="number" min="0" step="0.01" className={inputCls} style={inputStyle} value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Cost Price (₱)">
            <input type="number" min="0" step="0.01" className={inputCls} style={inputStyle} value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Stock Quantity *">
            <input type="number" min="0" className={inputCls} style={inputStyle} value={form.stockQuantity} onChange={(e) => set("stockQuantity", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Status *">
            <select className={inputCls} style={inputStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </Field>
          <Field label="Low Stock Alert">
            <input type="number" min="0" className={inputCls} style={inputStyle} value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} />
          </Field>
          <Field label="Critical Stock Alert">
            <input type="number" min="0" className={inputCls} style={inputStyle} value={form.criticalThreshold} onChange={(e) => set("criticalThreshold", e.target.value)} />
          </Field>
        </div>

        <Field label="Weight (kg)">
          <input type="number" min="0" step="0.001" className={`${inputCls} max-w-xs`} style={inputStyle} value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="Optional" />
        </Field>
      </section>

      {/* Flags */}
      <section className="rounded-2xl border p-6 space-y-4" style={{ background: "#fff", borderColor: "#EAE7DF" }}>
        <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>Product Flags</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: "isFeatured", label: "Featured Product" },
            { key: "isNewArrival", label: "New Arrival" },
            { key: "isBestseller", label: "Bestseller" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 rounded accent-[#2D6A4F]"
              />
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* FDA / Compliance */}
      <section className="rounded-2xl border p-6 space-y-4" style={{ background: "#fff", borderColor: "#EAE7DF" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: "#2D6A4F" }} />
          <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>FDA / Compliance</h2>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none p-4 rounded-xl border transition-colors"
          style={{ borderColor: form.isFdaEvaluated ? "#6EE7B7" : "#EAE7DF", background: form.isFdaEvaluated ? "#ECFDF5" : "#FAFAF7" }}
        >
          <input
            type="checkbox"
            checked={form.isFdaEvaluated}
            onChange={(e) => set("isFdaEvaluated", e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-[#2D6A4F]"
          />
          <div>
            <p className="text-sm font-medium" style={{ color: form.isFdaEvaluated ? "#065F46" : "var(--foreground)" }}>
              FDA Evaluated
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              When checked, the health disclaimer is hidden on this product&apos;s page. Only check if this product has been evaluated by the FDA Philippines.
            </p>
          </div>
        </label>

        <Field label="FDA Registration No.">
          <input className={`${inputCls} max-w-xs`} style={inputStyle} value={form.fdaRegistrationNo} onChange={(e) => set("fdaRegistrationNo", e.target.value)} placeholder="e.g. FR-4500012345" />
        </Field>
      </section>

      {/* Supplement Info */}
      <section className="rounded-2xl border p-6 space-y-4" style={{ background: "#fff", borderColor: "#EAE7DF" }}>
        <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>Supplement Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Serving Size">
            <input className={inputCls} style={inputStyle} value={form.servingSize} onChange={(e) => set("servingSize", e.target.value)} placeholder="e.g. 2 tablets" />
          </Field>
          <Field label="Servings Per Container">
            <input type="number" min="1" className={inputCls} style={inputStyle} value={form.servingsPerContainer} onChange={(e) => set("servingsPerContainer", e.target.value)} placeholder="e.g. 60" />
          </Field>
        </div>

        <Field label="Ingredients">
          <textarea className={inputCls} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} placeholder="List all ingredients..." />
        </Field>

        <Field label="Directions for Use">
          <textarea className={inputCls} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.directions} onChange={(e) => set("directions", e.target.value)} placeholder="How to use this product..." />
        </Field>

        <Field label="Warnings">
          <textarea className={inputCls} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.warnings} onChange={(e) => set("warnings", e.target.value)} placeholder="Safety warnings..." />
        </Field>

        <Field label="Storage Instructions">
          <input className={inputCls} style={inputStyle} value={form.storageInstructions} onChange={(e) => set("storageInstructions", e.target.value)} placeholder="e.g. Store in a cool, dry place" />
        </Field>
      </section>

      {/* SEO */}
      <section className="rounded-2xl border p-6 space-y-4" style={{ background: "#fff", borderColor: "#EAE7DF" }}>
        <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>SEO</h2>

        <Field label="SEO Title" hint="Defaults to product name if left blank">
          <input className={inputCls} style={inputStyle} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={form.name} />
        </Field>

        <Field label="SEO Description" hint="Shown in search engine results (max 160 chars)">
          <textarea className={inputCls} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} maxLength={160} />
        </Field>

        <Field label="Meta Keywords" hint="Comma-separated keywords">
          <input className={inputCls} style={inputStyle} value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} placeholder="USANA, supplements, vitamins" />
        </Field>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-5 py-3 rounded-2xl text-sm font-medium border transition-colors"
          style={{ borderColor: "#EAE7DF", color: "var(--muted)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
