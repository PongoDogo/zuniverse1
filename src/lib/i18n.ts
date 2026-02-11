// Internationalization support for Greek and English

export type Language = "en" | "el";

const LANGUAGE_KEY = "cinetorrio_language";

export const translations = {
  en: {
    // Navigation
    home: "Home",
    movies: "Movies",
    tvShows: "TV Shows",
    discover: "Discover",
    search: "Search",
    searchPlaceholder: "Search movies, TV shows...",
    favorites: "Favorites",
    myCollection: "My Collection",
    
    // Favorites
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    inFavorites: "In Favorites",
    addedToFavorites: "Added to favorites",
    removedFromFavorites: "Removed from favorites",
    noFavorites: "No favorites yet",
    addFavoritesToStart: "Add movies and TV shows to your favorites",
    
    // Collection / Watched
    markAsWatched: "Mark as Watched",
    markAsUnwatched: "Remove from Collection",
    watched: "Watched",
    addedToCollection: "Added to your collection",
    removedFromCollection: "Removed from collection",
    signInToSeeCollection: "Sign in to see your collection",
    signInToSync: "Sign in to sync your watched movies and shows across devices",
    itemsWatched: "items watched",
    noWatchedItems: "No watched items yet",
    markMoviesAsWatched: "Mark movies and TV shows as watched to add them to your collection",
    browseContent: "Browse Content",
    removeFromCollection: "Remove from collection",
    all: "All",
    yourRating: "Your Rating",
    ratingUpdated: "Rating updated",
    markAsWatchedFirst: "Mark as watched first to rate",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    profile: "Profile",
    account: "Account",
    syncedToCloud: "Synced to Cloud",
    localOnly: "Local Only",
    
    // Homepage
    continueWatching: "Continue Watching",
    trendingNow: "Trending Now",
    popularMovies: "Popular Movies",
    popularTVShows: "Popular TV Shows",
    nowPlaying: "Now Playing in Theaters",
    onTheAir: "On The Air",
    topRated: "Top Rated Movies",
    pinnedFavorites: "Pinned Favorites",
    becauseYouWatched: "Because you watched",
    moreYouMightLike: "More you might like",
    
    // New Features
    genres: "Genres",
    filter: "Filter",
    randomPick: "Random Pick",
    findingSomething: "Finding...",
    scrollToTop: "Scroll to top",
    trending: "Trending",
    hot: "Hot",
    new: "New",
    statsOverview: "Your Stats",
    
    // Media details
    watchNow: "Watch Now",
    addToWatchlist: "Add to Watchlist",
    removeFromWatchlist: "Remove from Watchlist",
    pin: "Pin",
    unpin: "Unpin",
    seasons: "Seasons",
    episodes: "Episodes",
    overview: "Overview",
    cast: "Cast",
    similar: "Similar",
    
    // Player
    retry: "Retry",
    fullscreen: "Fullscreen",
    loadingPlayer: "Loading player...",
    failedToLoad: "Failed to load video",
    tryAgain: "Try Again",
    sourceTip: "Tip: If video doesn't load, try a different source from the dropdown above",
    adsBlocked: "ads blocked",
    nextEpisode: "Next Episode",
    prevEpisode: "Previous Episode",
    autoPlay: "Auto-play next",
    
    // Continue Watching
    minLeft: "min left",
    
    // Achievements
    achievements: "Achievements",
    achievementsAndStats: "Achievements & Stats",
    yourStats: "Your Stats",
    moviesCount: "Movies",
    episodesCount: "Episodes",
    seasonsCount: "Seasons",
    watchTime: "Watch Time",
    inProgress: "In Progress",
    unlocked: "Unlocked",
    startWatching: "Start watching to earn achievements!",
    
    // Themes
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    cinematicMode: "Cinematic Mode",
    
    // Profile
    profiles: "Profiles",
    addProfile: "Add Profile",
    createProfile: "Create Profile",
    deleteProfile: "Delete Profile",
    profileName: "Profile name",
    selectAvatar: "Select Avatar",
    
    // Notifications
    notifications: "Notifications",
    noNotifications: "No notifications",
    clearAll: "Clear all",
    newEpisode: "New episode available",
    
    // Quick Access
    quickAccess: "Quick Access",
    recentlyWatched: "Recently Watched",
    pinned: "Pinned",
    
    // Common
    loading: "Loading...",
    error: "Error",
    noResults: "No results found",
    viewAll: "View All",
    backToDetails: "Back to details",
    back: "Back",
    share: "Share",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    language: "Language",
    english: "English",
    greek: "Ελληνικά",
    
    // Streaming sources
    sourceCategories: {
      top: "🏆 Most Popular",
      reliable: "⭐ Reliable",
      good: "✅ Good Quality",
      alternative: "🔄 Alternative",
      backup: "💾 Backup",
    },
    
    // Footer
    poweredBy: "Powered by TMDB",
    version: "Version",
    quickLinks: "Quick Links",

    // Top 10
    topTenThisWeek: "Top 10 This Week",

    // Welcome
    welcomeBack: "Welcome back",
    itemsInCollection: "items in your collection",
    hours: "Hours",

    // Search enhanced
    searchHistory: "Recent Searches",
    trendingSearches: "Trending Searches",
    clearHistory: "Clear History",
    resultsFor: "results for",
    filterAll: "All",
    filterMovies: "Movies Only",
    filterTVShows: "TV Shows Only",

    // Discover enhanced
    sortBy: "Sort by",
    popularity: "Popularity",
    rating: "Rating",
    releaseDate: "Release Date",
    revenue: "Revenue",
    yearRange: "Year Range",
    minimumRating: "Min Rating",
    totalResults: "total results",
    loadMore: "Load More",
    selectGenre: "Select genre",

    // Collection enhanced
    sortDateWatched: "Date Watched",
    sortRating: "Rating",
    sortTitleAZ: "Title A-Z",
    sortReleaseDate: "Release Date",
    searchCollection: "Search collection...",
    gridView: "Grid",
    listView: "List",
    exportCollection: "Export",
    avgRating: "Avg Rating",
    genreBreakdown: "Genre Breakdown",

    // Favorites enhanced
    sortDateAdded: "Date Added",

    // Profile
    profilePage: "Profile",
    editDisplayName: "Edit Display Name",
    displayName: "Display Name",
    preferences: "Preferences",
    watchStatistics: "Watch Statistics",
    accountManagement: "Account Management",

    // Keyboard shortcuts
    searchShortcut: "Ctrl+K",
  },
  el: {
    // Navigation
    home: "Αρχική",
    movies: "Ταινίες",
    tvShows: "Σειρές",
    discover: "Ανακάλυψη",
    search: "Αναζήτηση",
    searchPlaceholder: "Αναζήτηση ταινιών, σειρών...",
    favorites: "Αγαπημένα",
    myCollection: "Η Συλλογή μου",
    
    // Favorites
    addToFavorites: "Προσθήκη στα Αγαπημένα",
    removeFromFavorites: "Αφαίρεση από τα Αγαπημένα",
    inFavorites: "Στα Αγαπημένα",
    addedToFavorites: "Προστέθηκε στα αγαπημένα",
    removedFromFavorites: "Αφαιρέθηκε από τα αγαπημένα",
    noFavorites: "Δεν υπάρχουν αγαπημένα",
    addFavoritesToStart: "Προσθέστε ταινίες και σειρές στα αγαπημένα σας",
    
    // Collection / Watched
    markAsWatched: "Επισήμανση ως Είδα",
    markAsUnwatched: "Αφαίρεση από τη Συλλογή",
    watched: "Το είδα",
    addedToCollection: "Προστέθηκε στη συλλογή σας",
    removedFromCollection: "Αφαιρέθηκε από τη συλλογή",
    signInToSeeCollection: "Συνδεθείτε για να δείτε τη συλλογή σας",
    signInToSync: "Συνδεθείτε για να συγχρονίσετε τις ταινίες και σειρές σας",
    itemsWatched: "στοιχεία είδατε",
    noWatchedItems: "Δεν υπάρχουν στοιχεία ακόμα",
    markMoviesAsWatched: "Επισημάνετε ταινίες και σειρές ως είδατε για να τα προσθέσετε στη συλλογή σας",
    browseContent: "Περιήγηση",
    removeFromCollection: "Αφαίρεση από τη συλλογή",
    all: "Όλα",
    yourRating: "Η Βαθμολογία σας",
    ratingUpdated: "Η βαθμολογία ενημερώθηκε",
    markAsWatchedFirst: "Επισημάνετε ως είδατε πρώτα για να βαθμολογήσετε",
    
    // Auth
    signIn: "Σύνδεση",
    signUp: "Εγγραφή",
    signOut: "Αποσύνδεση",
    profile: "Προφίλ",
    account: "Λογαριασμός",
    syncedToCloud: "Συγχρονισμένο",
    localOnly: "Μόνο Τοπικά",
    
    // Homepage
    continueWatching: "Συνέχεια Παρακολούθησης",
    trendingNow: "Δημοφιλή Τώρα",
    popularMovies: "Δημοφιλείς Ταινίες",
    popularTVShows: "Δημοφιλείς Σειρές",
    nowPlaying: "Τώρα στους Κινηματογράφους",
    onTheAir: "Τώρα στην TV",
    topRated: "Κορυφαίες Ταινίες",
    pinnedFavorites: "Καρφιτσωμένα Αγαπημένα",
    becauseYouWatched: "Επειδή είδατε",
    moreYouMightLike: "Περισσότερα που μπορεί να σας αρέσουν",
    
    // New Features
    genres: "Είδη",
    filter: "Φίλτρο",
    randomPick: "Τυχαία Επιλογή",
    findingSomething: "Ψάχνω...",
    scrollToTop: "Πάνω",
    trending: "Τάσεις",
    hot: "Δημοφιλές",
    new: "Νέο",
    statsOverview: "Τα Στατιστικά σας",
    
    // Media details
    watchNow: "Παρακολούθηση",
    addToWatchlist: "Προσθήκη στη Λίστα",
    removeFromWatchlist: "Αφαίρεση από τη Λίστα",
    pin: "Καρφίτσωμα",
    unpin: "Ξεκαρφίτσωμα",
    seasons: "Σεζόν",
    episodes: "Επεισόδια",
    overview: "Περίληψη",
    cast: "Ηθοποιοί",
    similar: "Παρόμοιες",
    
    // Player
    retry: "Επανάληψη",
    fullscreen: "Πλήρης Οθόνη",
    loadingPlayer: "Φόρτωση player...",
    failedToLoad: "Αποτυχία φόρτωσης βίντεο",
    tryAgain: "Δοκιμάστε Ξανά",
    sourceTip: "Συμβουλή: Αν το βίντεο δεν φορτώνει, δοκιμάστε διαφορετική πηγή",
    adsBlocked: "διαφημίσεις μπλοκαρισμένες",
    nextEpisode: "Επόμενο Επεισόδιο",
    prevEpisode: "Προηγούμενο Επεισόδιο",
    autoPlay: "Αυτόματη αναπαραγωγή",
    
    // Continue Watching
    minLeft: "λεπτά απομένουν",
    
    // Achievements
    achievements: "Επιτεύγματα",
    achievementsAndStats: "Επιτεύγματα & Στατιστικά",
    yourStats: "Τα Στατιστικά σας",
    moviesCount: "Ταινίες",
    episodesCount: "Επεισόδια",
    seasonsCount: "Σεζόν",
    watchTime: "Χρόνος Παρακολούθησης",
    inProgress: "Σε Εξέλιξη",
    unlocked: "Ξεκλείδωτα",
    startWatching: "Ξεκινήστε να βλέπετε για να κερδίσετε επιτεύγματα!",
    
    // Themes
    theme: "Θέμα",
    darkMode: "Σκοτεινή Λειτουργία",
    lightMode: "Φωτεινή Λειτουργία",
    cinematicMode: "Κινηματογραφική Λειτουργία",
    
    // Profile
    profiles: "Προφίλ",
    addProfile: "Προσθήκη Προφίλ",
    createProfile: "Δημιουργία Προφίλ",
    deleteProfile: "Διαγραφή Προφίλ",
    profileName: "Όνομα προφίλ",
    selectAvatar: "Επιλογή Avatar",
    
    // Notifications
    notifications: "Ειδοποιήσεις",
    noNotifications: "Καμία ειδοποίηση",
    clearAll: "Καθαρισμός όλων",
    newEpisode: "Νέο επεισόδιο διαθέσιμο",
    
    // Quick Access
    quickAccess: "Γρήγορη Πρόσβαση",
    recentlyWatched: "Πρόσφατα",
    pinned: "Καρφιτσωμένα",
    
    // Common
    loading: "Φόρτωση...",
    error: "Σφάλμα",
    noResults: "Δεν βρέθηκαν αποτελέσματα",
    viewAll: "Προβολή Όλων",
    backToDetails: "Πίσω στις λεπτομέρειες",
    back: "Πίσω",
    share: "Κοινοποίηση",
    save: "Αποθήκευση",
    cancel: "Ακύρωση",
    close: "Κλείσιμο",
    language: "Γλώσσα",
    english: "English",
    greek: "Ελληνικά",
    
    // Streaming sources
    sourceCategories: {
      top: "🏆 Πιο Δημοφιλή",
      reliable: "⭐ Αξιόπιστα",
      good: "✅ Καλή Ποιότητα",
      alternative: "🔄 Εναλλακτικά",
      backup: "💾 Εφεδρικά",
    },
    
    // Footer
    poweredBy: "Με την υποστήριξη του TMDB",
    version: "Έκδοση",
    quickLinks: "Γρήγοροι Σύνδεσμοι",

    // Top 10
    topTenThisWeek: "Top 10 αυτή την Εβδομάδα",

    // Welcome
    welcomeBack: "Καλώς ήρθες",
    itemsInCollection: "στοιχεία στη συλλογή σου",
    hours: "Ώρες",

    // Search enhanced
    searchHistory: "Πρόσφατες Αναζητήσεις",
    trendingSearches: "Δημοφιλείς Αναζητήσεις",
    clearHistory: "Καθαρισμός",
    resultsFor: "αποτελέσματα για",
    filterAll: "Όλα",
    filterMovies: "Μόνο Ταινίες",
    filterTVShows: "Μόνο Σειρές",

    // Discover enhanced
    sortBy: "Ταξινόμηση",
    popularity: "Δημοτικότητα",
    rating: "Βαθμολογία",
    releaseDate: "Ημερομηνία",
    revenue: "Έσοδα",
    yearRange: "Εύρος Ετών",
    minimumRating: "Ελάχιστη Βαθμολογία",
    totalResults: "συνολικά αποτελέσματα",
    loadMore: "Φόρτωσε Περισσότερα",
    selectGenre: "Επιλέξτε είδος",

    // Collection enhanced
    sortDateWatched: "Ημ. Παρακολούθησης",
    sortRating: "Βαθμολογία",
    sortTitleAZ: "Τίτλος Α-Ω",
    sortReleaseDate: "Ημ. Κυκλοφορίας",
    searchCollection: "Αναζήτηση στη συλλογή...",
    gridView: "Πλέγμα",
    listView: "Λίστα",
    exportCollection: "Εξαγωγή",
    avgRating: "Μέση Βαθμολογία",
    genreBreakdown: "Είδη",

    // Favorites enhanced
    sortDateAdded: "Ημ. Προσθήκης",

    // Profile
    profilePage: "Προφίλ",
    editDisplayName: "Επεξεργασία Ονόματος",
    displayName: "Εμφανιζόμενο Όνομα",
    preferences: "Προτιμήσεις",
    watchStatistics: "Στατιστικά Παρακολούθησης",
    accountManagement: "Διαχείριση Λογαριασμού",

    // Keyboard shortcuts
    searchShortcut: "Ctrl+K",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export const getLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "en" || saved === "el") {
      return saved;
    }
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("el")) {
      return "el";
    }
  } catch {}
  return "en";
};

export const setLanguage = (lang: Language): void => {
  localStorage.setItem(LANGUAGE_KEY, lang);
  // Dispatch event for components to update
  window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }));
};

export const t = (key: TranslationKey, lang?: Language): string => {
  const currentLang = lang || getLanguage();
  return translations[currentLang][key] as string;
};

// Hook-friendly translation getter
export const getTranslations = (lang: Language) => translations[lang];
