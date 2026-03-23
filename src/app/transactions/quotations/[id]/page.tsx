"use client";

import { useStore, Product } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Printer, Mail, MessageCircle,
  Download, Building2, User, Phone, MapPin,
  FileText, CheckCircle2, Clock, XCircle, ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";

export default function QuotationView() {
  const { id } = useParams();
  const router = useRouter();
  const { quotes, clients, products, categories, companyInfo } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const quote = quotes.find(q => q.id === id);
  const client = quote ? clients.find(c => c.id === quote.clientId) : null;

  // ─── Calculations (mirrors create page logic) ──────────────────────
  const calc = useMemo(() => {
    if (!quote) return null;

    const lineItems = quote.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? categories.find(c => c.id === prod.categoryId) : null;
      const lineBase = item.price * item.qty;
      return { ...item, product: prod, category: cat, lineBase, gstRate: prod?.gstRate ?? 0 };
    });

    const baseTotal = lineItems.reduce((s, l) => s + l.lineBase, 0);
    const profitAmount = baseTotal * (quote.profitPercent / 100);
    const subtotal = baseTotal + profitAmount;
    const discountAmount = subtotal * (quote.discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;

    // GST per product
    let totalGst = 0;
    const gstGroups: Record<number, { taxable: number; gst: number; items: string[] }> = {};

    if (quote.isTaxApplicable && baseTotal > 0) {
      lineItems.forEach(l => {
        const share = (l.lineBase / baseTotal) * taxableAmount;
        const rate = l.gstRate;
        if (!gstGroups[rate]) gstGroups[rate] = { taxable: 0, gst: 0, items: [] };
        gstGroups[rate].taxable += share;
        const gst = share * (rate / 100);
        gstGroups[rate].gst += gst;
        gstGroups[rate].items.push(l.product?.name ?? "");
        totalGst += gst;
      });
    }

    const grossTotal = taxableAmount + totalGst;

    return { lineItems, baseTotal, profitAmount, subtotal, discountAmount, taxableAmount, gstGroups, totalGst, grossTotal };
  }, [quote, products, categories]);

  if (!quote || !client || !calc) {
    return <div className="p-10 text-center font-bold">Quotation not found.</div>;
  }

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const companyAddress = [companyInfo.addressLine, companyInfo.city, companyInfo.state, companyInfo.country, companyInfo.pinCode].filter(Boolean).join(", ");
  const clientAddress = [client.addressLine, client.city, client.state, client.country, client.pinCode].filter(Boolean).join(", ");

  // ─── Print Handler ─────────────────────────────────────────────────
  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Quotation ${quote.id}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 0; }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 10mm; size: A4; }
        }
      </style></head><body>
      ${el.innerHTML}
      <script>
        setTimeout(function(){ window.print(); window.close(); }, 400);
      </script>
      </body></html>
    `);
    printWindow.document.close();
  };

  // ─── WhatsApp Handler ──────────────────────────────────────────────
  const handleWhatsApp = () => {
    const text = [
      `*QUOTATION: ${quote.id}*`,
      `Date: ${new Date(quote.date).toLocaleDateString("en-IN")}`,
      ``,
      `*From: ${companyInfo.name}*`,
      `*To: ${client.name}*`,
      ``,
      `*Items:*`,
      ...calc.lineItems.map((l, i) =>
        `${i + 1}. ${l.product?.name} (${l.category?.name}) — ${l.qty} × ${fmt(l.price)} = ${fmt(l.lineBase)}`
      ),
      ``,
      `Base Total: ${fmt(calc.baseTotal)}`,
      quote.profitPercent > 0 ? `+ Profit (${quote.profitPercent}%): ${fmt(calc.profitAmount)}` : "",
      `Subtotal: ${fmt(calc.subtotal)}`,
      quote.discountPercent > 0 ? `- Discount (${quote.discountPercent}%): ${fmt(calc.discountAmount)}` : "",
      `Taxable Amount: ${fmt(calc.taxableAmount)}`,
      quote.isTaxApplicable ? `+ GST: ${fmt(calc.totalGst)}` : "GST: N/A",
      ``,
      `*GROSS TOTAL: ${fmt(calc.grossTotal)}*`,
      ``,
      `Thank you for your enquiry!`,
      `— ${companyInfo.name}`
    ].filter(Boolean).join("\n");

    const phone = client.phone?.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  };

  // ─── Email Handler ─────────────────────────────────────────────────
  const handleEmail = () => {
    const subject = `Quotation ${quote.id} — ${companyInfo.name}`;
    const body = [
      `Dear ${client.contactPerson || client.name},`,
      ``,
      `Please find below the quotation details:`,
      ``,
      `Quotation No: ${quote.id}`,
      `Date: ${new Date(quote.date).toLocaleDateString("en-IN")}`,
      ``,
      `Items:`,
      ...calc.lineItems.map((l, i) =>
        `  ${i + 1}. ${l.product?.name} (${l.category?.name}) — Qty: ${l.qty}, Rate: ${fmt(l.price)}, Amount: ${fmt(l.lineBase)}`
      ),
      ``,
      `Base Total: ${fmt(calc.baseTotal)}`,
      quote.profitPercent > 0 ? `Profit Loading (${quote.profitPercent}%): ${fmt(calc.profitAmount)}` : "",
      `Subtotal: ${fmt(calc.subtotal)}`,
      quote.discountPercent > 0 ? `Discount (${quote.discountPercent}%): ${fmt(calc.discountAmount)}` : "",
      `Taxable Amount: ${fmt(calc.taxableAmount)}`,
      quote.isTaxApplicable ? `GST: ${fmt(calc.totalGst)}` : "GST: Not Applicable",
      ``,
      `GROSS TOTAL: ${fmt(calc.grossTotal)}`,
      ``,
      `Looking forward to your confirmation.`,
      ``,
      `Best Regards,`,
      `${companyInfo.name}`,
      companyInfo.phone ? `Phone: ${companyInfo.phone}` : "",
      companyInfo.email ? `Email: ${companyInfo.email}` : "",
    ].filter(Boolean).join("\n");

    window.open(`mailto:${client.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
  };

  const statusColors: Record<string, string> = {
    "Draft": "bg-gray-500", "Pending Approval": "bg-amber-500",
    "Approved": "bg-emerald-500", "Rejected": "bg-red-500", "Converted": "bg-indigo-500",
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20 animate-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-bold">Back</span>
        </button>
        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${statusColors[quote.status]}`}>
          {quote.status}
        </div>
      </div>

      {/* ── Action Bar ── */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-1"
      >
        <button onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/25 active:scale-95 transition-transform whitespace-nowrap">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
        <button onClick={handleEmail}
          className="flex items-center gap-2 bg-white dark:bg-zinc-900 border-2 border-indigo-200 dark:border-zinc-700 text-indigo-600 px-5 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-transform whitespace-nowrap">
          <Mail className="w-4 h-4" /> Email
        </button>
        <button onClick={handleWhatsApp}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/25 active:scale-95 transition-transform whitespace-nowrap">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </button>
      </motion.div>

      {/* ── Print Preview ── */}
      <div ref={printRef}>
        <div style={{
          maxWidth: "800px", margin: "0 auto", background: "#fff", borderRadius: "20px",
          boxShadow: "0 4px 40px rgba(0,0,0,0.08)", overflow: "hidden", fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: "#1a1a2e"
        }}>

          {/* Company Header */}
          <div style={{
            background: "linear-gradient(135deg, #4338ca, #6d28d9)", color: "#fff",
            padding: "32px 36px", display: "flex", justifyContent: "space-between", alignItems: "flex-start"
          }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.5px" }}>{companyInfo.name}</div>
              <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "6px", maxWidth: "280px", lineHeight: "1.5" }}>
                {companyAddress}
              </div>
              {companyInfo.phone && (
                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>Ph: {companyInfo.phone}</div>
              )}
              {companyInfo.gstin && (
                <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px", fontWeight: 700 }}>GSTIN: {companyInfo.gstin}</div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "2px", opacity: 0.3 }}>QUOTATION</div>
              <div style={{
                marginTop: "8px", background: "rgba(255,255,255,0.15)", borderRadius: "8px",
                padding: "8px 16px", display: "inline-block"
              }}>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", opacity: 0.6 }}>Quote No</div>
                <div style={{ fontSize: "16px", fontWeight: 900 }}>{quote.id}</div>
              </div>
              <div style={{ fontSize: "11px", marginTop: "8px", opacity: 0.7 }}>
                Date: {new Date(quote.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div style={{
            padding: "24px 36px", borderBottom: "1px solid #eee",
            display: "flex", justifyContent: "space-between", gap: "24px"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "3px", color: "#9ca3af", marginBottom: "8px" }}>
                Bill To
              </div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: "#1a1a2e" }}>{client.name}</div>
              {client.mailingName && client.mailingName !== client.name && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{client.mailingName}</div>
              )}
              {clientAddress && (
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px", lineHeight: 1.5 }}>{clientAddress}</div>
              )}
              {client.phone && (
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Ph: {client.phone}</div>
              )}
              {client.email && (
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Email: {client.email}</div>
              )}
            </div>
            {client.isGstApplicable && client.gstNumber && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "3px", color: "#9ca3af", marginBottom: "8px" }}>
                  GST Details
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#4338ca", fontFamily: "monospace" }}>
                  {client.gstNumber}
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div style={{ padding: "0 36px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["#", "Product", "Category", "HSN", "GST%", "Rate", "Qty", "Amount"].map(h => (
                    <th key={h} style={{
                      padding: "14px 8px", textAlign: h === "Product" || h === "Category" ? "left" : "right",
                      fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px",
                      color: "#9ca3af"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calc.lineItems.map((l, i) => (
                  <tr key={l.productId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px", textAlign: "right", color: "#9ca3af", fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 700 }}>{l.product?.name}</td>
                    <td style={{ padding: "12px 8px", color: "#6b7280" }}>{l.category?.name}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", color: "#6b7280", fontSize: "11px" }}>{l.product?.hsn}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700, color: "#4338ca" }}>{l.gstRate}%</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", color: "#374151" }}>{fmt(l.price)}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700 }}>{l.qty}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 800, color: "#1a1a2e" }}>{fmt(l.lineBase)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div style={{
            padding: "24px 36px", display: "flex", justifyContent: "flex-end"
          }}>
            <div style={{ width: "320px" }}>
              {/* Base Total */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px", color: "#6b7280" }}>
                <span>Base Total</span><span style={{ fontWeight: 700 }}>{fmt(calc.baseTotal)}</span>
              </div>

              {quote.profitPercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px", color: "#059669" }}>
                  <span>+ Profit Loading ({quote.profitPercent}%)</span><span style={{ fontWeight: 700 }}>+ {fmt(calc.profitAmount)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px", color: "#374151", fontWeight: 600 }}>
                <span>Subtotal</span><span>{fmt(calc.subtotal)}</span>
              </div>

              {quote.discountPercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px", color: "#dc2626" }}>
                  <span>− Discount ({quote.discountPercent}%)</span><span style={{ fontWeight: 700 }}>− {fmt(calc.discountAmount)}</span>
                </div>
              )}

              <div style={{ borderTop: "1px solid #e5e7eb", margin: "6px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px", fontWeight: 700, color: "#1a1a2e" }}>
                <span>Taxable Amount</span><span>{fmt(calc.taxableAmount)}</span>
              </div>

              {/* GST Breakdown */}
              {quote.isTaxApplicable && Object.keys(calc.gstGroups).length > 0 && (
                <>
                  {Object.entries(calc.gstGroups).map(([rate, g]) => (
                    <div key={rate}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 2px 12px", fontSize: "11px", color: "#6b7280" }}>
                        <span>CGST @ {Number(rate) / 2}%</span><span>{fmt(g.gst / 2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0 4px 12px", fontSize: "11px", color: "#6b7280" }}>
                        <span>SGST @ {Number(rate) / 2}%</span><span>{fmt(g.gst / 2)}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px", color: "#4338ca", fontWeight: 700 }}>
                    <span>Total GST</span><span>{fmt(calc.totalGst)}</span>
                  </div>
                </>
              )}

              {!quote.isTaxApplicable && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px", color: "#9ca3af" }}>
                  <span>GST</span><span style={{ fontStyle: "italic" }}>Not Applicable</span>
                </div>
              )}

              <div style={{ borderTop: "2px solid #4338ca", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "18px", fontWeight: 900, color: "#4338ca" }}>
                <span>GROSS TOTAL</span><span>{fmt(calc.grossTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: "#f9fafb", padding: "20px 36px", display: "flex",
            justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #e5e7eb"
          }}>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "3px", color: "#9ca3af", marginBottom: "6px" }}>
                Terms & Conditions
              </div>
              <div style={{ fontSize: "10px", color: "#9ca3af", lineHeight: 1.6 }}>
                1. Prices are valid for 30 days from the date of quotation.<br />
                2. Delivery timeline will be confirmed upon order confirmation.<br />
                3. Payment terms: As mutually agreed.
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "3px", color: "#9ca3af", marginBottom: "6px" }}>
                For {companyInfo.name}
              </div>
              <div style={{ borderTop: "1px solid #d1d5db", width: "160px", marginTop: "40px", marginLeft: "auto" }} />
              <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>Authorized Signatory</div>
            </div>
          </div>

          {/* Brand bar */}
          <div style={{
            background: "linear-gradient(135deg, #4338ca, #6d28d9)", padding: "10px 36px",
            display: "flex", justifyContent: "space-between", fontSize: "9px", color: "rgba(255,255,255,0.5)"
          }}>
            <span>Generated by Taglio ERP</span>
            <span>{companyInfo.email} | {companyInfo.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
