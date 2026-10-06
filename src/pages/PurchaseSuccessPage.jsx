import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/useCartStore";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { useTranslation } from "react-i18next";

import { toast } from "react-hot-toast";
import { formatCurrency, formatDate } from "@/lib/currency";
import { Loader, CheckCircle, AlertTriangle, FileDown, ArrowLeft } from "lucide-react";

const PurchaseSuccessPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");

  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [successProcessed, setSuccessProcessed] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const processPaymentSuccess = async () => {
      if ((!sessionId && !paymentIntentId) || !isMounted) return;

      const intentKey = sessionId ? `order_success_${sessionId}` : `order_success_${paymentIntentId}`;
      if (localStorage.getItem(intentKey)) {
        setSuccessProcessed(true);
        setLoading(false);
        setError(null);
        toast.success(t('purchase.orderAlreadyConfirmed'));
        return;
      }

      try {
        setLoading(true);

        if (successProcessed) return;

        const { handleCheckoutSuccess, handlePaymentIntentSuccess } = usePaymentStore.getState();
        const result = sessionId
          ? await handleCheckoutSuccess(sessionId)
          : await handlePaymentIntentSuccess(paymentIntentId);

        if (!isMounted) return;

        if (result?.success) {
          setOrderDetails(result.data);
          setSuccessProcessed(true);
          localStorage.setItem(intentKey, "1");

          toast.success(t('purchase.orderConfirmed'));

          await clearCart();

          setTimeout(() => {
            if (isMounted) {
              toast(t('purchase.redirectingHome'));
              navigate("/");
            }
          }, 8000);
        } else {
          const errorMsg = result?.message || t('purchase.paymentConfirmationFailed');
          setError(errorMsg);
          toast.error(errorMsg);
          setSuccessProcessed(true);
        }
      } catch (error) {
        if (!isMounted) return;
        const errorMsg =
          error?.response?.data?.message || error?.message || t('purchase.failedToProcessPayment');
        setError(errorMsg);
        toast.error(errorMsg);
        setSuccessProcessed(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    processPaymentSuccess();

    return () => {
      isMounted = false;
    };
  }, [sessionId, paymentIntentId, successProcessed, clearCart, navigate, setError, setOrderDetails]);

  const generateInvoice = () => {
    const order = orderDetails;
    const orderId = order?.order?._id || "-";
    const createdAt = order?.order?.createdAt
      ? formatDate(order.order.createdAt, i18n.language, { dateStyle: "medium", timeStyle: "short" })
      : "-";
    const user = order?.user || {};

    const escape = (value) =>
      String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const rows = Array.isArray(order?.order?.products)
      ? order.order.products
          .map(
            (product) => `
              <tr>
                <td>${escape(product.productName || t("purchase.invoice.product"))}</td>
                <td>${product.quantity}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${formatCurrency(product.price * product.quantity)}</td>
              </tr>`
          )
          .join("")
      : "";

    const invoiceHtml = `
      <html lang="${i18n.language}" dir="${i18n.dir()}">
        <head>
          <meta charset="utf-8" />
          <title>${t("purchase.invoice.title")} - ${t("company.name")}</title>
        </head>
        <body style="font-family: sans-serif">
          <h1>🧾 ${t("purchase.invoice.title")} - ${t("company.name")}</h1>
          <p><strong>${t("purchase.invoice.orderId")}:</strong> <bdi>${escape(orderId)}</bdi></p>
          <p><strong>${t("purchase.invoice.date")}:</strong> ${createdAt}</p>
          <p><strong>${t("purchase.invoice.customer")}:</strong> ${escape(user?.name || t("purchase.invoice.guest"))}</p>
          <p><strong>${t("purchase.invoice.email")}:</strong> <bdi>${escape(user?.email || t("purchase.invoice.notProvided"))}</bdi></p>
          <br />
          <table border="1" cellpadding="10" cellspacing="0">
            <thead>
              <tr>
                <th>${t("purchase.invoice.product")}</th>
                <th>${t("purchase.invoice.qty")}</th>
                <th>${t("purchase.invoice.price")}</th>
                <th>${t("purchase.invoice.total")}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([invoiceHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 px-4"
    >
      {loading ? (
        <div className="text-center space-y-4" role="status" aria-live="polite">
          <Loader className="animate-spin text-primary w-10 h-10 mx-auto" />
          <h1 className="text-xl font-semibold">{t('purchase.processingPayment')}</h1>
          <p className="text-muted-foreground">{t('purchase.pleaseWait')}</p>
        </div>
      ) : error ? (
        <div className="text-center space-y-4 text-red-600" role="alert">
          <AlertTriangle className="w-10 h-10 mx-auto" />
          <h1 className="text-xl font-semibold">{t('purchase.somethingWentWrong')}</h1>
          <p>{error}</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="rtl:rotate-180 me-2 h-4 w-4" /> {t('purchase.goBack')}
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4" role="status" aria-live="polite">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
          <h1 className="text-2xl font-bold text-green-600">{t('purchase.paymentSuccessful')}</h1>
          <p className="text-muted-foreground">
            {t('purchase.thankYouMessage')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button variant="secondary" onClick={generateInvoice}>
              <FileDown className="w-4 h-4 me-2" />
              {t('purchase.downloadInvoice')}
            </Button>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="rtl:rotate-180 w-4 h-4 me-2" />
              {t('purchase.backToHome')}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PurchaseSuccessPage;
