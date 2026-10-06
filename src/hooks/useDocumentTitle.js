import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Sets "<page> | <store>" while the page is shown; a null title leaves the current one.
export const useDocumentTitle = (title) => {
  const { t } = useTranslation();
  const brand = t("company.name");

  useEffect(() => {
    if (title === null) return;
    document.title = title ? `${title} | ${brand}` : `${brand} | ${t("titles.home")}`;
  }, [title, brand, t]);
};
