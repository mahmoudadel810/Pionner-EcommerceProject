import React, { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/useCartStore";

import { toast } from "sonner";
import { Loader, CheckCircle, AlertTriangle, FileDown, ArrowLeft } from "lucide-react";

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");

  const navigate = useNavigate();
  // Auth store functions removed (store does not exist)
  const { clearCart } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [successProcessed, setSuccessProcessed] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  // 🧼 Unified cleanup
  const clearStoredPaymentData = () => {
    ["clientSecret", "paymentIntentId"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const processPaymentSuccess = async () => {
      if ((!sessionId && !paymentIntentId) || !isMounted) return;

      const intentKey = sessionId ? `order_success_${sessionId}` : `order_success_${paymentIntentId}`;
      if (localStorage.getItem(intentKey)) {
        setSuccessProcessed(true);
        setLoading(false);
        setError(null);
        toast.success("Order already confirmed for this payment!");
        return;
      }

      try {
        setLoading(true);
        clearLogoutFlag();

        if (successProcessed) return;

        const hasRefreshToken = document.cookie.includes("refreshToken");
        if (hasRefreshToken) {

          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        let result;
        if (sessionId) {
          const response = await fetch(`/api/orders/checkout-success/${sessionId}`);
          result = await response.json();
        } else if (paymentIntentId) {
          const response = await fetch(`/api/orders/payment-intent-success/${paymentIntentId}`);
          result = await response.json();
        }

        if (!isMounted) return;

        if (result?.success) {
          setOrderDetails(result.data);
          setSuccessProcessed(true);
          if (intentKey) localStorage.setItem(intentKey, "1");

          toast.success("🎉 Order confirmed! Your purchase was successful and will be delivered soon!");

          try {
            await clearCart();
          } catch (error) {
            console.error("Error clearing cart:", error);
          }

          clearStoredPaymentData();

          setTimeout(() => {
            if (isMounted) {
              toast("Redirecting to home page...");
              navigate("/");
            }
          }, 8000);
        } else {
          const errorMsg = result?.message || "Payment confirmation failed. Please contact support.";
          setError(errorMsg);
          toast.error(errorMsg);
          setSuccessProcessed(true);
        }
      } catch (error) {
        if (!isMounted) return;
        const errorMsg =
          error?.response?.data?.message || error?.message || "Failed to process payment confirmation.";
        console.error("Payment processing error:", error);
        setError(errorMsg);
        toast.error(errorMsg);
        setSuccessProcessed(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    clearStoredPaymentData(); // clear before starting
    processPaymentSuccess();

    return () => {
      isMounted = false;
      clearStoredPaymentData();
    };
  }, [sessionId, paymentIntentId, successProcessed, clearCart, navigate, setError, setOrderDetails]);

  const generateInvoice = () => {
    const order = orderDetails;
    const orderId = order?.order?._id || "N/A";
    const createdAt = order?.order?.createdAt ? new Date(order.order.createdAt).toLocaleString() : "N/A";
    const user = order?.user || {};

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - Pioneer</title>
        </head>
        <body>
          <h1>🧾 Invoice - Pioneer Order</h1>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Created At:</strong> ${createdAt}</p>
          <p><strong>Customer:</strong> ${user?.name || "Guest"}</p>
          <p><strong>Email:</strong> ${user?.email || "Not provided"}</p>
          <br />
          <table border="1" cellpadding="10" cellspacing="0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                Array.isArray(order?.order?.products)
                  ? order.order.products
                      .map(
                        (product) => `
                    <tr>
                      <td>${product.productName || "Product"}</td>
                      <td>${product.quantity}</td>
                      <td>$${product.price}</td>
                      <td>$${(product.price * product.quantity).toFixed(2)}</td>
                    </tr>`
                      )
                      .join("")
                  : ""
              }
            </tbody>
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
          <h1 className="text-xl font-semibold">Processing your payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your order.</p>
        </div>
      ) : error ? (
        <div className="text-center space-y-4 text-red-600" role="alert">
          <AlertTriangle className="w-10 h-10 mx-auto" />
          <h1 className="text-xl font-semibold">Oops! Something went wrong.</h1>
          <p>{error}</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4" role="status" aria-live="polite">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
          <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed and will be delivered soon.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button variant="secondary" onClick={generateInvoice}>
              <FileDown className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PurchaseSuccessPage;
