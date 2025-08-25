import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    cors: true,
    open: false,


    allowedHosts: ['5174-ihkfje5ha9ofr4jrb6vtx-7f1f3943.manusvm.computer']
  },
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "use-sync-external-store/shim": path.resolve(__dirname, "node_modules/use-sync-external-store/shim/index.js"),
    },
  },
  build: {
    // Ensure _redirects is copied to the build output
    copyPublicDir: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and loading performance
        manualChunks: (id) => {
          // Vendor chunks for third-party libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-ui-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('zustand') || id.includes('axios')) {
              return 'utils-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('tailwind') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'styling-vendor';
            }
            // Group other node_modules
            return 'vendor';
          }
          
          // Feature-based chunks for your application code
          if (id.includes('/pages/')) {
            if (id.includes('LoginPage') || id.includes('SignUpPage') || id.includes('ForgetPasswordPage') || id.includes('ResetPasswordPage') || id.includes('EmailConfirmationPage')) {
              return 'auth-pages';
            }
            if (id.includes('ShopPage') || id.includes('ProductDetailPage') || id.includes('CategoriesPage') || id.includes('CategoryProductsPage')) {
              return 'shop-pages';
            }
            if (id.includes('ProfilePage') || id.includes('CartPage') || id.includes('WishlistPage')) {
              return 'user-pages';
            }
            if (id.includes('AdminDashboard')) {
              return 'admin-pages';
            }
            if (id.includes('PurchaseSuccessPage') || id.includes('PurchaseCancelPage')) {
              return 'payment-pages';
            }
            return 'other-pages';
          }
          
          if (id.includes('/components/')) {
            return 'components';
          }
          
          if (id.includes('/stores/')) {
            return 'stores';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Disable source maps for production security
    sourcemap: false,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
    },
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-hot-toast',
      'zustand',
      'axios',
      'lucide-react',
      'use-sync-external-store'
    ],
    esbuildOptions: {
      // Ensure proper resolution of use-sync-external-store
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    exclude: [
      // Exclude heavy packages that should be loaded on demand
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      'embla-carousel-react',
      'react-resizable-panels',
      'vaul'
    ],
  },
});

