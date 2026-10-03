import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MediaItem,
  MediaCategory,
  Character,
  UserLibraryEntry,
  MangaReadingHistoryItem,
  AnimeWatchHistoryItem,
  RecentActivityItem,
  FilterOptions,
  LibraryStatus,
  SettingsState,
  AccentColorKey,
  NavTab,
  ReleaseNotification,
} from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { normalizeMediaStatus } from '../utils/libraryStatus';

export type { NavTab };

export const ACCENT_COLOR_MAP: Record<AccentColorKey, { bg: string; text: string; hex: string }> = {
  Purple: { bg: 'bg-[#a755f7]', text: 'text-[#a755f7]', hex: '#a755f7' },
  Blue: { bg: 'bg-[#4d9dfe]', text: 'text-[#4d9dfe]', hex: '#4d9dfe' },
  Teal: { bg: 'bg-[#2dd4c0]', text: 'text-[#2dd4c0]', hex: '#2dd4c0' },
  Emerald: { bg: 'bg-[#43d279]', text: 'text-[#43d279]', hex: '#43d279' },
  Amber: { bg: 'bg-[#ffb84c]', text: 'text-[#ffb84c]', hex: '#ffb84c' },
  Coral: { bg: 'bg-[#fe7966]', text: 'text-[#fe7966]', hex: '#fe7966' },
  Rose: { bg: 'bg-[#fe6b9b]', text: 'text-[#fe6b9b]', hex: '#fe6b9b' },
  Red: { bg: 'bg-[#ee4445]', text: 'text-[#ee4445]', hex: '#ee4445' },
  Lime: { bg: 'bg-[#a3e637]', text: 'text-[#a3e637]', hex: '#a3e637' },
};

export const DEFAULT_SETTINGS: SettingsState = {
  appLanguage: 'English',
  appHaptics: true,
  deviceNotifications: true,
  dns: 'Cloudflare',
  enableTrailers: true,
  trailersStartMuted: true,
  cacheLimit: 'Balanced',
  pureBlackMode: true,
  accentColor: 'Purple',
  enableLiquidGlass: true,
  glassBlur: 0,
  glassSaturation: 75,
  glassRefraction: 0,
  glassTint: 12,
  homepageMetadata: 'Auto',
  titleLanguage: 'English',
  ratingFormat: '10-Point · 1 Decimal Place',
  showLibraryProgress: true,
  fillerList: true,
  gestures: true,
  ambientLight: true,
  autoSkipFiller: true,
  sleepTimer: 'Off',
  videoQuality: 'Auto',
  audioPreference: 'Japanese',
  subtitleLanguage: 'English',
  subtitlePreference: 'Automatic',
  subtitleFont: 'Netflix Sans',
  subtitleSize: 15,
  subtitleElevation: -10,
  subtitleTextColor: 'White',
  subtitleEdgeStyle: 'Drop Shadow',
  subtitleEdgeColor: 'Black',
  subtitleBackground: 'Soft Scrim',
  playbackSpeed: '1x',
  mangaReaderMode: 'Paged',
  pageTurnAnimation: 'Default',
  pagedReaderDirection: 'Left to Right',
  imageScale: 'Fit',
  zoomStart: 'Auto',
  tapNavigation: 'Edges',
  readerBackground: 'Black',
  cropBorders: false,
  webtoonCropBorders: false,
  automaticWebtoon: true,
  widePageZoom: true,
  keepScreenOn: true,
  preloadPages: 2,
  downloadPath: '',
  downloadPermissionGranted: false,
  deleteFilesByDefault: false,
};

export const INITIAL_USER_LIBRARY: UserLibraryEntry[] = [];
export const INITIAL_RECENT_ACTIVITY: RecentActivityItem[] = [];

export const DEFAULT_FILTERS: FilterOptions = {
  category: 'anime',
  query: '',
  genres: [],
  format: [],
  status: [],
  libraryState: 'Any',
  minScore: 'Any',
  scoreRange: [0, 100],
  selectedYear: 'Any',
  yearRange: [1940, 2028],
  season: [],
  studio: '',
  tagCategory: 'Theme',
  advancedTags: [],
};

interface AppContextType {
  activeCategory: MediaCategory;
  setActiveCategory: (cat: MediaCategory) => void;

  activeNav: NavTab;
  setActiveNav: (tab: NavTab) => void;

  selectedMedia: MediaItem | null;
  setSelectedMedia: (media: MediaItem | null) => void;
  openMediaDetails: (media: MediaItem) => void;
  closeMediaDetails: () => void;

  selectedCharacter: Character | null;
  setSelectedCharacter: (c: Character | null) => void;

  showWatchOrder: boolean;
  setShowWatchOrder: (show: boolean) => void;

  showEpisodeSearch: boolean;
  setShowEpisodeSearch: (show: boolean) => void;

  showAddToLibrary: boolean;
  setShowAddToLibrary: (show: boolean) => void;

  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;

  activeLibraryStatus: LibraryStatus | 'Favorites' | null;
  setActiveLibraryStatus: (status: LibraryStatus | 'Favorites' | null) => void;

  activeVideoEpisode: { media: MediaItem; episodeNumber: number } | null;
  setActiveVideoEpisode: (ep: { media: MediaItem; episodeNumber: number } | null) => void;

  activeReader: { media: MediaItem; chapterNumber: number; chapterId?: string } | null;
  setActiveReader: (r: { media: MediaItem; chapterNumber: number; chapterId?: string } | null) => void;

  // Real Manga Reading History (Independent from Profile Library)
  mangaReadingHistory: MangaReadingHistoryItem[];
  recordMangaReadingProgress: (
    media: MediaItem,
    chapterNumber: number,
    chapterId?: string,
    pageNumber?: number
  ) => void;
  removeFromMangaHistory: (mediaId: string | number) => void;
  clearMangaHistory: () => void;

  // Real Anime Watch History (Independent from Profile Library)
  animeWatchHistory: AnimeWatchHistoryItem[];
  recordAnimeWatchProgress: (
    media: MediaItem,
    episodeNumber: number,
    currentTime?: number,
    duration?: number
  ) => void;
  removeFromAnimeHistory: (mediaId: string | number) => void;
  clearAnimeHistory: () => void;

  // Personal Library state (Watching, Reading, Planning, Completed, Dropped)
  userLibrary: UserLibraryEntry[];
  addToLibrary: (media: MediaItem, status: LibraryStatus) => void;
  removeFromLibrary: (mediaId: string | number) => void;
  updateLibraryProgress: (mediaId: string | number, progress: number) => void;
  getLibraryEntry: (mediaId: string | number) => UserLibraryEntry | undefined;

  // Independent Favorites state (strictly profile favorites, not saved as a library status)
  userFavorites: MediaItem[];
  isMediaFavorite: (mediaId: string | number) => boolean;
  toggleFavorite: (media: MediaItem) => void;
  // Airing Anime Release Notifications
  subscribedAnimeAlerts: MediaItem[];
  isAnimeAlertSubscribed: (mediaId: string | number) => boolean;
  toggleAnimeAlert: (media: MediaItem) => boolean;
  releaseNotifications: ReleaseNotification[];
  deleteReleaseNotification: (notificationId: string) => void;
  // Community tab unread indicator
  hasCommunityUnreadUpdate: boolean;
  markCommunityAsRead: () => void;
  triggerCommunityUpdate: () => void;

  recentActivity: RecentActivityItem[];

  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;

  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;

  settingsSubPage: string | null;
  setSettingsSubPage: (page: string | null) => void;

  settingsActiveModal: string | null;
  setSettingsActiveModal: (modal: string | null) => void;

  isProfileSheetOpen: boolean;
  setIsProfileSheetOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState<MediaCategory>('anime');
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showWatchOrder, setShowWatchOrder] = useState<boolean>(false);
  const [showEpisodeSearch, setShowEpisodeSearch] = useState<boolean>(false);
  const [showAddToLibrary, setShowAddToLibrary] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [activeLibraryStatus, setActiveLibraryStatus] = useState<LibraryStatus | 'Favorites' | null>(null);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState<boolean>(false);

  const [activeVideoEpisode, setActiveVideoEpisode] = useState<{ media: MediaItem; episodeNumber: number } | null>(null);
  const [activeReader, setActiveReader] = useState<{ media: MediaItem; chapterNumber: number; chapterId?: string } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settingsSubPage, setSettingsSubPage] = useState<string | null>(null);
  const [settingsActiveModal, setSettingsActiveModal] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  // User Library state (Watching, Reading, Planning, Completed, Dropped)
  const [userLibrary, setUserLibrary] = useState<UserLibraryEntry[]>(() => {
    const raw = safeGetItem<UserLibraryEntry[]>('satori_user_library', INITIAL_USER_LIBRARY, true);
    return raw.map((item) => ({
      ...item,
      status: normalizeMediaStatus(item.category, item.status),
    }));
  });

  // Dedicated User Favorites state (persisted independently)
  const [userFavorites, setUserFavorites] = useState<MediaItem[]>(() => {
    return safeGetItem<MediaItem[]>('satori_user_favorites', [], true);
  });

  // Dedicated Manga Reading History (persisted independently - NOT auto-added to profile userLibrary)
  const [mangaReadingHistory, setMangaReadingHistory] = useState<MangaReadingHistoryItem[]>(() => {
    return safeGetItem<MangaReadingHistoryItem[]>('satori_manga_reading_history', [], true);
  });

  // Dedicated Anime Watch History (persisted independently - NOT auto-added to profile userLibrary)
  const [animeWatchHistory, setAnimeWatchHistory] = useState<AnimeWatchHistoryItem[]>(() => {
    return safeGetItem<AnimeWatchHistoryItem[]>('satori_anime_watch_history', [], true);
  });

  // Dedicated Airing Anime Release Alerts state (persisted independently)
  const [subscribedAnimeAlerts, setSubscribedAnimeAlerts] = useState<MediaItem[]>(() => {
    return safeGetItem<MediaItem[]>('satori_anime_release_alerts', [], true);
  });

  // Episode Release Notifications for Community tab (persisted independently)
  const [releaseNotifications, setReleaseNotifications] = useState<ReleaseNotification[]>(() => {
    return safeGetItem<ReleaseNotification[]>('satori_release_notifications', [], true);
  });

  // Community tab unread dot indicator (#6de3f7)
  const [hasCommunityUnreadUpdate, setHasCommunityUnreadUpdate] = useState<boolean>(() => {
    const saved = safeGetItem<boolean | null>('satori_community_has_unread', null, true);
    return saved !== null ? saved : true;
  });

  // Recent activity
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(() => {
    return safeGetItem<RecentActivityItem[]>('satori_recent_activity', INITIAL_RECENT_ACTIVITY, true);
  });

  // Settings
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = safeGetItem<Partial<SettingsState> | null>('satori_settings', null, true);
    if (!saved) return DEFAULT_SETTINGS;
    
    // If the saved settings contain the legacy mock download path 'Internal storage/ANIFY', clear it
    const cleaned = { ...DEFAULT_SETTINGS, ...saved };
    if (cleaned.downloadPath === 'Internal storage/ANIFY') {
      cleaned.downloadPath = '';
      cleaned.downloadPermissionGranted = false;
    }
    if (!cleaned.dns || cleaned.dns === 'System Default') {
      cleaned.dns = 'Cloudflare';
    }
    if (!cleaned.cacheLimit || cleaned.cacheLimit === '2 GB') {
      cleaned.cacheLimit = 'Balanced';
    }
    if (cleaned.glassBlur === 16 && cleaned.glassSaturation === 100 && cleaned.glassRefraction === 50) {
      cleaned.glassBlur = 0;
      cleaned.glassSaturation = 75;
      cleaned.glassRefraction = 0;
      cleaned.glassTint = 12;
    }
    if (!cleaned.homepageMetadata) {
      cleaned.homepageMetadata = 'Auto';
    }
    if (!cleaned.ratingFormat) {
      cleaned.ratingFormat = '10-Point · 1 Decimal Place';
    }
    if (cleaned.autoSkipFiller === undefined) {
      cleaned.autoSkipFiller = true;
    }
    if (!cleaned.videoQuality) {
      cleaned.videoQuality = 'Auto';
    }
    if (!cleaned.subtitlePreference || cleaned.subtitlePreference === 'Softsubs') {
      cleaned.subtitlePreference = 'Automatic';
    }
    if (!cleaned.subtitleFont) {
      cleaned.subtitleFont = 'Netflix Sans';
    }
    if (cleaned.subtitleSize === undefined || cleaned.subtitleSize === 16) {
      cleaned.subtitleSize = 15;
    }
    if (cleaned.subtitleElevation === undefined || cleaned.subtitleElevation === 10) {
      cleaned.subtitleElevation = -10;
    }
    if (!cleaned.subtitleTextColor) {
      cleaned.subtitleTextColor = 'White';
    }
    if (!cleaned.subtitleEdgeStyle) {
      cleaned.subtitleEdgeStyle = 'Drop Shadow';
    }
    if (!cleaned.subtitleEdgeColor) {
      cleaned.subtitleEdgeColor = 'Black';
    }
    if (!cleaned.subtitleBackground) {
      cleaned.subtitleBackground = 'Soft Scrim';
    }
    if (!cleaned.playbackSpeed || cleaned.playbackSpeed === '1.0x') {
      cleaned.playbackSpeed = '1x';
    }
    return cleaned;
  });

  // Apply Subtitle Font and Style CSS variables to document root
  useEffect(() => {
    const fontMap: Record<string, string> = {
      System: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif',
      'Netflix Sans': '"Netflix Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      Montserrat: '"Montserrat", sans-serif',
      Satoshi: '"Satoshi", sans-serif',
      Inter: '"Inter", sans-serif',
      'Google Sans': '"Google Sans", "Product Sans", system-ui, sans-serif',
      'Chakra Petch': '"Chakra Petch", sans-serif',
      'Bebas Neue': '"Bebas Neue", cursive, sans-serif',
    };
    const resolvedFont = fontMap[settings.subtitleFont] || settings.subtitleFont || 'inherit';
    document.documentElement.style.setProperty('--subtitle-font-family', resolvedFont);

    // Subtitle Text Color
    const textColorMap: Record<string, string> = {
      White: '#ffffff',
      'Warm Yellow': '#ffe880',
      Cyan: '#80ebff',
      Lime: '#bbfe8a',
      Rose: '#fe9fbd',
      // Legacy fallbacks
      Yellow: '#ffe880',
      Green: '#bbfe8a',
    };
    document.documentElement.style.setProperty(
      '--subtitle-text-color',
      textColorMap[settings.subtitleTextColor || 'White'] || settings.subtitleTextColor || '#ffffff'
    );

    // Subtitle Background
    const bgMap: Record<string, string> = {
      Transparent: 'transparent',
      None: 'transparent',
      'Soft Scrim': 'rgba(11, 14, 19, 0.75)',
      'Semi-transparent Black': 'rgba(11, 14, 19, 0.75)',
      'Solid Black': '#020306',
      'Semi-transparent Dark': 'rgba(18, 26, 36, 0.8)',
      'Solid White': '#ffffff',
      'Semi-transparent White': 'rgba(255, 255, 255, 0.75)',
    };
    document.documentElement.style.setProperty(
      '--subtitle-bg-color',
      bgMap[settings.subtitleBackground || 'Soft Scrim'] || 'rgba(11, 14, 19, 0.75)'
    );

    // Subtitle Edge Style and Color
    const edgeColorMap: Record<string, string> = {
      Black: '#000000',
      Graphite: '#1b1e23',
      White: '#ffffff',
      'Semi-transparent Black': 'rgba(0, 0, 0, 0.6)',
      'Dark Gray': '#222222',
      Red: '#f44336',
      Yellow: '#ffeb3b',
      Cyan: '#00bcd4',
      Blue: '#2196f3',
    };
    const resolvedEdgeColor = edgeColorMap[settings.subtitleEdgeColor || 'Black'] || '#000000';
    let textShadow = 'none';
    const edgeStyle = settings.subtitleEdgeStyle || 'Drop Shadow';
    if (edgeStyle === 'Drop Shadow') {
      textShadow = `0 2px 4px ${resolvedEdgeColor}`;
    } else if (edgeStyle === 'Outline') {
      textShadow = `-1px -1px 0 ${resolvedEdgeColor}, 1px -1px 0 ${resolvedEdgeColor}, -1px 1px 0 ${resolvedEdgeColor}, 1px 1px 0 ${resolvedEdgeColor}`;
    } else if (edgeStyle === 'Raised') {
      textShadow = `0 1px 2px ${resolvedEdgeColor}, 0 2px 3px ${resolvedEdgeColor}`;
    } else if (edgeStyle === 'Depressed') {
      textShadow = `0 -1px 2px ${resolvedEdgeColor}, 0 -2px 3px ${resolvedEdgeColor}`;
    }
    document.documentElement.style.setProperty('--subtitle-edge-shadow', textShadow);
  }, [
    settings.subtitleFont,
    settings.subtitleTextColor,
    settings.subtitleEdgeStyle,
    settings.subtitleEdgeColor,
    settings.subtitleBackground,
  ]);

  useEffect(() => {
    safeSetItem('satori_user_library', userLibrary, true);
  }, [userLibrary]);

  useEffect(() => {
    safeSetItem('satori_user_favorites', userFavorites, true);
  }, [userFavorites]);

  useEffect(() => {
    safeSetItem('satori_manga_reading_history', mangaReadingHistory, true);
  }, [mangaReadingHistory]);

  useEffect(() => {
    safeSetItem('satori_anime_watch_history', animeWatchHistory, true);
  }, [animeWatchHistory]);

  useEffect(() => {
    safeSetItem('satori_anime_release_alerts', subscribedAnimeAlerts, true);
  }, [subscribedAnimeAlerts]);

  useEffect(() => {
    safeSetItem('satori_release_notifications', releaseNotifications, true);
  }, [releaseNotifications]);

  useEffect(() => {
    safeSetItem('satori_community_has_unread', hasCommunityUnreadUpdate, true);
  }, [hasCommunityUnreadUpdate]);

  useEffect(() => {
    safeSetItem('satori_recent_activity', recentActivity, true);
  }, [recentActivity]);

  useEffect(() => {
    safeSetItem('satori_settings', settings, true);
  }, [settings]);

  // Sleep Timer countdown & automatic expiration to 'Off'
  useEffect(() => {
    const timerSetting = settings.sleepTimer;
    if (
      !timerSetting ||
      timerSetting.toLowerCase() === 'off' ||
      timerSetting.toLowerCase() === 'end of episode'
    ) {
      return;
    }

    const match = timerSetting.match(/^(\d+)\s*minutes?$/i);
    if (!match) return;

    const minutes = parseInt(match[1], 10);
    if (isNaN(minutes) || minutes <= 0) return;

    let timeoutId: NodeJS.Timeout;

    const startTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Pause any active playing media
        try {
          const mediaElements = document.querySelectorAll('video, audio');
          mediaElements.forEach((el) => {
            if (el instanceof HTMLMediaElement && !el.paused) {
              el.pause();
            }
          });
        } catch {
          // ignore
        }

        // Automatically switch Sleep Timer card and setting back to 'Off'
        setSettings((prev) => ({ ...prev, sleepTimer: 'Off' }));
        showToast('Sleep timer expired. Timer turned Off.');
      }, minutes * 60 * 1000);
    };

    startTimer();

    // Interaction restarts the countdown (as specified in helper text)
    const handleInteraction = () => {
      startTimer();
    };

    window.addEventListener('pointerdown', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [settings.sleepTimer]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const openMediaDetails = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const closeMediaDetails = () => {
    setSelectedMedia(null);
  };

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, category: activeCategory });
  };

  const addToLibrary = (media: MediaItem, status: LibraryStatus) => {
    const normalizedStatus = normalizeMediaStatus(media.category, status);

    setUserLibrary((prev) => {
      const existingIdx = prev.findIndex((item) => String(item.mediaId) === String(media.id));
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          category: media.category,
          status: normalizedStatus,
          lastUpdated: 'Just now',
        };
        return updated;
      }
      const isFav = userFavorites.some((f) => String(f.id) === String(media.id));
      const existingHistory =
        media.category === 'anime'
          ? animeWatchHistory.find((item) => String(item.mediaId) === String(media.id))?.lastWatchedEpisode
          : mangaReadingHistory.find((item) => String(item.mediaId) === String(media.id))?.lastReadChapter;

      const newEntry: UserLibraryEntry = {
        id: `lib-${Date.now()}`,
        mediaId: media.id,
        title: media.title,
        coverImage: media.coverImage,
        category: media.category,
        status: normalizedStatus,
        currentProgress: existingHistory !== undefined ? existingHistory : undefined,
        totalCount: media.totalEpisodes || media.totalChapters || media.totalVolumes || 12,
        lastUpdated: 'Just now',
        score: media.score,
        isFavorite: isFav,
      };
      return [newEntry, ...prev];
    });

    // Also add to recent activity
    const newAct: RecentActivityItem = {
      id: `act-${Date.now()}`,
      mediaId: media.id,
      title: media.title,
      coverImage: media.coverImage,
      type: media.category === 'anime' ? 'WATCHING' : 'READING',
      timeAgo: 'Just now',
    };
    setRecentActivity((prev) => [newAct, ...prev.filter((a) => String(a.mediaId) !== String(media.id))]);

    // Manga Reading Status Release Notification:
    // Only manga saved with 'Reading' status receive chapter release notifications in Community Releases
    if (media.category === 'manga') {
      if (normalizedStatus === 'Reading') {
        const chNum = media.totalChapters || 108;
        const mangaNotif: ReleaseNotification = {
          id: `notif_manga_${media.id}_ch${chNum}`,
          mediaId: String(media.id),
          media: media,
          title: media.title,
          coverImage: media.coverImage,
          episodeNumber: chNum,
          episodeText: `Chapter ${chNum} has released!`,
          dateLabel: 'Just now',
          timestamp: Date.now(),
        };
        setReleaseNotifications((prev) => [
          mangaNotif,
          ...prev.filter((n) => String(n.mediaId) !== String(media.id)),
        ]);
        setHasCommunityUnreadUpdate(true);
      } else {
        // Strictly remove from releases if status is NOT Reading (e.g. Completed, Planning, Dropped)
        setReleaseNotifications((prev) =>
          prev.filter((n) => String(n.mediaId) !== String(media.id))
        );
      }
    }

    showToast(`Added to ${normalizedStatus}`);
    setShowAddToLibrary(false);
  };

  const removeFromLibrary = (mediaId: string | number) => {
    setUserLibrary((prev) => prev.filter((item) => String(item.mediaId) !== String(mediaId)));
    setReleaseNotifications((prev) =>
      prev.filter((n) => String(n.mediaId) !== String(mediaId))
    );
    showToast('Removed from library');
    setShowAddToLibrary(false);
  };

  const updateLibraryProgress = (mediaId: string | number, progress: number) => {
    setUserLibrary((prev) =>
      prev.map((item) =>
        String(item.mediaId) === String(mediaId)
          ? { ...item, currentProgress: progress, lastUpdated: 'Just now' }
          : item
      )
    );
  };

  const recordMangaReadingProgress = (
    media: MediaItem,
    chapterNumber: number,
    chapterId?: string,
    pageNumber?: number
  ) => {
    // 1. Record / update dedicated manga reading history (most recent first)
    setMangaReadingHistory((prev) => {
      const existing = prev.find((item) => String(item.mediaId) === String(media.id));
      const entry: MangaReadingHistoryItem = {
        id: `mhist-${media.id}`,
        mediaId: media.id,
        title: media.title,
        coverImage: media.coverImage,
        bannerImage: media.bannerImage,
        category: media.category,
        lastReadChapter: chapterNumber,
        lastReadChapterId: chapterId || existing?.lastReadChapterId,
        lastReadPage: pageNumber || existing?.lastReadPage || 1,
        lastReadTime: Date.now(),
        score: media.score,
        genres: media.genres,
        description: media.description,
        totalChapters: media.totalChapters,
      };
      return [entry, ...prev.filter((item) => String(item.mediaId) !== String(media.id))];
    });

    // 2. If AND ONLY IF the user manually added this manga to their library, update progress there
    setUserLibrary((prev) =>
      prev.map((item) =>
        String(item.mediaId) === String(media.id)
          ? { ...item, currentProgress: chapterNumber, lastUpdated: 'Just now' }
          : item
      )
    );

    // 3. Update recent activity text
    setRecentActivity((prev) => {
      const act: RecentActivityItem = {
        id: `act-${Date.now()}`,
        mediaId: media.id,
        title: media.title,
        coverImage: media.coverImage,
        type: 'READING',
        progressText: `Chapter ${chapterNumber}`,
        timeAgo: 'Just now',
      };
      return [act, ...prev.filter((a) => String(a.mediaId) !== String(media.id))];
    });
  };

  const removeFromMangaHistory = (mediaId: string | number) => {
    setMangaReadingHistory((prev) => prev.filter((item) => String(item.mediaId) !== String(mediaId)));
  };

  const clearMangaHistory = () => {
    setMangaReadingHistory([]);
  };

  const recordAnimeWatchProgress = (
    media: MediaItem,
    episodeNumber: number,
    currentTime?: number,
    duration?: number
  ) => {
    // 1. Record / update dedicated anime watch history (most recent first)
    setAnimeWatchHistory((prev) => {
      const existing = prev.find((item) => String(item.mediaId) === String(media.id));
      const calcPercent = duration && duration > 0 && currentTime !== undefined
        ? Math.min(100, Math.round((currentTime / duration) * 100))
        : existing?.progressPercent || 0;

      const entry: AnimeWatchHistoryItem = {
        id: `ahist-${media.id}`,
        mediaId: media.id,
        title: media.title,
        coverImage: media.coverImage,
        bannerImage: media.bannerImage,
        category: 'anime',
        lastWatchedEpisode: episodeNumber,
        lastWatchedTime: Date.now(),
        currentTime: currentTime ?? existing?.currentTime ?? 0,
        duration: duration ?? existing?.duration ?? 0,
        progressPercent: calcPercent,
        score: media.score,
        genres: media.genres,
        description: media.description,
        totalEpisodes: media.totalEpisodes,
      };
      return [entry, ...prev.filter((item) => String(item.mediaId) !== String(media.id))];
    });

    // 2. If AND ONLY IF the user manually added this anime to their library, update progress there
    setUserLibrary((prev) =>
      prev.map((item) =>
        String(item.mediaId) === String(media.id)
          ? { ...item, currentProgress: episodeNumber, lastUpdated: 'Just now' }
          : item
      )
    );

    // 3. Update recent activity text
    setRecentActivity((prev) => {
      const act: RecentActivityItem = {
        id: `act-${Date.now()}`,
        mediaId: media.id,
        title: media.title,
        coverImage: media.coverImage,
        type: 'WATCHING',
        progressText: `Episode ${episodeNumber}`,
        timeAgo: 'Just now',
      };
      return [act, ...prev.filter((a) => String(a.mediaId) !== String(media.id))];
    });
  };

  const removeFromAnimeHistory = (mediaId: string | number) => {
    setAnimeWatchHistory((prev) => prev.filter((item) => String(item.mediaId) !== String(mediaId)));
  };

  const clearAnimeHistory = () => {
    setAnimeWatchHistory([]);
  };

  const isMediaFavorite = (mediaId: string | number) => {
    return userFavorites.some((item) => String(item.id) === String(mediaId));
  };

  const toggleFavorite = (media: MediaItem) => {
    const isCurrentlyFav = userFavorites.some((i) => String(i.id) === String(media.id));

    if (isCurrentlyFav) {
      // Remove from favorites
      setUserFavorites((prev) => prev.filter((i) => String(i.id) !== String(media.id)));
      // If it exists in userLibrary, simply toggle isFavorite flag without affecting library status
      setUserLibrary((prev) =>
        prev.map((i) =>
          String(i.mediaId) === String(media.id) ? { ...i, isFavorite: false } : i
        )
      );
      showToast('Removed from favorites');
    } else {
      // Add to favorites list directly (does NOT create any Watching/Reading library entry)
      const favItem: MediaItem = {
        id: String(media.id),
        title: media.title,
        romajiTitle: media.romajiTitle,
        nativeTitle: media.nativeTitle,
        coverImage: media.coverImage,
        bannerImage: media.bannerImage,
        category: media.category,
        format: media.format,
        status: media.status,
        score: media.score,
        year: media.year,
        genres: media.genres,
        description: media.description,
        studio: media.studio,
        author: media.author,
        communityHearts: media.communityHearts,
      };

      setUserFavorites((prev) => [favItem, ...prev.filter((i) => String(i.id) !== String(media.id))]);
      // If it exists in userLibrary, simply sync isFavorite flag
      setUserLibrary((prev) =>
        prev.map((i) =>
          String(i.mediaId) === String(media.id) ? { ...i, isFavorite: true } : i
        )
      );
      showToast('Added to favorites');
    }
  };

  const getLibraryEntry = (mediaId: string | number) => {
    return userLibrary.find((i) => String(i.mediaId) === String(mediaId));
  };

  const isAnimeAlertSubscribed = (mediaId: string | number) => {
    return subscribedAnimeAlerts.some((i) => String(i.id) === String(mediaId));
  };

  const toggleAnimeAlert = (media: MediaItem): boolean => {
    const isCurrentlySub = subscribedAnimeAlerts.some((i) => String(i.id) === String(media.id));
    if (isCurrentlySub) {
      setSubscribedAnimeAlerts((prev) => prev.filter((i) => String(i.id) !== String(media.id)));
      setReleaseNotifications((prev) => prev.filter((n) => String(n.mediaId) !== String(media.id)));
      showToast(`Notifications disabled for ${media.title}`);
      return false;
    } else {
      const alertItem: MediaItem = {
        id: String(media.id),
        title: media.title,
        romajiTitle: media.romajiTitle,
        nativeTitle: media.nativeTitle,
        coverImage: media.coverImage,
        bannerImage: media.bannerImage,
        category: 'anime',
        format: media.format || 'TV',
        status: media.status || 'Releasing',
        score: media.score || 8.0,
        year: media.year || new Date().getFullYear(),
        genres: media.genres || [],
        description: media.description || '',
        totalEpisodes: media.totalEpisodes,
        latestEpisode: media.latestEpisode,
        airingAt: media.airingAt,
        nextAiringEpisode: media.nextAiringEpisode,
        nextEpisodeCountdown: media.nextEpisodeCountdown,
      };

      const nextEp = media.nextAiringEpisode?.episode;
      const epNum = nextEp ? Math.max(1, nextEp - 1) : (media.latestEpisode || media.totalEpisodes || 19);

      const notif1: ReleaseNotification = {
        id: `notif_${media.id}_ep${epNum}`,
        mediaId: String(media.id),
        media: alertItem,
        title: media.title,
        coverImage: media.coverImage,
        episodeNumber: epNum,
        episodeText: `Episode ${epNum} has aired!`,
        dateLabel: '3 days ago',
        timestamp: Date.now() - 3 * 86400000,
      };

      const newNotifs: ReleaseNotification[] = [notif1];
      if (epNum > 6) {
        const prevEp = epNum - 6;
        newNotifs.push({
          id: `notif_${media.id}_ep${prevEp}`,
          mediaId: String(media.id),
          media: alertItem,
          title: media.title,
          coverImage: media.coverImage,
          episodeNumber: prevEp,
          episodeText: `Episode ${prevEp} has aired!`,
          dateLabel: 'August 19',
          timestamp: Date.now() - 14 * 86400000,
        });
      }

      setSubscribedAnimeAlerts((prev) => [alertItem, ...prev.filter((i) => String(i.id) !== String(media.id))]);
      setReleaseNotifications((prev) => [
        ...newNotifs,
        ...prev.filter((n) => String(n.mediaId) !== String(media.id)),
      ]);
      setHasCommunityUnreadUpdate(true);
      showToast(`Notifications enabled for ${media.title}`);
      return true;
    }
  };

  const deleteReleaseNotification = (notificationId: string) => {
    setReleaseNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const markCommunityAsRead = () => {
    setHasCommunityUnreadUpdate(false);
  };

  const triggerCommunityUpdate = () => {
    setHasCommunityUnreadUpdate(true);
  };

  const handleSetActiveNav = (tab: NavTab) => {
    if (tab === 'community') {
      setHasCommunityUnreadUpdate(false);
    }
    setActiveNav(tab);
  };

  return (
    <AppContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        activeNav,
        setActiveNav: handleSetActiveNav,
        selectedMedia,
        setSelectedMedia,
        openMediaDetails,
        closeMediaDetails,
        selectedCharacter,
        setSelectedCharacter,
        showWatchOrder,
        setShowWatchOrder,
        showEpisodeSearch,
        setShowEpisodeSearch,
        showAddToLibrary,
        setShowAddToLibrary,
        showFilterModal,
        setShowFilterModal,
        activeLibraryStatus,
        setActiveLibraryStatus,
        activeVideoEpisode,
        setActiveVideoEpisode,
        activeReader,
        setActiveReader,
        mangaReadingHistory,
        recordMangaReadingProgress,
        removeFromMangaHistory,
        clearMangaHistory,
        animeWatchHistory,
        recordAnimeWatchProgress,
        removeFromAnimeHistory,
        clearAnimeHistory,
        userLibrary,
        addToLibrary,
        removeFromLibrary,
        updateLibraryProgress,
        getLibraryEntry,
        userFavorites,
        isMediaFavorite,
        toggleFavorite,
        subscribedAnimeAlerts,
        isAnimeAlertSubscribed,
        toggleAnimeAlert,
        releaseNotifications,
        deleteReleaseNotification,
        hasCommunityUnreadUpdate,
        markCommunityAsRead,
        triggerCommunityUpdate,
        recentActivity,
        filters,
        setFilters,
        resetFilters,
        settings,
        updateSetting,
        toastMessage,
        showToast,
        settingsSubPage,
        setSettingsSubPage,
        settingsActiveModal,
        setSettingsActiveModal,
        isProfileSheetOpen,
        setIsProfileSheetOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
