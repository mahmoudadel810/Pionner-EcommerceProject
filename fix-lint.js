const fs = require('fs');
const path = require('path');

// Common unused imports to remove
const unusedImports = [
  'motion',
  'useScroll', 
  'useTransform',
  'cn',
  'toast'
];

// Files to process
const filesToFix = [
  'src/components/CategoryItem.jsx',
  'src/components/FeaturedProducts.jsx', 
  'src/components/Footer.jsx',
  'src/components/HeroSlider.jsx',
  'src/components/LoadingSpinner.jsx',
  'src/components/Navbar.jsx',
  'src/components/ProductCard.jsx',
  'src/components/StripePaymentForm.jsx',
  'src/pages/AboutPage.jsx',
  'src/pages/AdminDashboard.jsx',
  'src/pages/CartPage.jsx',
  'src/pages/CategoriesPage.jsx',
  'src/pages/CategoryProductsPage.jsx',
  'src/pages/ContactPage.jsx',
  'src/pages/DealsPage.jsx',
  'src/pages/EmailConfirmationPage.jsx',
  'src/pages/ForgetPasswordPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/LoginPage.jsx',
  'src/pages/NotFoundPage.jsx',
  'src/pages/ProductDetailPage.jsx',
  'src/pages/ProfilePage.jsx',
  'src/pages/PurchaseCancelPage.jsx',
  'src/pages/PurchaseSuccessPage.jsx',
  'src/pages/ResetPasswordPage.jsx',
  'src/pages/SearchPage.jsx',
  'src/pages/ShopPage.jsx',
  'src/pages/SignUpPage.jsx',
  'src/pages/WishlistPage.jsx'
];

function removeUnusedImports(content, filePath) {
  let modified = false;
  
  // Remove unused motion imports
  if (content.includes("import { motion } from \"framer-motion\";")) {
    content = content.replace("import { motion } from \"framer-motion\";", "");
    modified = true;
  }
  
  // Remove unused cn imports
  if (content.includes("import { cn } from \"../lib/utils\";")) {
    content = content.replace("import { cn } from \"../lib/utils\";", "");
    modified = true;
  }
  
  // Remove unused toast imports
  if (content.includes("import { toast } from \"react-hot-toast\";")) {
    content = content.replace("import { toast } from \"react-hot-toast\";", "");
    modified = true;
  }
  
  // Remove unused axios imports
  if (content.includes("import axios from \"axios\";")) {
    content = content.replace("import axios from \"axios\";", "");
    modified = true;
  }
  
  // Remove unused useEffect imports
  if (content.includes("import React, { useState, useEffect } from \"react\";")) {
    // Check if useEffect is actually used
    if (!content.includes("useEffect(")) {
      content = content.replace("import React, { useState, useEffect } from \"react\";", "import React, { useState } from \"react\";");
      modified = true;
    }
  }
  
  return { content, modified };
}

function fixUnusedVariables(content) {
  let modified = false;
  
  // Replace unused error parameters with underscore
  content = content.replace(/\.catch\(error => \{/g, '.catch(() => {');
  content = content.replace(/\.catch\(error => \{/g, '.catch(() => {');
  
  // Remove unused variable assignments
  content = content.replace(/const\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*unused/g, '// $1 unused');
  
  return { content, modified };
}

// Process each file
filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    const importResult = removeUnusedImports(content, filePath);
    content = importResult.content;
    modified = importResult.modified;
    
    const variableResult = fixUnusedVariables(content);
    content = variableResult.content;
    modified = variableResult.modified || modified;
    
    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed: ${filePath}`);
    }
  }
});

console.log('Lint fixes applied!'); 