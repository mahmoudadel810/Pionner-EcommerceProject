# Pionner E-Commerce Platform

A modern, production-ready e-commerce platform built with React, Vite, and Tailwind CSS.

## Features

- **Modern UI/UX**: Built with React 18 and Tailwind CSS
- **Responsive Design**: Mobile-first approach with custom hooks
- **State Management**: Zustand for efficient state management
- **Component Library**: Custom UI components with shadcn/ui
- **Performance Optimized**: Vite for fast development and builds
- **Production Ready**: Optimized for deployment with proper error handling

## Project Structure



## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mahmoudadel810/Pionner-EcommerceProject.git
cd Pionner-EcommerceProject
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
pnpm build
```

The build output will be in the `dist/` directory.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues

## Architecture

### State Management
- **useCartStore**: Shopping cart functionality
- **useProductStore**: Product data and filtering
- **useUserStore**: User authentication and profile
- **useWishlistStore**: Wishlist management
- **usePaymentStore**: Payment processing

### Component Structure
- **Pages**: Main route components
- **Components**: Reusable UI components
- **UI**: shadcn/ui component library
- **Hooks**: Custom React hooks for business logic

## Design System

The project uses a consistent design system with:
- **Colors**: Tailwind CSS color palette
- **Typography**: Custom font stack
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
VITE_APP_NAME=Pionner E-Commerce
```

### Vite Configuration
The project uses Vite for fast development and optimized builds. Configuration is in `vite.config.js`.

## Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Custom hooks for responsive behavior
- Optimized images and assets
- Touch-friendly interactions

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `pnpm build`
   - Output Directory: `dist`
3. Deploy automatically on push to main branch

### Other Platforms
The project can be deployed to any static hosting platform:
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the deployment guide

---

Built with ❤️ for modern e-commerce 