import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Heart,
} from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const update = () => setShowScrollTop(window.scrollY > 400);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: t('footer.company.aboutUs'), href: "/about" },
      { name: t('footer.company.contact'), href: "/contact" },
      { name: t('footer.company.careers') },
      { name: t('footer.company.press') },
    ],
    support: [
      { name: t('footer.support.helpCenter'), href: "/contact" },
      { name: t('footer.support.returns') },
      { name: t('footer.support.shippingInfo') },
      { name: t('footer.support.sizeGuide') },
    ],
    legal: [
      { name: t('footer.legal.privacyPolicy') },
      { name: t('footer.legal.termsOfService') },
      { name: t('footer.legal.cookiePolicy') },
      { name: t('footer.legal.gdpr') },
    ],
  };

  const socialLinks = [
    { icon: Twitter, label: "X @pionner_sa" },
    { icon: Instagram, label: "Instagram @pionner_sa" },
    { icon: Youtube, label: "YouTube @pionner_sa" },
    { icon: Linkedin, label: "LinkedIn pionner-sa" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              {t('footer.newsletter.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('footer.newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button className="px-8 py-3">{t('footer.newsletter.subscribe')}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-sm"></div>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                {t('company.name')}
              </span>
            </div>
            <p className="text-muted-foreground">
              {t('footer.company.description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <span
                  key={social.label}
                  title={social.label}
                  className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"
                  aria-label={social.label}
                  role="img"
                >
                  <social.icon size={20} />
                </span>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.company.title')}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href ? (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{link.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.support.title')}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  {link.href ? (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{link.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.contact.title')}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t('company.address')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-muted-foreground" />
                <span className="text-muted-foreground" dir="ltr">{t('company.phone')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-muted-foreground" />
                <span className="text-muted-foreground" dir="ltr">
                  {t('company.email')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground">
              <span>© {currentYear} {t('footer.rights_reserved')}</span>
              <span>•</span>
              <span>{t('footer.madeWith')}</span>
              <Heart size={16} className="text-red-500 fill-current" />
              <span>{t('footer.forYou')}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {footerLinks.legal.map((link) => (
                <span key={link.name} className="text-muted-foreground text-sm">
                  {link.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 end-6 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 z-50"
            aria-label={t('footer.scroll_to_top')}
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;