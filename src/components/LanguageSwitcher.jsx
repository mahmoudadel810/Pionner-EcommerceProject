import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const languages = [
    {
      code: 'ar',
      name: 'العربية',
      flag: '🇸🇦',
      country: 'Saudi Arabia'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      country: 'United States'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsOpen(false);
      // Layout-dependent components (sliders, menus) re-measure on resize after a direction change.
      window.dispatchEvent(new Event('resize'));
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-sm font-medium text-gray-700">
            {currentLanguage.name}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
              currentLang === language.code
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{language.name}</span>
              <span className="text-xs text-gray-500">{language.country}</span>
            </div>
            {currentLang === language.code && (
              <div className="ml-auto rtl:mr-auto rtl:ml-0 w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;