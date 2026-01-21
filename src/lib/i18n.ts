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
    watchlist: "Watchlist",
    myCollection: "My Collection",
    
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
  },
  el: {
    // Navigation
    home: "Αρχική",
    movies: "Ταινίες",
    tvShows: "Σειρές",
    discover: "Ανακάλυψη",
    search: "Αναζήτηση",
    searchPlaceholder: "Αναζήτηση ταινιών, σειρών...",
    watchlist: "Λίστα Παρακολούθησης",
    myCollection: "Η Συλλογή μου",
    
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
