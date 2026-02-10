# PocketCloud React Frontend

Modern, production-ready React frontend for PocketCloud with TypeScript, Tailwind CSS, and Vite.

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx    # Main dashboard layout
│   │   └── ui/
│   │       ├── Button.tsx             # Reusable button component
│   │       ├── Input.tsx              # Form input component
│   │       └── Card.tsx               # Card component
│   ├── pages/
│   │   ├── LandingPage.tsx            # Public landing page
│   │   ├── LoginPage.tsx              # Login page
│   │   ├── RegisterPage.tsx           # Registration page
│   │   ├── DashboardPage.tsx          # Main dashboard
│   │   ├── FilesPage.tsx              # File management
│   │   ├── SecurityPage.tsx           # Security center
│   │   └── SupportPage.tsx            # Support page
│   ├── services/
│   │   ├── api.ts                     # Axios instance with interceptors
│   │   ├── authService.ts             # Authentication API calls
│   │   └── fileService.ts             # File management API calls
│   ├── stores/
│   │   └── authStore.ts               # Zustand auth state
│   ├── lib/
│   │   └── utils.ts                   # Utility functions
│   ├── App.tsx                        # Main app component with routing
│   ├── main.tsx                       # App entry point
│   └── index.css                      # Global styles with Tailwind
├── index.html                         # HTML template
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite config
├── tailwind.config.js                 # Tailwind config
└── postcss.config.js                  # PostCSS config
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` and proxy API requests to `http://localhost:3000`.

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

## 🔧 Configuration

### API Proxy

The Vite dev server is configured to proxy `/api` requests to the Express backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

## 📦 Key Features

### Authentication
- JWT-based authentication
- Persistent login with Zustand
- Protected routes
- Automatic token refresh

### State Management
- Zustand for global state
- Persistent auth state in localStorage
- Type-safe store with TypeScript

### API Integration
- Axios interceptors for auth tokens
- Automatic error handling
- Request/response transformations

### UI Components
- Reusable, accessible components
- Consistent design system
- Dark mode support
- Responsive design

### Routing
- React Router v6
- Protected routes
- Lazy loading (future)
- 404 handling

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS with a custom design system:

- **Colors**: Primary (blue), secondary, destructive, muted, accent
- **Dark mode**: Class-based dark mode support
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth transitions and animations

### Component Variants

Components support multiple variants:

```tsx
<Button variant="primary" size="lg">Primary</Button>
<Button variant="outline" size="sm">Outline</Button>
<Button variant="destructive">Delete</Button>
```

## 🔐 Security

- **No sensitive data in localStorage** - Only JWT tokens
- **HTTPS recommended** - For production deployment
- **CORS configured** - Backend must allow frontend origin
- **XSS protection** - React's built-in protection
- **CSRF tokens** - Implemented in API calls

## 📱 Responsive Design

The UI is fully responsive:

- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Optimized for tablets (768px+)
- **Desktop**: Full desktop experience (1024px+)
- **Large screens**: Optimized for 4K displays

## 🚀 Deployment

### Option 1: Serve with Express

Build the frontend and serve it from Express:

```bash
# Build frontend
cd frontend
npm run build

# Copy build to Express public directory
cp -r dist/* ../public/

# Start Express server
cd ..
npm start
```

### Option 2: Separate Deployment

Deploy frontend and backend separately:

1. **Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages
2. **Backend**: Keep running on Raspberry Pi
3. **Update API URL**: Set `VITE_API_URL` to your Pi's IP

### Option 3: Docker

Create a Dockerfile for the frontend:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🧪 Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable names

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'
import Button from '../ui/Button'

// 2. Types/Interfaces
interface MyComponentProps {
  title: string
}

// 3. Component
export default function MyComponent({ title }: MyComponentProps) {
  // 4. State
  const [count, setCount] = useState(0)
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, [])
  
  // 6. Handlers
  const handleClick = () => {
    setCount(count + 1)
  }
  
  // 7. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Count: {count}</Button>
    </div>
  )
}
```

### State Management

- Use Zustand for global state
- Use React state for local component state
- Keep state as close to where it's used as possible

### API Calls

- Use service files for API calls
- Handle errors gracefully
- Show loading states
- Use toast notifications for feedback

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### API Connection Issues

1. Check backend is running on port 3000
2. Verify proxy configuration in `vite.config.ts`
3. Check CORS settings in Express

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🎯 Next Steps

1. **Complete remaining pages**:
   - FilesPage with drag-and-drop upload
   - SecurityPage with backup/restore
   - SupportPage with diagnostics

2. **Add advanced features**:
   - File preview
   - Bulk operations
   - Search and filters
   - Real-time updates

3. **Optimize performance**:
   - Code splitting
   - Lazy loading
   - Image optimization
   - Service worker

4. **Add testing**:
   - Unit tests with Vitest
   - E2E tests with Playwright
   - Component tests with Testing Library

## 📄 License

MIT License - Same as PocketCloud backend
