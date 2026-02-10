# Design Document: Phase 9 UX Enhancements

## Overview

Phase 9 enhances the PocketCloud user experience with five major improvements: breadcrumb navigation, context menus, PWA support, enhanced file previews, and mobile responsiveness. The implementation leverages existing React + TypeScript infrastructure with Tailwind CSS, adding vite-plugin-pwa for PWA capabilities and react-syntax-highlighter for code previews.

**Key Design Decisions:**
- Use vite-plugin-pwa for zero-config PWA setup with Workbox
- Implement context menu as a reusable React component with portal rendering
- Enhance FilePreviewModal with lazy-loaded preview renderers
- Create a Breadcrumb component that integrates with React Router
- Apply mobile-first responsive design principles across all components

## Architecture

### Component Structure

```
frontend/src/
├── components/
│   ├── Breadcrumb.tsx              # New: Navigation breadcrumb
│   ├── ContextMenu.tsx             # New: Right-click context menu
│   ├── FilePreviewModal.tsx        # Enhanced: More format support
│   ├── InstallPWAPrompt.tsx        # New: PWA install banner
│   ├── OfflineIndicator.tsx        # New: Offline status banner
│   └── KeyboardShortcutsHelp.tsx   # Enhanced: More shortcuts
├── hooks/
│   ├── useContextMenu.ts           # New: Context menu logic
│   ├── useOnlineStatus.ts          # New: Online/offline detection
│   └── useKeyboardShortcuts.ts     # New: Keyboard shortcut handler
└── lib/
    └── pwa.ts                      # New: PWA utilities
```

### PWA Architecture

**Service Worker Strategy:**
- Static assets (HTML, CSS, JS): Cache-first with cache update
- API calls: Network-first with cache fallback
- Images: Cache-first with expiration (7 days)
- Offline page: Precached for offline fallback

**Caching Layers:**
1. **Precache**: Critical app shell (index.html, main.js, main.css)
2. **Runtime cache**: API responses, images, fonts
3. **Offline fallback**: Static offline page

### Context Menu Architecture

**Positioning Algorithm:**
1. Get cursor position (x, y) from mouse event
2. Measure menu dimensions
3. Check if menu extends beyond viewport
4. Adjust position to keep menu visible
5. Apply position via absolute positioning

**Event Handling:**
- Right-click: `contextmenu` event with `preventDefault()`
- Long-press (mobile): `touchstart` + `touchend` with 500ms threshold
- Close triggers: Click outside, Escape key, action selection

## Components and Interfaces

### Breadcrumb Component

```typescript
interface BreadcrumbItem {
  label: string
  path: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  maxItems?: number  // Collapse middle items if exceeded
}

// Usage
<Breadcrumb items={[
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Files', path: '/files', icon: <Files /> }
]} />
```

**Responsive Behavior:**
- Desktop: Show all items with separators
- Tablet: Show first, last, and ellipsis for middle items
- Mobile: Show only current item with back button

### ContextMenu Component

```typescript
interface ContextMenuItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
  shortcut?: string
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number }
  isOpen: boolean
  onClose: () => void
}

// Usage
<ContextMenu
  items={[
    { label: 'Download', icon: <Download />, onClick: handleDownload },
    { label: 'Delete', icon: <Trash2 />, onClick: handleDelete, variant: 'danger' }
  ]}
  position={{ x: 100, y: 200 }}
  isOpen={isMenuOpen}
  onClose={() => setIsMenuOpen(false)}
/>
```

**Accessibility Features:**
- ARIA role="menu" and role="menuitem"
- Keyboard navigation (Arrow keys, Enter, Escape)
- Focus trap when open
- Screen reader announcements

### Enhanced FilePreviewModal

```typescript
interface PreviewRenderer {
  canRender: (mimetype: string, filename: string) => boolean
  render: (file: FileItem, content: string | Blob) => React.ReactNode
}

// Preview renderers
const previewRenderers: PreviewRenderer[] = [
  ImagePreviewRenderer,
  VideoPreviewRenderer,
  AudioPreviewRenderer,
  PDFPreviewRenderer,
  MarkdownPreviewRenderer,
  CodePreviewRenderer,
  TextPreviewRenderer,
]

// Language detection for code
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'jsx': 'javascript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sh': 'bash',
    'sql': 'sql',
  }
  return languageMap[ext || ''] || 'plaintext'
}
```

**Preview Renderers:**

1. **AudioPreviewRenderer**: HTML5 audio player with controls
2. **MarkdownPreviewRenderer**: Uses `react-markdown` with GitHub-flavored markdown
3. **CodePreviewRenderer**: Uses `react-syntax-highlighter` with VS Code theme
4. **TextPreviewRenderer**: Monospace font with line numbers

### InstallPWAPrompt Component

```typescript
interface InstallPWAPromptProps {
  onInstall: () => void
  onDismiss: () => void
}

// Tracks install prompt state
interface PWAInstallState {
  canInstall: boolean
  hasBeenDismissed: boolean
  visitCount: number
}

// Show prompt logic
function shouldShowPrompt(state: PWAInstallState): boolean {
  return state.canInstall && 
         !state.hasBeenDismissed && 
         state.visitCount >= 3
}
```

**Prompt Behavior:**
- Appears at bottom of screen (non-intrusive)
- Dismissible with "X" button
- "Install" button triggers `beforeinstallprompt` event
- Stores dismissal in localStorage
- Tracks visit count in localStorage

### OfflineIndicator Component

```typescript
interface OfflineIndicatorProps {
  isOnline: boolean
}

// Usage with hook
const isOnline = useOnlineStatus()

<OfflineIndicator isOnline={isOnline} />
```

**Indicator Behavior:**
- Appears at top of screen when offline
- Slides in/out with animation
- Shows "You're offline" message
- Automatically hides when back online
- Uses `window.addEventListener('online')` and `window.addEventListener('offline')`

### useContextMenu Hook

```typescript
interface UseContextMenuReturn {
  isOpen: boolean
  position: { x: number; y: number }
  openMenu: (event: React.MouseEvent | React.TouchEvent) => void
  closeMenu: () => void
}

function useContextMenu(): UseContextMenuReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const openMenu = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    
    // Get position from mouse or touch event
    const x = 'clientX' in event ? event.clientX : event.touches[0].clientX
    const y = 'clientY' in event ? event.clientY : event.touches[0].clientY
    
    setPosition({ x, y })
    setIsOpen(true)
  }
  
  const closeMenu = () => setIsOpen(false)
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])
  
  return { isOpen, position, openMenu, closeMenu }
}
```

### useOnlineStatus Hook

```typescript
function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}
```

### useKeyboardShortcuts Hook

```typescript
interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  handler: () => void
  description: string
}

function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrlKey || shortcut.metaKey
        const matchesModifier = ctrlOrMeta 
          ? (event.ctrlKey || event.metaKey)
          : true
        const matchesShift = shortcut.shiftKey 
          ? event.shiftKey 
          : !event.shiftKey
        
        if (event.key === shortcut.key && matchesModifier && matchesShift) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
```

## Data Models

### PWA Manifest

```json
{
  "name": "PocketCloud",
  "short_name": "PocketCloud",
  "description": "Personal encrypted cloud storage",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "utilities"],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Service Worker Configuration

```typescript
// vite.config.ts PWA plugin configuration
{
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
  manifest: {
    // manifest.json content
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 300, // 5 minutes
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 604800, // 7 days
          },
        },
      },
    ],
  },
}
```

### LocalStorage Schema

```typescript
interface PWAPreferences {
  installPromptDismissed: boolean
  visitCount: number
  lastVisit: string // ISO date
}

interface KeyboardShortcutsPreferences {
  enabled: boolean
  customShortcuts?: Record<string, string>
}

// Storage keys
const STORAGE_KEYS = {
  PWA_PREFS: 'pocketcloud_pwa_prefs',
  KEYBOARD_PREFS: 'pocketcloud_keyboard_prefs',
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Breadcrumb Navigation

*For any* breadcrumb item with a defined path, clicking the item should navigate to that path.

**Validates: Requirements 1.3**

### Property 2: Context Menu Display

*For any* file item, right-clicking (or long-pressing on mobile) should display a context menu containing Download, Share, Tag, Version History, and Delete options.

**Validates: Requirements 2.1, 2.2, 6.1**

### Property 3: Context Menu Dismissal

*For any* open context menu, it should close when: (1) clicking/tapping outside the menu, (2) pressing Escape, or (3) selecting a menu action.

**Validates: Requirements 2.3, 2.4, 2.6, 6.4**

### Property 4: Context Menu Viewport Positioning

*For any* cursor position and context menu dimensions, the menu should be positioned to remain fully visible within the viewport bounds.

**Validates: Requirements 2.5**

### Property 5: Context Menu Keyboard Navigation

*For any* open context menu, users should be able to navigate menu items using Tab and Arrow keys, select items with Enter, and close with Escape.

**Validates: Requirements 2.7, 10.6**

### Property 6: Context Menu View Mode Independence

*For any* view mode (grid or list), the context menu should function identically.

**Validates: Requirements 2.8**

### Property 7: Service Worker Caching Strategy

*For any* static asset request, the service worker should check cache first before network; *for any* API request, the service worker should try network first with cache fallback.

**Validates: Requirements 3.6, 3.7**

### Property 8: File Preview Format Support

*For any* file with a supported format (audio: mp3/wav/ogg/m4a, markdown: .md, code: js/ts/py/java/go/rust/html/css/json/yaml, text: .txt), the preview modal should render the appropriate preview component.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 9: Preview Loading States

*For any* file being previewed, a loading indicator should be visible while content is fetching; if loading fails, an error message with download option should appear.

**Validates: Requirements 4.5, 4.6**

### Property 10: Preview Modal Responsiveness

*For any* viewport width less than 768px, the preview modal should adapt its layout to fit the mobile screen with scrollable content.

**Validates: Requirements 4.7, 5.6**

### Property 11: Preview Modal Keyboard Shortcuts

*For any* open preview modal, pressing Escape should close the modal.

**Validates: Requirements 4.8**

### Property 12: Preview Metadata Display

*For any* file being previewed, the modal should display file size, mimetype, upload date, and encryption status.

**Validates: Requirements 4.9**

### Property 13: Code Language Detection

*For any* code file being previewed, the system should detect the programming language from the file extension and apply appropriate syntax highlighting.

**Validates: Requirements 4.10**

### Property 14: Touch Target Minimum Size

*For any* interactive element on a mobile device (viewport < 768px), the element should have minimum dimensions of 44x44 pixels for touch accessibility.

**Validates: Requirements 5.1, 6.2**

### Property 15: Mobile Layout Adaptation

*For any* page viewed on a mobile device (viewport < 768px), the layout should adapt to: single-column grids, vertically stacked buttons when space is limited, hidden/collapsed non-critical elements, and touch-optimized spacing.

**Validates: Requirements 5.2, 5.4, 5.8, 5.11**

### Property 16: Responsive Typography

*For any* text element on a mobile device, font sizes should scale appropriately to remain readable without requiring horizontal scrolling.

**Validates: Requirements 5.3, 5.12**

### Property 17: Mobile Context Menu Touch Optimization

*For any* context menu on a mobile device, buttons should be touch-sized (44x44px minimum) and background scrolling should be prevented while the menu is open.

**Validates: Requirements 6.2, 6.3**

### Property 18: PWA Preferences Persistence

*For any* PWA preference (install prompt dismissed, visit count), storing the preference to localStorage and then retrieving it should return the same value.

**Validates: Requirements 7.5**

### Property 19: Network-Dependent Action Disabling

*For any* action that requires network connectivity, the action should be disabled when the user is offline.

**Validates: Requirements 8.4**

### Property 20: Overlay Escape Key Dismissal

*For any* dismissible overlay (modal, context menu, prompt), pressing the Escape key should close the overlay.

**Validates: Requirements 9.2**

### Property 21: Custom Keyboard Shortcut Prevention

*For any* custom keyboard shortcut, the default browser behavior for that key combination should be prevented.

**Validates: Requirements 9.6**

### Property 22: Interactive Element ARIA Labels

*For any* interactive element (button, link, input), the element should have an appropriate ARIA label or accessible name.

**Validates: Requirements 10.1**

### Property 23: Modal Focus Management

*For any* modal, when opened focus should be trapped within the modal, and when closed focus should return to the element that triggered the modal.

**Validates: Requirements 10.2, 10.3, 10.4**

### Property 24: Image Alt Text

*For any* image element, the element should have descriptive alt text.

**Validates: Requirements 10.5**

### Property 25: Logical Tab Order

*For any* page, pressing Tab should move focus through interactive elements in a logical, predictable order.

**Validates: Requirements 10.7**

### Property 26: Color Contrast Compliance

*For any* text and background color combination, the contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 10.8**

## Error Handling

### Context Menu Errors

**Out of Viewport**: If context menu would extend beyond viewport, adjust position to keep menu visible
- Calculate available space in all directions
- Position menu to maximize visibility
- Prefer right and down positioning when possible

**Touch Event Conflicts**: If long-press conflicts with scroll gestures
- Use 500ms threshold for long-press detection
- Cancel long-press if touch moves more than 10px
- Provide visual feedback during long-press

### Preview Errors

**Unsupported Format**: Display fallback UI with download button
- Show file icon and metadata
- Provide clear message: "Preview not available for this file type"
- Offer download as primary action

**Loading Failure**: Display error message with retry option
- Show error icon and message
- Provide "Try Again" and "Download" buttons
- Log error details for debugging

**Large File Warning**: Warn before loading very large files
- Check file size before preview
- Show warning for files > 10MB
- Require user confirmation to proceed

### PWA Errors

**Service Worker Registration Failure**: Gracefully degrade to non-PWA mode
- Log error to console
- Continue app functionality without offline support
- Don't show install prompt

**Cache Storage Full**: Clear old cache entries
- Implement LRU eviction strategy
- Keep most recent 100 entries
- Prioritize critical app shell

**Offline API Call**: Show offline indicator and queue request
- Display toast: "You're offline. Changes will sync when online."
- Store failed requests in IndexedDB
- Retry when connection restored

### Mobile Responsiveness Errors

**Viewport Too Small**: Ensure minimum usable width
- Set minimum viewport width of 320px
- Use horizontal scrolling only as last resort
- Prioritize most important content

**Touch Target Too Small**: Increase padding/margin
- Add invisible hit area if visual size can't increase
- Ensure 44x44px minimum touch target
- Add spacing between adjacent touch targets

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific breadcrumb navigation scenarios
- Context menu positioning edge cases (corners, edges)
- PWA manifest validation
- Service worker registration
- Specific file preview examples (one per format)
- Keyboard shortcut combinations
- Offline/online state transitions

**Property-Based Tests**: Verify universal properties across all inputs
- Context menu positioning for random cursor positions
- File preview rendering for random file types
- Touch target sizes for random viewport dimensions
- Mobile layout adaptation for random viewport widths (320px-768px)
- ARIA label presence for random interactive elements
- Color contrast for random color combinations
- Focus management for random modal open/close sequences

### Property-Based Testing Configuration

**Library**: Use `@fast-check/vitest` for TypeScript/React property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: phase9-ux-enhancements, Property {N}: {property_text}`
- Use custom arbitraries for:
  - Viewport dimensions (width: 320-2560, height: 568-1440)
  - Cursor positions (x: 0-viewport.width, y: 0-viewport.height)
  - File types (mimetype + extension combinations)
  - Color values (hex, rgb, hsl)

**Example Property Test**:
```typescript
import { test } from 'vitest'
import fc from 'fast-check'

// Feature: phase9-ux-enhancements, Property 4: Context Menu Viewport Positioning
test('context menu stays within viewport bounds', () => {
  fc.assert(
    fc.property(
      fc.record({
        cursorX: fc.integer({ min: 0, max: 1920 }),
        cursorY: fc.integer({ min: 0, max: 1080 }),
        menuWidth: fc.integer({ min: 150, max: 300 }),
        menuHeight: fc.integer({ min: 200, max: 500 }),
      }),
      ({ cursorX, cursorY, menuWidth, menuHeight }) => {
        const position = calculateMenuPosition(
          { x: cursorX, y: cursorY },
          { width: menuWidth, height: menuHeight },
          { width: 1920, height: 1080 }
        )
        
        // Menu should not extend beyond viewport
        expect(position.x + menuWidth).toBeLessThanOrEqual(1920)
        expect(position.y + menuHeight).toBeLessThanOrEqual(1080)
        expect(position.x).toBeGreaterThanOrEqual(0)
        expect(position.y).toBeGreaterThanOrEqual(0)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Unit Testing Focus Areas

**Breadcrumb Component**:
- Renders with single item
- Renders with multiple items
- Handles click navigation
- Collapses on mobile viewport
- Shows ellipsis for many items

**Context Menu Component**:
- Opens on right-click
- Opens on long-press (mobile)
- Closes on outside click
- Closes on Escape key
- Closes on action selection
- Positions at cursor
- Adjusts position for viewport edges
- Keyboard navigation works
- Touch targets meet minimum size on mobile

**File Preview Modal**:
- Renders image preview
- Renders video preview
- Renders audio preview
- Renders PDF preview
- Renders markdown preview
- Renders code preview with syntax highlighting
- Detects language from extension
- Shows loading indicator
- Shows error state
- Displays metadata
- Closes on Escape key
- Responsive on mobile

**PWA Features**:
- Manifest.json is valid
- Service worker registers successfully
- Install prompt shows after 3 visits
- Install prompt dismisses and doesn't reappear
- Offline indicator shows when offline
- Offline indicator hides when online
- Static assets are cached
- API calls use network-first strategy
- Preferences persist to localStorage

**Mobile Responsiveness**:
- Touch targets are 44x44px minimum
- Layout adapts to mobile viewport
- Typography scales appropriately
- Buttons stack vertically on mobile
- Modals fit mobile viewport
- No horizontal scrolling on mobile
- Dashboard grid is single column on mobile

**Keyboard Shortcuts**:
- "?" shows help modal
- Escape closes modals
- Ctrl/Cmd+K focuses search
- Ctrl/Cmd+U triggers upload
- Custom shortcuts prevent default behavior

**Accessibility**:
- Interactive elements have ARIA labels
- Modals trap focus when open
- Focus returns to trigger on modal close
- Images have alt text
- Tab order is logical
- Color contrast meets WCAG AA

### Integration Testing

**End-to-End Scenarios**:
1. User navigates using breadcrumbs → arrives at correct location
2. User right-clicks file → context menu appears → selects download → file downloads
3. User installs PWA → goes offline → app still works with cached content
4. User previews various file types → all render correctly
5. User on mobile → all interactions work with touch → layout is optimized

### Manual Testing Checklist

**PWA Installation**:
- [ ] Install prompt appears on supported browsers
- [ ] App installs successfully
- [ ] App icon appears on home screen
- [ ] App opens in standalone mode
- [ ] Offline functionality works

**Mobile Devices**:
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet (iPad)
- [ ] All touch interactions work
- [ ] No horizontal scrolling
- [ ] Text is readable
- [ ] Buttons are easy to tap

**Accessibility**:
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Test keyboard-only navigation
- [ ] Test with high contrast mode
- [ ] Test with 200% zoom
- [ ] Verify color contrast with tools

**Browser Compatibility**:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Performance Testing

**Metrics to Monitor**:
- Service worker registration time < 100ms
- Context menu open time < 50ms
- Preview modal open time < 200ms
- File preview render time < 500ms
- Mobile layout shift (CLS) < 0.1
- Touch response time < 100ms

**Tools**:
- Lighthouse for PWA audit
- Chrome DevTools for performance profiling
- WebPageTest for mobile performance
- axe DevTools for accessibility testing
