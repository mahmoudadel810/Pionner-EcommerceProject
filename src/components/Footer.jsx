import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
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
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: t('footer.company.aboutUs'), href: "/about" },
      { name: t('footer.company.contact'), href: "/contact" },
      { name: t('footer.company.careers'), href: "#" },
      { name: t('footer.company.press'), href: "#" },
    ],
    support: [
      { name: t('footer.support.helpCenter'), href: "#" },
      { name: t('footer.support.returns'), href: "#" },
      { name: t('footer.support.shippingInfo'), href: "#" },
      { name: t('footer.support.sizeGuide'), href: "#" },
    ],
    legal: [
      { name: t('footer.legal.privacyPolicy'), href: "#" },
      { name: t('footer.legal.termsOfService'), href: "#" },
      { name: t('footer.legal.cookiePolicy'), href: "#" },
      { name: t('footer.legal.gdpr'), href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
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
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.company.title')}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.support.title')}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.contact.title')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('company.address')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-muted-foreground" />
                <span className="text-muted-foreground">{t('company.phone')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-muted-foreground" />
                <span className="text-muted-foreground">
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
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>© {currentYear} {t('footer.rights_reserved')}</span>
              <span>•</span>
              <span>{t('footer.madeWith')}</span>
              <Heart size={16} className="text-red-500 fill-current" />
              <span>{t('footer.forYou')}</span>
            </div>
            <div className="flex items-center space-x-4">
              {footerLinks.legal.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </motion.button>
    </footer>
  );
};

export default Footer;