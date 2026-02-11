
# CineTorrio Mega Upgrade Plan

This is a comprehensive overhaul touching every aspect of the app -- UI polish, new features, performance, and quality-of-life improvements.

---

## Phase 1: Homepage and UI Polish

### 1.1 Homepage Improvements
- Add a "Welcome Back" greeting section showing user name and quick stats when signed in
- Add a "Top 10 This Week" numbered row with rank badges (like Netflix's Top 10)
- Improve the StatsWidget with animated counters and better visual hierarchy
- Add a "Recently Added to Collection" mini-row on homepage showing last 5 watched items
- Make the footer more informative with version number, quick links, and social links

### 1.2 Global UI Improvements
- Add smooth page transition animations between routes using framer-motion
- Improve the Navbar with a search keyboard shortcut hint (Ctrl+K)
- Add a "Back to Top" floating button with smooth scroll
- Improve loading skeletons across all pages for better perceived performance
- Fix the MediaCard to show a "Watched" badge overlay when item is in collection

---

## Phase 2: New Pages and Features

### 2.1 Profile/Account Page (New)
- Create a dedicated `/profile` page showing:
  - User avatar, email, and display name
  - Editable display name field
  - Theme, language, and layout preferences all in one place
  - Watch statistics dashboard with visual charts (using recharts)
  - Achievement showcase grid
  - Account management (sign out, etc.)

### 2.2 Enhanced Discover Page
- Add sort options: Popularity, Rating, Release Date, Revenue
- Add year range filter (slider)
- Add rating filter (minimum rating)
- Show total results count
- Add "infinite scroll" style loading (load more button) instead of pagination numbers

### 2.3 Enhanced Search Page
- Add search history (last 5 searches stored locally)
- Add trending searches suggestions when search is empty
- Add media type filter tabs (All, Movies, TV Shows)
- Show search result count with better formatting
- i18n support for all search page text

### 2.4 Enhanced Movies and TV Shows Pages
- Add hero banner at top of each page featuring a highlighted item
- Add genre quick-filter chips at the top
- Add "Airing Today" row for TV Shows page
- Add sort/view toggle (grid vs compact list)
- i18n support for all hardcoded text

---

## Phase 3: Player and Watch Experience

### 3.1 Watch Page Improvements
- Add auto-play next episode toggle with countdown timer (10 seconds)
- Add keyboard shortcuts: Space (play/pause iframe focus), F (fullscreen), N (next episode)
- Show episode thumbnails in the episode grid
- Add "You might also like" recommendations below similar content
- Show user's rating inline on watch page if item is in collection

### 3.2 Video Player Enhancements
- Add picture-in-picture support button
- Add a "Report broken source" button
- Show source quality indicator (when available)
- Improve the source selector with search/filter for 65+ sources
- Add source favorites (remember user's top 3 preferred sources)

---

## Phase 4: Collection and Favorites Enhancements

### 4.1 Collection Page Upgrade
- Add sort options: Date Watched, Rating, Title A-Z, Release Date
- Add search/filter within collection
- Add view mode toggle: Grid (current) vs List view with more details
- Add bulk actions: Select multiple, remove selected
- Show collection statistics at the top: avg rating, total items, genre breakdown
- Add "Export Collection" as JSON for backup

### 4.2 Favorites Page Upgrade
- Add sort options: Date Added, Title A-Z, Rating
- Add drag-to-reorder functionality
- Show a "Suggested for You" section based on favorited genres

---

## Phase 5: Data and Performance

### 5.1 Performance Optimizations
- Add React.lazy() and Suspense for route-level code splitting
- Implement virtual scrolling for large collection/favorites lists
- Add image preloading for hero banner next slides
- Optimize re-renders in MediaCard with better memoization
- Add service worker cache strategies for TMDB API responses

### 5.2 Data Improvements
- Add error boundaries around major sections
- Add retry logic with exponential backoff for failed API calls
- Add a "Last synced" timestamp display
- Improve offline support: cache collection data locally as fallback

---

## Phase 6: New Utility Features

### 6.1 Keyboard Shortcuts
- Ctrl+K or / to open search
- Escape to close modals and menus
- Arrow keys to navigate media rows

### 6.2 Share Improvements
- Generate shareable collection links
- Add "Copy movie/show link" with rich preview text
- Deep link support for direct movie/show sharing

### 6.3 Notification System Upgrade
- Add push notification permission request
- Notify when CineVault adds new items to shared collection
- Weekly digest notification with watch statistics

---

## Technical Details

### New Files to Create
- `src/pages/Profile.tsx` -- User profile and settings page
- `src/components/TopTenRow.tsx` -- Numbered trending row component
- `src/components/CollectionStats.tsx` -- Collection statistics display
- `src/components/SearchHistory.tsx` -- Recent searches component
- `src/components/AutoPlayCountdown.tsx` -- Next episode countdown
- `src/components/PageTransition.tsx` -- Route transition wrapper
- `src/components/WatchedBadge.tsx` -- Overlay badge for watched items

### Files to Modify
- `src/App.tsx` -- Add Profile route, page transitions, code splitting
- `src/pages/Index.tsx` -- Welcome section, Top 10 row, recently watched
- `src/pages/Search.tsx` -- Search history, filters, i18n
- `src/pages/Movies.tsx` -- Hero banner, genre chips, i18n
- `src/pages/TVShows.tsx` -- Hero banner, genre chips, airing today, i18n
- `src/pages/Discover.tsx` -- Sort options, filters, i18n
- `src/pages/Watch.tsx` -- Auto-play, keyboard shortcuts, rating display
- `src/pages/Collection.tsx` -- Sort, search, view modes, stats, export
- `src/pages/Favorites.tsx` -- Sort, reorder, suggestions
- `src/components/Navbar.tsx` -- Profile link, Ctrl+K hint, keyboard shortcut
- `src/components/MediaCard.tsx` -- Watched badge overlay
- `src/components/VideoPlayer.tsx` -- PiP, report broken, source favorites
- `src/components/HeroBanner.tsx` -- Update to use favorites instead of watchlist
- `src/components/StreamingSourceSelector.tsx` -- Search/filter, favorites
- `src/lib/i18n.ts` -- All new translation keys (EN + EL)
- `src/lib/tmdb.ts` -- Add discover with filters, airing today
- `src/index.css` -- Page transition animations, new utility classes

### Database Changes
- None required -- all new features work with existing schema or localStorage

### Dependencies
- No new dependencies needed -- recharts, framer-motion, and all UI components are already installed

---

## Estimated Scope
- ~15 files modified
- ~7 new files created
- ~2000 lines of new/updated code
- Full i18n coverage for all new strings
- Zero breaking changes to existing CineVault sync
