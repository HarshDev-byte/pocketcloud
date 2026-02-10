# Implementation Plan: Phase 9 UX Enhancements

## Overview

This implementation plan covers the final phase of PocketCloud development, focusing on five major UX improvements: breadcrumb navigation, context menus, PWA support, enhanced file previews, and mobile responsiveness. The implementation builds on the existing React + TypeScript + Vite frontend with Tailwind CSS.

## Tasks

- [ ] 1. Set up PWA infrastructure and dependencies
  - Install vite-plugin-pwa, react-markdown, react-syntax-highlighter, and @fast-check/vitest
  - Configure vite-plugin-pwa in vite.config.ts with manifest and workbox settings
  - Create manifest.json with app metadata, icons, and theme colors
  - Create PWA icon assets (192x192, 512x512) in public/icons/
  - _Requirements: 3.1, 3.2, 3.8_

- [ ] 2. Implement custom hooks for shared functionality
  - [ ] 2.1 Create useContextMenu hook
    - Implement state management for menu open/close and position
    - Handle right-click and long-press events
    - Add Escape key listener for closing menu
    - Export openMenu, closeMenu, isOpen, and position
    - _Requirements: 2.1, 2.3, 2.4, 6.1_
  
  - [ ]* 2.2 Write property test for useContextMenu
    - **Property 3: Context Menu Dismissal**
    - **Validates: Requirements 2.3, 2.4, 2.6, 6.4**
  
  - [ ] 2.3 Create useOnlineStatus hook
    - Use navigator.onLine for initial state
    - Add event listeners for online/offline events
    - Return boolean isOnline state
    - _Requirements: 8.5_
  
  - [ ]* 2.4 Write unit tests for useOnlineStatus
    - Test initial online state
    - Test offline event handling
    - Test online event handling
    - _Requirements: 8.1, 8.2_
  
  - [ ] 2.5 Create useKeyboardShortcuts hook
    - Accept array of KeyboardShortcut objects
    - Add keydown event listener
    - Match key combinations and call handlers
    - Prevent default browser behavior for custom shortcuts
    - _Requirements: 9.2, 9.3, 9.4, 9.6_
  
  - [ ]* 2.6 Write property test for useKeyboardShortcuts
    - **Property 21: Custom Keyboard Shortcut Prevention**
    - **Validates: Requirements 9.6**

- [ ] 3. Create Breadcrumb component
  - [ ] 3.1 Implement Breadcrumb component with TypeScript interfaces
    - Create BreadcrumbItem interface (label, path, icon)
    - Render breadcrumb items with separators using Lucide icons
    - Implement click navigation using React Router
    - Add responsive behavior: collapse on mobile with ellipsis
    - Style with Tailwind CSS
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 3.2 Write property test for Breadcrumb navigation
    - **Property 1: Breadcrumb Navigation**
    - **Validates: Requirements 1.3**
  
  - [ ]* 3.3 Write unit tests for Breadcrumb component
    - Test single item rendering
    - Test multiple items with separators
    - Test mobile collapse behavior
    - Test click navigation
    - _Requirements: 1.1, 1.2, 1.5_

- [ ] 4. Create ContextMenu component
  - [ ] 4.1 Implement ContextMenu component with positioning logic
    - Create ContextMenuItem interface (label, icon, onClick, disabled, variant, shortcut)
    - Implement viewport-aware positioning algorithm
    - Render menu items with icons and labels
    - Handle click outside to close using ref
    - Add keyboard navigation (Arrow keys, Enter, Escape)
    - Style with Tailwind CSS and larger touch targets on mobile
    - Add ARIA attributes (role="menu", role="menuitem")
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 6.2, 6.3, 6.4, 10.6_
  
  - [ ]* 4.2 Write property test for context menu positioning
    - **Property 4: Context Menu Viewport Positioning**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.3 Write property test for context menu keyboard navigation
    - **Property 5: Context Menu Keyboard Navigation**
    - **Validates: Requirements 2.7, 10.6**
  
  - [ ]* 4.4 Write property test for context menu view mode independence
    - **Property 6: Context Menu View Mode Independence**
    - **Validates: Requirements 2.8**
  
  - [ ]* 4.5 Write unit tests for ContextMenu component
    - Test menu opens at cursor position
    - Test menu closes on outside click
    - Test menu closes on Escape key
    - Test menu closes on action selection
    - Test positioning adjusts for viewport edges
    - Test touch target sizes on mobile
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 6.2_

- [ ] 5. Integrate ContextMenu into FilesPage
  - [ ] 5.1 Add context menu to FileCard and FileRow components
    - Use useContextMenu hook
    - Add onContextMenu handler to file items
    - Add onTouchStart/onTouchEnd for long-press on mobile
    - Pass file actions (download, share, tag, version, delete) to ContextMenu
    - Prevent background scrolling when menu is open on mobile
    - _Requirements: 2.1, 2.2, 2.8, 6.1, 6.3_
  
  - [ ]* 5.2 Write property test for context menu display
    - **Property 2: Context Menu Display**
    - **Validates: Requirements 2.1, 2.2, 6.1**
  
  - [ ]* 5.3 Write integration tests for context menu in FilesPage
    - Test right-click on file shows menu
    - Test long-press on mobile shows menu
    - Test menu actions execute correctly
    - _Requirements: 2.1, 2.6, 6.1_

- [ ] 6. Checkpoint - Ensure breadcrumb and context menu work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Enhance FilePreviewModal with additional format support
  - [ ] 7.1 Create preview renderer components
    - Create AudioPreviewRenderer with HTML5 audio player
    - Create MarkdownPreviewRenderer using react-markdown
    - Create CodePreviewRenderer using react-syntax-highlighter
    - Create TextPreviewRenderer with monospace formatting
    - Implement language detection function for code files
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.10_
  
  - [ ]* 7.2 Write property test for file preview format support
    - **Property 8: File Preview Format Support**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  
  - [ ]* 7.3 Write property test for code language detection
    - **Property 13: Code Language Detection**
    - **Validates: Requirements 4.10**
  
  - [ ] 7.4 Update FilePreviewModal to use preview renderers
    - Add loading state with spinner
    - Add error state with download fallback
    - Integrate preview renderers based on file type
    - Ensure modal is responsive on mobile
    - Add Escape key handler to close modal
    - Display file metadata (size, type, date, encryption)
    - _Requirements: 4.5, 4.6, 4.7, 4.8, 4.9_
  
  - [ ]* 7.5 Write property test for preview loading states
    - **Property 9: Preview Loading States**
    - **Validates: Requirements 4.5, 4.6**
  
  - [ ]* 7.6 Write property test for preview modal responsiveness
    - **Property 10: Preview Modal Responsiveness**
    - **Validates: Requirements 4.7, 5.6**
  
  - [ ]* 7.7 Write property test for preview metadata display
    - **Property 12: Preview Metadata Display**
    - **Validates: Requirements 4.9**
  
  - [ ]* 7.8 Write unit tests for preview renderers
    - Test audio preview renders player
    - Test markdown preview renders formatted content
    - Test code preview applies syntax highlighting
    - Test text preview displays content
    - Test error state shows download button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

- [ ] 8. Create PWA components
  - [ ] 8.1 Create InstallPWAPrompt component
    - Track visit count in localStorage
    - Show prompt after 3rd visit if not dismissed
    - Implement dismiss functionality with localStorage persistence
    - Add install button that triggers beforeinstallprompt event
    - Style as bottom banner with Tailwind CSS
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 8.2 Write property test for PWA preferences persistence
    - **Property 18: PWA Preferences Persistence**
    - **Validates: Requirements 7.5**
  
  - [ ]* 8.3 Write unit tests for InstallPWAPrompt
    - Test prompt shows after 3 visits
    - Test prompt dismisses and doesn't reappear
    - Test install button triggers browser prompt
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ] 8.4 Create OfflineIndicator component
    - Use useOnlineStatus hook
    - Display banner at top when offline
    - Hide banner when online
    - Add slide-in/out animation
    - Style with Tailwind CSS
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 8.5 Write unit tests for OfflineIndicator
    - Test indicator shows when offline
    - Test indicator hides when online
    - _Requirements: 8.1, 8.2_
  
  - [ ] 8.6 Implement network-dependent action disabling
    - Use useOnlineStatus hook in FilesPage
    - Disable upload, download, share, delete when offline
    - Show tooltip explaining offline status
    - _Requirements: 8.4_
  
  - [ ]* 8.7 Write property test for network-dependent action disabling
    - **Property 19: Network-Dependent Action Disabling**
    - **Validates: Requirements 8.4**

- [ ] 9. Integrate PWA components into app
  - [ ] 9.1 Add InstallPWAPrompt to App.tsx or DashboardLayout
    - Import and render InstallPWAPrompt
    - Handle beforeinstallprompt event
    - Track installation state
    - _Requirements: 3.3, 7.1_
  
  - [ ] 9.2 Add OfflineIndicator to App.tsx or DashboardLayout
    - Import and render OfflineIndicator at top level
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 9.3 Write integration tests for PWA features
    - Test service worker registration
    - Test manifest.json validity
    - Test install prompt flow
    - Test offline indicator behavior
    - _Requirements: 3.1, 3.2, 3.3, 8.1, 8.2_

- [ ] 10. Checkpoint - Ensure PWA and enhanced previews work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement mobile responsiveness improvements
  - [ ] 11.1 Update FilesPage for mobile optimization
    - Ensure all buttons meet 44x44px minimum touch target
    - Stack action buttons vertically on mobile
    - Optimize file upload area for touch
    - Ensure no horizontal scrolling on mobile
    - Test viewport widths from 320px to 768px
    - _Requirements: 5.1, 5.7, 5.8, 5.12_
  
  - [ ]* 11.2 Write property test for touch target minimum size
    - **Property 14: Touch Target Minimum Size**
    - **Validates: Requirements 5.1, 6.2**
  
  - [ ]* 11.3 Write property test for mobile layout adaptation
    - **Property 15: Mobile Layout Adaptation**
    - **Validates: Requirements 5.2, 5.4, 5.8, 5.11**
  
  - [ ] 11.4 Update DashboardPage for mobile optimization
    - Change stats grid to single column on mobile
    - Ensure cards stack properly
    - Optimize spacing for touch
    - _Requirements: 5.2, 5.4, 5.9_
  
  - [ ]* 11.5 Write unit tests for mobile dashboard layout
    - Test single column grid on mobile
    - Test card stacking
    - _Requirements: 5.9_
  
  - [ ] 11.6 Update DashboardLayout for mobile navigation
    - Add hamburger menu for mobile
    - Ensure navigation is touch-friendly
    - Hide/collapse less critical elements on mobile
    - _Requirements: 5.5, 5.11_
  
  - [ ]* 11.7 Write unit test for mobile hamburger menu
    - Test hamburger menu appears on mobile
    - Test menu opens and closes
    - _Requirements: 5.5_
  
  - [ ] 11.8 Implement responsive typography
    - Update Tailwind config for responsive font sizes
    - Ensure text scales appropriately on mobile
    - Test readability at various viewport sizes
    - _Requirements: 5.3, 5.12_
  
  - [ ]* 11.9 Write property test for responsive typography
    - **Property 16: Responsive Typography**
    - **Validates: Requirements 5.3, 5.12**

- [ ] 12. Implement keyboard shortcuts and accessibility
  - [ ] 12.1 Create KeyboardShortcutsHelp component
    - Display modal with list of all shortcuts
    - Show shortcut key combinations and descriptions
    - Open on "?" or "Shift+/" key press
    - Close on Escape key
    - Style with Tailwind CSS
    - _Requirements: 9.1, 9.5_
  
  - [ ]* 12.2 Write unit tests for KeyboardShortcutsHelp
    - Test modal opens on "?" key
    - Test modal displays all shortcuts
    - Test modal closes on Escape
    - _Requirements: 9.1, 9.5_
  
  - [ ] 12.3 Implement global keyboard shortcuts
    - Use useKeyboardShortcuts hook in App.tsx or DashboardLayout
    - Add Escape to close modals and context menus
    - Add Ctrl/Cmd+K to focus search input
    - Add Ctrl/Cmd+U to trigger file upload
    - Add "?" to show keyboard shortcuts help
    - _Requirements: 9.2, 9.3, 9.4_
  
  - [ ]* 12.4 Write property test for overlay escape key dismissal
    - **Property 20: Overlay Escape Key Dismissal**
    - **Validates: Requirements 9.2**
  
  - [ ]* 12.5 Write unit tests for global keyboard shortcuts
    - Test Ctrl/Cmd+K focuses search
    - Test Ctrl/Cmd+U triggers upload
    - Test "?" shows help modal
    - _Requirements: 9.3, 9.4, 9.1_
  
  - [ ] 12.6 Add ARIA labels to interactive elements
    - Add aria-label to buttons without text
    - Add aria-label to icon-only buttons
    - Add aria-describedby for tooltips
    - Ensure all images have alt text
    - _Requirements: 10.1, 10.5_
  
  - [ ]* 12.7 Write property test for interactive element ARIA labels
    - **Property 22: Interactive Element ARIA Labels**
    - **Validates: Requirements 10.1**
  
  - [ ]* 12.8 Write property test for image alt text
    - **Property 24: Image Alt Text**
    - **Validates: Requirements 10.5**
  
  - [ ] 12.9 Implement modal focus management
    - Add focus trap to all modals (FilePreviewModal, FileShareModal, etc.)
    - Store triggering element reference
    - Focus first interactive element on modal open
    - Return focus to trigger on modal close
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [ ]* 12.10 Write property test for modal focus management
    - **Property 23: Modal Focus Management**
    - **Validates: Requirements 10.2, 10.3, 10.4**
  
  - [ ] 12.11 Ensure logical tab order
    - Review tab order across all pages
    - Adjust DOM order if needed for logical flow
    - Test keyboard navigation through all interactive elements
    - _Requirements: 10.7_
  
  - [ ]* 12.12 Write property test for logical tab order
    - **Property 25: Logical Tab Order**
    - **Validates: Requirements 10.7**
  
  - [ ] 12.13 Verify color contrast compliance
    - Audit all text/background color combinations
    - Ensure 4.5:1 contrast for normal text
    - Ensure 3:1 contrast for large text
    - Update colors in Tailwind config if needed
    - _Requirements: 10.8_
  
  - [ ]* 12.14 Write property test for color contrast compliance
    - **Property 26: Color Contrast Compliance**
    - **Validates: Requirements 10.8**

- [ ] 13. Add Breadcrumb to FilesPage
  - [ ] 13.1 Integrate Breadcrumb component into FilesPage
    - Import Breadcrumb component
    - Create breadcrumb items array (Home, Files)
    - Render Breadcrumb at top of page
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 13.2 Write integration test for breadcrumb in FilesPage
    - Test breadcrumb renders on Files page
    - Test breadcrumb navigation works
    - _Requirements: 1.1, 1.3_

- [ ] 14. Final integration and testing
  - [ ] 14.1 Test PWA installation flow end-to-end
    - Test on Chrome desktop
    - Test on Chrome mobile
    - Test on Safari iOS
    - Verify offline functionality
    - _Requirements: 3.3, 3.4, 3.9_
  
  - [ ] 14.2 Test mobile responsiveness on real devices
    - Test on iPhone (various sizes)
    - Test on Android phone
    - Test on tablet
    - Verify touch interactions
    - Verify no horizontal scrolling
    - _Requirements: 5.1, 5.2, 5.12_
  
  - [ ] 14.3 Run accessibility audit
    - Run Lighthouse accessibility audit
    - Run axe DevTools scan
    - Test with screen reader (VoiceOver/NVDA)
    - Test keyboard-only navigation
    - Fix any issues found
    - _Requirements: 10.1, 10.2, 10.5, 10.7, 10.8_
  
  - [ ]* 14.4 Write end-to-end integration tests
    - Test complete user flow with breadcrumbs
    - Test complete user flow with context menu
    - Test complete user flow with file preview
    - Test complete user flow with PWA installation
    - Test complete user flow on mobile
    - _Requirements: 1.3, 2.1, 2.6, 4.1, 7.1_

- [ ] 15. Final checkpoint - Ensure all Phase 9 features work
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across random inputs
- Unit tests validate specific examples, edge cases, and integration points
- PWA features require HTTPS in production (use localhost for development)
- Mobile testing should cover viewport widths from 320px to 768px
- Accessibility testing should include screen readers and keyboard-only navigation
- Service worker caching strategies are configured in vite.config.ts
- All new components should follow existing Tailwind CSS styling patterns
