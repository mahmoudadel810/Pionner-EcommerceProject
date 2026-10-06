import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { XCircle, ShoppingCart, Home, RefreshCw } from "lucide-react";

const PurchaseCancelPage = () => {
  const { t } = useTranslation();
  const issues = t("purchaseCancel.issues", { returnObjects: true });
  const actions = t("purchaseCancel.actions", { returnObjects: true });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          {/* Cancel Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle size={48} className="text-red-500" />
          </motion.div>

          {/* Cancel Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t("purchaseCancel.title")}
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              {t("purchaseCancel.message")}
            </p>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-background rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t("purchaseCancel.needHelp")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-start">
                <h3 className="font-medium text-foreground mb-2">
                  {t("purchaseCancel.commonIssues")}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {Array.isArray(issues) && issues.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>

              <div className="text-start">
                <h3 className="font-medium text-foreground mb-2">
                  {t("purchaseCancel.whatYouCanDo")}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {Array.isArray(actions) && actions.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/cart"
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>{t("purchaseCancel.returnToCart")}</span>
            </Link>

            <Link
              to="/shop"
              className="flex-1 bg-secondary text-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/80 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>{t("purchaseCancel.continueShopping")}</span>
            </Link>

            <Link
              to="/"
              className="flex-1 bg-background border border-border text-foreground py-3 px-6 rounded-lg font-medium hover:bg-background/80 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>{t("purchaseCancel.goHome")}</span>
            </Link>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 pt-8 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-2">
              {t("purchaseCancel.supportNote")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("purchaseCancel.email")}{" "}
              <a
                href={`mailto:${t("company.email")}`}
                className="text-primary hover:text-primary/80"
                dir="ltr"
              >
                {t("company.email")}
              </a>{" "}
              | {t("purchaseCancel.phone")}{" "}
              <a
                href={`tel:${t("company.phone").replace(/\s/g, "")}`}
                className="text-primary hover:text-primary/80"
                dir="ltr"
              >
                {t("company.phone")}
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchaseCancelPage;
