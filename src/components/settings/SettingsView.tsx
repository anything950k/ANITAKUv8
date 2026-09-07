import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Heart,
  ChevronDown,
  ChevronRight,
  X,
  Folder,
  HardDrive,
  Search,
} from 'lucide-react';
import { useApp, ACCENT_COLOR_MAP } from '../../context/AppContext';
import { AccentColorKey } from '../../types';
import { safeRemoveItem } from '../../utils/storage';
import { AppToggleSwitch } from '../common/AppToggleSwitch';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSetting,
    showToast,
    settingsSubPage,
    setSettingsSubPage,
    settingsActiveModal,
    setSettingsActiveModal,
  } = useApp();

  const activeModal = settingsActiveModal as
    | 'subscription'
    | 'report'
    | 'faqs'
    | 'inviteKey'
    | null;
  const setActiveModal = (modal: 'subscription' | 'report' | 'faqs' | 'inviteKey' | null) => {
    setSettingsActiveModal(modal);
  };

  // State for Report to Dev
  const [reportType, setReportType] = useState('Anime');
  const [issueType, setIssueType] = useState('Choose an issue');
  const [affectedAnime, setAffectedAnime] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showReportTypePicker, setShowReportTypePicker] = useState(false);
  const [showIssueTypePicker, setShowIssueTypePicker] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // State for Subscription tab (Anime vs Manga & Novels)
  const [subscriptionTab, setSubscriptionTab] = useState<'anime' | 'manga_novels'>('anime');

  // State for FAQs accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // State for General sheet pickers (Language, DNS, Cache)
  const [generalPicker, setGeneralPicker] = useState<'language' | 'dns' | 'cache' | null>(null);

  // State for Appearance sheet pickers (Accent, Glass)
  const [appearancePicker, setAppearancePicker] = useState<'accent' | 'glass' | null>(null);

  // State for Content sheet pickers (Metadata, Title Language, Rating Format)
  const [contentPicker, setContentPicker] = useState<'metadata' | 'titleLanguage' | 'ratingFormat' | null>(null);

  // State for Playback sheet pickers
  const [playbackPicker, setPlaybackPicker] = useState<
    | 'sleepTimer'
    | 'videoQuality'
    | 'audioPreference'
    | 'subtitleLanguage'
    | 'subtitlePreference'
    | 'subtitleAppearance'
    | 'playbackSpeed'
    | null
  >(null);

  // State for Reader sheet pickers
  const [readerPicker, setReaderPicker] = useState<
    | 'mangaReaderMode'
    | 'pageTurnAnimation'
    | 'pagedReaderDirection'
    | 'imageScale'
    | 'zoomStart'
    | 'tapNavigation'
    | 'readerBackground'
    | 'preloadPages'
    | null
  >(null);

  // Hidden native folder/directory picker ref
  const folderPickerInputRef = useRef<HTMLInputElement>(null);

  // Directly open device's native file/storage manager
  const handleOpenNativeStorageManager = async () => {
    // Priority 1: Window showDirectoryPicker (Chrome / Chromium on Android & PC - triggers real OS directory picker)
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          id: 'anify_downloads',
          mode: 'readwrite',
        });
        if (dirHandle && dirHandle.name) {
          const folderName = dirHandle.name;
          const formatted = folderName.startsWith('Internal storage/')
            ? folderName
            : `Internal storage/${folderName}`;
          updateSetting('downloadPath', formatted);
          updateSetting(
            'downloadUri',
            `content://com.android.externalstorage.documents/tree/primary%3A${encodeURIComponent(folderName)}`
          );
          updateSetting('downloadPermissionGranted', true);
          showToast(`Download path set: ${formatted}`);
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User cancelled in system file manager
          return;
        }
        console.warn('showDirectoryPicker unavailable or cancelled, falling back to input:', err);
      }
    }

    // Priority 2: Native HTML input webkitdirectory that invokes the user's OS file/storage manager
    folderPickerInputRef.current?.click();
  };

  const accentColors: AccentColorKey[] = [
    'Purple',
    'Blue',
    'Teal',
    'Emerald',
    'Amber',
    'Coral',
    'Rose',
    'Red',
    'Lime',
  ];

  // Dynamic subtitles matching screenshot defaults
  const generalSubtitle = `${
    settings.appLanguage === 'System Default' ? 'System' : settings.appLanguage
  } / ${settings.cacheLimit || 'Balanced'} Cache`;

  const appearanceSubtitle = `${settings.accentColor || 'Purple'} Accent / ${
    settings.pureBlackMode ? 'Pure Black' : 'Dark'
  }`;

  const contentSubtitle = settings.homepageMetadata || 'Auto';

  const playbackSubtitle = `Auto / ${settings.audioPreference || 'Japanese'}`;

  const readerSubtitle = `${
    settings.mangaReaderMode || 'Paged'
  } / ${settings.pagedReaderDirection || 'Left to Right'}`;

  // Top-level 10 settings items matching the screenshot
  const settingsItems = [
    {
      id: 'general',
      title: 'General',
      subtitle: generalSubtitle,
      icon: (
        <svg className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current" viewBox="0 0 24 24">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      ),
      action: () => setSettingsSubPage('general'),
    },
    {
      id: 'appearance',
      title: 'Appearance',
      subtitle: appearanceSubtitle,
      icon: (
        <svg
          className="w-[23.5px] h-[23.5px] text-[#b876fc]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="8" y2="6" />
          <line x1="12" y1="6" x2="21" y2="6" />
          <line x1="8" y1="3.5" x2="8" y2="8.5" />

          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="19" y1="12" x2="21" y2="12" />
          <line x1="15" y1="9.5" x2="15" y2="14.5" />

          <line x1="3" y1="18" x2="10" y2="18" />
          <line x1="14" y1="18" x2="21" y2="18" />
          <line x1="10" y1="15.5" x2="10" y2="20.5" />
        </svg>
      ),
      action: () => setSettingsSubPage('appearance'),
    },
    {
      id: 'content',
      title: 'Content',
      subtitle: contentSubtitle,
      icon: (
        <svg className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
      action: () => setSettingsSubPage('content'),
    },
    {
      id: 'playback',
      title: 'Playback',
      subtitle: playbackSubtitle,
      icon: (
        <svg className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current" viewBox="0 0 24 24">
          <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
        </svg>
      ),
      action: () => setSettingsSubPage('playback'),
    },
    {
      id: 'reader',
      title: 'Reader',
      subtitle: readerSubtitle,
      icon: (
        <svg className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current" viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
      ),
      action: () => setSettingsSubPage('reader'),
    },
    {
      id: 'downloads',
      title: 'Downloads',
      subtitle: 'Queued downloads',
      icon: (
        <svg className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current" viewBox="0 0 24 24">
          <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
        </svg>
      ),
      action: () => setSettingsSubPage('downloads'),
    },
    {
      id: 'subscription',
      title: 'Subscription',
      subtitle: 'Support Development',
      icon: (
        <svg className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      action: () => setActiveModal('subscription'),
    },
    {
      id: 'report',
      title: 'Report to Dev',
      subtitle: 'Anime, manga, performance, feedback, and suggestions',
      icon: (
        <svg className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current" viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      ),
      action: () => {
        setReportSubmitted(false);
        setActiveModal('report');
      },
    },
    {
      id: 'faqs',
      title: 'FAQs',
      subtitle: 'Frequently Asked Questions',
      icon: (
        <svg
          className="w-[27px] h-[27px] text-[#b876fc] fill-current"
          viewBox="0 -960 960 960"
        >
          <path d="M584-637q0-43-28.5-69T480-732q-29 0-52.5 12.5T387-683q-16 23-43.5 26.5T296-671q-14-13-15.5-32t9.5-36q32-48 81.5-74.5T480-840q97 0 157.5 55T698-641q0 45-19 81t-70 85q-37 35-50 54.5T542-376q-4 24-20.5 40T482-320q-23 0-39.5-15.5T426-374q0-39 17-71.5t57-68.5q51-45 67.5-69.5T584-637ZM480-80q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" />
        </svg>
      ),
      action: () => setActiveModal('faqs'),
    },
    {
      id: 'inviteKey',
      title: 'Manage Invite Key',
      subtitle: undefined, // Screenshot shows no subtitle for Manage Invite Key!
      icon: (
        <svg
          className="w-[23.5px] h-[23.5px] text-[#b876fc] fill-current"
          viewBox="0 0 24 24"
        >
          <g transform="rotate(-45 12 12) translate(24 0) scale(-1 1)">
            <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </g>
        </svg>
      ),
      action: () => setActiveModal('inviteKey'),
    },
  ];

  const faqsList = [
    {
      q: 'How to report issues on anime or manga?',
      a: 'You can report broken video streams, missing subtitles, or incorrect manga chapters directly from the player or details menu by tapping "Report an Issue", or reach out in our Community channel.',
    },
    {
      q: 'How about reducing ads?',
      a: 'The app is completely free and has zero built-in advertisements! For external third-party streaming embeds with popups, we recommend enabling Clean Stream mode in Settings or using an ad-blocking DNS.',
    },
    {
      q: "Why isn't the dubbed version available?",
      a: 'Dubbed audio availability depends on public licensed provider streams. If a dub is available for an episode, you can easily toggle between Sub and Dub in the player audio tracks menu.',
    },
    {
      q: 'Why are some episodes orange colored?',
      a: 'Orange-colored episode badges indicate filler episodes, special movie/OVA releases, or your currently active watch progress so you never lose track of where you left off.',
    },
    {
      q: 'What platform does Anify support?',
      a: 'The app supports all modern mobile, tablet, and desktop web browsers. You can also install it as a Progressive Web App (PWA) directly onto your Android, iOS, or Windows home screen.',
    },
    {
      q: 'What happened to Rooms?',
      a: 'Watch Party and Reading Rooms let you sync playback and live chat in real time with friends! You can create or join an open room anytime from the Community tab.',
    },
    {
      q: 'How can I support Anify?',
      a: 'You can support the project by sharing the app with other anime and manga fans, reporting bugs, suggesting improvements, and starring our open-source project repository.',
    },
    {
      q: 'How does the Leaderboard works?',
      a: 'The Leaderboard ranks users based on total anime episodes watched, manga chapters completed, active daily streaks, and community achievements across weekly and all-time leaderboards.',
    },
    {
      q: 'How does the leveling system work?',
      a: 'You earn EXP every time you complete an episode, finish a manga chapter, or maintain your daily login streak. Leveling up unlocks custom titles, animated profile rings, and perks.',
    },
    {
      q: 'Some media have no episodes/chapters?',
      a: 'Upcoming anime titles, unreleased manga, or newly licensed series may not have active streaming mirrors yet. Once third-party mirror sources release content, it appears automatically.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white pt-5 pb-32 select-none">
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6">
        {/* ================= SUBPAGE VIEW ================= */}
        {settingsSubPage && settingsSubPage !== 'downloads' && settingsSubPage !== 'general' && settingsSubPage !== 'appearance' && settingsSubPage !== 'content' && settingsSubPage !== 'playback' && settingsSubPage !== 'reader' ? (
          <div className="space-y-6">
            <div className="tab-header-row gap-3.5 pb-2 border-b border-white/10">
              <button
                onClick={() => setSettingsSubPage(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer text-white active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="tab-title-text capitalize">
                {settingsSubPage}
              </h1>
            </div>
          </div>
        ) : (
          /* ================= MAIN SETTINGS HUB (PIXEL-PERFECT TO SCREENSHOT) ================= */
          <div>
            {/* Top Heading */}
            <div className="tab-header-row justify-between">
              <h1 className="tab-title-text drop-shadow-md">
                Settings
              </h1>
            </div>

            {/* Flat List of 10 Options */}
            <div className="flex flex-col space-y-4 sm:space-y-4.5">
              {settingsItems.map((item) => (
                <button
                  key={item.id}
                  id={`settings-item-${item.id}`}
                  type="button"
                  onClick={item.action}
                  className="group flex items-center gap-4 w-full text-left cursor-pointer transition-opacity active:opacity-70 focus:outline-none select-none"
                >
                  {/* Purple squircle container (increased 0.1x from 38px to 42px) */}
                  <div className="w-[42px] h-[42px] rounded-[13px] bg-[#1e132b] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#261737]">
                    {item.icon}
                  </div>

                  {/* Text labels */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] sm:text-[17px] font-bold text-white tracking-[-0.01em] leading-tight">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-[13px] text-[#8e8e98] tracking-normal leading-tight mt-1 truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Footer */}
            <div className="pt-12 pb-6 text-center space-y-1.5 flex flex-col items-center justify-center">
              <div className="text-[14px] font-semibold text-white/75 tracking-normal">
                Satori 1.8
              </div>
              <div className="text-[13px] flex items-center justify-center gap-1.5">
                <span className="text-white/60">Made with</span>
                <svg
                  className="w-[14px] h-[14px] text-[#b876fc] opacity-85 fill-current inline-block shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= FULL SCREEN GENERAL SHEET (Exact pixel-accurate reproduction of Screenshot_20260905_193022_Anify.jpg) ================= */}
      {settingsSubPage === 'general' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-5 sm:px-6">
            {/* Top Bar: Clean ArrowLeft & "General" Header matching screenshot */}
            <div className="flex items-center gap-5 pt-8 pb-7">
              <button
                type="button"
                onClick={() => setSettingsSubPage(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-white tracking-normal">
                General
              </h1>
            </div>

            {/* List of options matching Screenshot_20260905_193022_Anify.jpg */}
            <div className="flex flex-col space-y-7 pt-1">
              {/* Option 1: App Language */}
              <div
                onClick={() => setGeneralPicker('language')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    App Language
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.appLanguage
                      ? `Use ${settings.appLanguage} for the app interface`
                      : 'Use English for the app interface'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 2: App Haptics */}
              <div
                onClick={() => {
                  const nextVal = !settings.appHaptics;
                  updateSetting('appHaptics', nextVal);
                  if (nextVal && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(25);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    App Haptics
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Configure app-wide haptic vibration
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.appHaptics}
                    onChange={(v) => {
                      updateSetting('appHaptics', v);
                      if (v && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(25);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 3: DNS */}
              <div
                onClick={() => setGeneralPicker('dns')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    DNS
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.dns === 'Off'
                      ? 'Direct DNS connection'
                      : `Resolve source requests with ${settings.dns || 'Cloudflare'}`}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 4: Enable Trailers */}
              <div
                onClick={() => {
                  const nextVal = !settings.enableTrailers;
                  updateSetting('enableTrailers', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Enable Trailers
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Play trailers automatically on details pages
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.enableTrailers}
                    onChange={(v) => {
                      updateSetting('enableTrailers', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(15);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 5: Trailers Start Muted */}
              <div
                onClick={() => {
                  const nextVal = !settings.trailersStartMuted;
                  updateSetting('trailersStartMuted', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Trailers Start Muted
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Keep autoplay trailers silent by default
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.trailersStartMuted}
                    onChange={(v) => {
                      updateSetting('trailersStartMuted', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(15);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 6: Cache Limit */}
              <div
                onClick={() => setGeneralPicker('cache')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Cache Limit
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.cacheLimit || 'Balanced'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Modal Picker for Language */}
          {generalPicker === 'language' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setGeneralPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">App Language</h3>
                  <button
                    type="button"
                    onClick={() => setGeneralPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                  {[
                    'English',
                    '日本語 - Japanese',
                    'Español - Spanish',
                    'Français - French',
                    'Deutsch - German',
                    'System Default',
                  ].map((lang) => {
                    const isSelected = (settings.appLanguage || 'English') === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          updateSetting('appLanguage', lang);
                          setGeneralPicker(null);
                          showToast(`Language set to ${lang}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc] font-bold'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <span>{lang}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for DNS */}
          {generalPicker === 'dns' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setGeneralPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">DNS Provider</h3>
                  <button
                    type="button"
                    onClick={() => setGeneralPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Cloudflare', name: 'Cloudflare', desc: 'Fast, secure 1.1.1.1' },
                    { id: 'Google', name: 'Google', desc: 'Standard 8.8.8.8' },
                    { id: 'AdGuard', name: 'AdGuard', desc: 'Ad & tracker blocking' },
                    { id: 'Off', name: 'Off', desc: 'Direct ISP DNS' },
                  ].map((dnsOpt) => {
                    const isSelected = (settings.dns || 'Cloudflare') === dnsOpt.id;
                    return (
                      <button
                        key={dnsOpt.id}
                        type="button"
                        onClick={() => {
                          updateSetting('dns', dnsOpt.id);
                          setGeneralPicker(null);
                          showToast(`DNS set to ${dnsOpt.name}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{dnsOpt.name}</div>
                          <div className="text-xs text-white/50">{dnsOpt.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Cache Limit */}
          {generalPicker === 'cache' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setGeneralPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Cache Limit</h3>
                  <button
                    type="button"
                    onClick={() => setGeneralPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Balanced', label: 'Balanced', desc: 'Recommended balance for smooth playback' },
                    { id: 'Tiny', label: 'Tiny (250MB)', desc: 'Minimal storage footprint' },
                    { id: 'Large', label: 'Large (4GB)', desc: 'Extended offline cache for high bitrate' },
                    { id: 'Unlimited', label: 'Unlimited', desc: 'No storage bounds' },
                  ].map((cacheOpt) => {
                    const isSelected = (settings.cacheLimit || 'Balanced') === cacheOpt.id;
                    return (
                      <button
                        key={cacheOpt.id}
                        type="button"
                        onClick={() => {
                          updateSetting('cacheLimit', cacheOpt.id);
                          setGeneralPicker(null);
                          showToast(`Cache limit set to ${cacheOpt.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{cacheOpt.label}</div>
                          <div className="text-xs text-white/50">{cacheOpt.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= FULL SCREEN APPEARANCE SHEET (Exact pixel-accurate reproduction of Screenshot_20260905_193215_Anify.jpg) ================= */}
      {settingsSubPage === 'appearance' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-5 sm:px-6">
            {/* Top Bar: Clean ArrowLeft & "Appearance" Header matching screenshot */}
            <div className="flex items-center gap-5 pt-8 pb-7">
              <button
                type="button"
                onClick={() => setSettingsSubPage(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-white tracking-normal">
                Appearance
              </h1>
            </div>

            {/* List of options matching Screenshot_20260905_193215_Anify.jpg */}
            <div className="flex flex-col space-y-7 pt-1">
              {/* Option 1: Pure Black Mode */}
              <div
                onClick={() => {
                  const nextVal = !settings.pureBlackMode;
                  updateSetting('pureBlackMode', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Pure Black Mode
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Use pitch black app theme
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.pureBlackMode}
                    onChange={(v) => {
                      updateSetting('pureBlackMode', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(20);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 2: Accent Color */}
              <div
                onClick={() => setAppearancePicker('accent')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Accent Color
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.accentColor || 'Purple'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 3: Glass Effect */}
              <div
                onClick={() => setAppearancePicker('glass')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Glass Effect
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Blur {settings.glassBlur ?? 0}dp, Saturation {settings.glassSaturation ?? 75}%, Refraction {settings.glassRefraction ?? 0}dp, Tint {settings.glassTint ?? 12}%
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Modal Picker for Accent Color */}
          {appearancePicker === 'accent' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setAppearancePicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Accent Color</h3>
                  <button
                    type="button"
                    onClick={() => setAppearancePicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto pt-1">
                  {accentColors.map((colorKey) => {
                    const item = ACCENT_COLOR_MAP[colorKey];
                    const isSelected = (settings.accentColor || 'Purple') === colorKey;
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => {
                          updateSetting('accentColor', colorKey);
                          setAppearancePicker(null);
                          showToast(`Accent color set to ${colorKey}`);
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-400 bg-purple-500/20 shadow-lg'
                            : 'border-white/5 bg-[#171720] hover:bg-white/5'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full shadow-md flex items-center justify-center ring-2 ring-white/10"
                          style={{ backgroundColor: item.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#c084fc]' : 'text-white/80'}`}>
                          {colorKey}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal for Glass Effect */}
          {appearancePicker === 'glass' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setAppearancePicker(null)}
            >
              <div
                className="w-full max-w-md bg-[#121218] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 select-none max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Glass Effect</h3>
                    <p className="text-xs text-white/50 mt-0.5">Customize UI backdrop blur and refraction</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppearancePicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  <SettingSlider
                    title="Glass Blur"
                    value={settings.glassBlur ?? 0}
                    unit="dp"
                    min={0}
                    max={24}
                    step={1}
                    onChange={(val) => updateSetting('glassBlur', val)}
                  />

                  <SettingSlider
                    title="Glass Saturation"
                    value={settings.glassSaturation ?? 75}
                    unit="%"
                    min={0}
                    max={200}
                    step={5}
                    onChange={(val) => updateSetting('glassSaturation', val)}
                  />

                  <SettingSlider
                    title="Glass Refraction"
                    value={settings.glassRefraction ?? 0}
                    unit="dp"
                    min={0}
                    max={100}
                    step={5}
                    onChange={(val) => updateSetting('glassRefraction', val)}
                  />

                  <SettingSlider
                    title="Glass Tint"
                    value={settings.glassTint ?? 12}
                    unit="%"
                    min={0}
                    max={100}
                    step={1}
                    onChange={(val) => updateSetting('glassTint', val)}
                  />
                </div>

                {/* Presets */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs font-semibold text-white/60 mb-2">Presets</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateSetting('glassBlur', 0);
                        updateSetting('glassSaturation', 75);
                        updateSetting('glassRefraction', 0);
                        updateSetting('glassTint', 12);
                        showToast('Applied Default glass preset');
                      }}
                      className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-white/80 border border-white/5 cursor-pointer"
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSetting('glassBlur', 12);
                        updateSetting('glassSaturation', 100);
                        updateSetting('glassRefraction', 20);
                        updateSetting('glassTint', 20);
                        showToast('Applied Frost glass preset');
                      }}
                      className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-white/80 border border-white/5 cursor-pointer"
                    >
                      Frost
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSetting('glassBlur', 24);
                        updateSetting('glassSaturation', 120);
                        updateSetting('glassRefraction', 50);
                        updateSetting('glassTint', 30);
                        showToast('Applied Deep glass preset');
                      }}
                      className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-white/80 border border-white/5 cursor-pointer"
                    >
                      Deep
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setAppearancePicker(null)}
                    className="w-full py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= FULL SCREEN CONTENT SHEET (Exact pixel-accurate reproduction of Screenshot_20260905_194552_Anify.jpg) ================= */}
      {settingsSubPage === 'content' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-5 sm:px-6">
            {/* Top Bar: Clean ArrowLeft & "Content" Header matching screenshot */}
            <div className="flex items-center gap-5 pt-8 pb-7">
              <button
                type="button"
                onClick={() => setSettingsSubPage(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-white tracking-normal">
                Content
              </h1>
            </div>

            {/* List of options matching Screenshot_20260905_194552_Anify.jpg */}
            <div className="flex flex-col space-y-7 pt-1">
              {/* Option 1: Metadata */}
              <div
                onClick={() => setContentPicker('metadata')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Metadata
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.homepageMetadata || 'Auto'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 2: Title Language */}
              <div
                onClick={() => setContentPicker('titleLanguage')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Title Language
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.titleLanguage || 'English'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 3: Rating Format */}
              <div
                onClick={() => setContentPicker('ratingFormat')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Rating Format
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.ratingFormat || '10-Point · 1 Decimal Place'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 4: Show Library Progress */}
              <div
                onClick={() => {
                  const nextVal = !settings.showLibraryProgress;
                  updateSetting('showLibraryProgress', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Show Library Progress
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Show watched episodes or read chapters on library posters
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.showLibraryProgress}
                    onChange={(v) => {
                      updateSetting('showLibraryProgress', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(20);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 5: Filler List */}
              <div
                onClick={() => {
                  const nextVal = !settings.fillerList;
                  updateSetting('fillerList', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Filler List
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Mark known filler episodes when data is available
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.fillerList}
                    onChange={(v) => {
                      updateSetting('fillerList', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(20);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Picker for Metadata */}
          {contentPicker === 'metadata' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setContentPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Metadata Provider</h3>
                  <button
                    type="button"
                    onClick={() => setContentPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Auto', name: 'Auto', desc: 'Aggregate best available metadata automatically' },
                    { id: 'AniList', name: 'AniList', desc: 'Rich anime, manga, staff and studio database' },
                    { id: 'MAL', name: 'MyAnimeList', desc: 'Legacy ratings and community statistics' },
                    { id: 'Kitsu', name: 'Kitsu', desc: 'Alternative anime and manga database' },
                  ].map((metaOpt) => {
                    const isSelected = (settings.homepageMetadata || 'Auto') === metaOpt.id;
                    return (
                      <button
                        key={metaOpt.id}
                        type="button"
                        onClick={() => {
                          updateSetting('homepageMetadata', metaOpt.id);
                          setContentPicker(null);
                          showToast(`Metadata provider set to ${metaOpt.name}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{metaOpt.name}</div>
                          <div className="text-xs text-white/50">{metaOpt.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Title Language */}
          {contentPicker === 'titleLanguage' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setContentPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Title Language</h3>
                  <button
                    type="button"
                    onClick={() => setContentPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'English', label: 'English', example: 'e.g. Attack on Titan, Demon Slayer' },
                    { id: 'Romaji', label: 'Romaji', example: 'e.g. Shingeki no Kyojin, Kimetsu no Yaiba' },
                    { id: 'Native', label: 'Native / Japanese', example: 'e.g. 進撃の巨人, 鬼滅の刃' },
                  ].map((langOpt) => {
                    const isSelected = (settings.titleLanguage || 'English') === langOpt.id;
                    return (
                      <button
                        key={langOpt.id}
                        type="button"
                        onClick={() => {
                          updateSetting('titleLanguage', langOpt.id);
                          setContentPicker(null);
                          showToast(`Title language set to ${langOpt.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{langOpt.label}</div>
                          <div className="text-xs text-white/50">{langOpt.example}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Rating Format */}
          {contentPicker === 'ratingFormat' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setContentPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Rating Format</h3>
                  <button
                    type="button"
                    onClick={() => setContentPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: '10-Point · 1 Decimal Place', label: '10-Point · 1 Decimal Place', example: 'Standard decimal score (e.g. 8.4 / 10)' },
                    { id: '100-Point System', label: '100-Point System', example: 'Percentage score (e.g. 84%)' },
                    { id: '5-Star Scale', label: '5-Star Scale', example: 'Star score (e.g. 4.2 / 5.0)' },
                    { id: '3-Point Smiley', label: '3-Point Smiley', example: 'Positive / Neutral / Negative' },
                  ].map((rateOpt) => {
                    const isSelected = (settings.ratingFormat || '10-Point · 1 Decimal Place') === rateOpt.id;
                    return (
                      <button
                        key={rateOpt.id}
                        type="button"
                        onClick={() => {
                          updateSetting('ratingFormat', rateOpt.id);
                          setContentPicker(null);
                          showToast(`Rating format set to ${rateOpt.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{rateOpt.label}</div>
                          <div className="text-xs text-white/50">{rateOpt.example}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= FULL SCREEN PLAYBACK SHEET (Exact pixel-accurate reproduction of Screenshot_20260905_195124_Anify.jpg) ================= */}
      {settingsSubPage === 'playback' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-5 sm:px-6">
            {/* Top Bar: Clean ArrowLeft & "Playback" Header matching screenshot */}
            <div className="flex items-center gap-5 pt-8 pb-7">
              <button
                type="button"
                onClick={() => setSettingsSubPage(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-white tracking-normal">
                Playback
              </h1>
            </div>

            {/* List of options matching Screenshot_20260905_195124_Anify.jpg */}
            <div className="flex flex-col space-y-7 pt-1 pb-16">
              {/* Option 1: Gestures */}
              <div
                onClick={() => {
                  const nextVal = !settings.gestures;
                  updateSetting('gestures', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Gestures
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Enable seek, volume, and brightness gestures
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.gestures}
                    onChange={(v) => {
                      updateSetting('gestures', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(20);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 2: Ambient Light */}
              <div
                onClick={() => {
                  const nextVal = !settings.ambientLight;
                  updateSetting('ambientLight', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Ambient Light
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Let video colors softly illuminate the player background
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.ambientLight}
                    onChange={(v) => {
                      updateSetting('ambientLight', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(20);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 3: Auto Skip Filler */}
              <div
                onClick={() => {
                  const nextVal = !settings.autoSkipFiller;
                  updateSetting('autoSkipFiller', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Auto Skip Filler
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    Prefer canon episodes when playback data supports it
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.autoSkipFiller}
                    onChange={(v) => {
                      updateSetting('autoSkipFiller', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(20);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Option 4: Sleep Timer */}
              <div
                onClick={() => setPlaybackPicker('sleepTimer')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Sleep Timer
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.sleepTimer || 'Off'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 5: Video Quality */}
              <div
                onClick={() => setPlaybackPicker('videoQuality')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Video Quality
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.videoQuality || 'Auto'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 6: Audio Preference */}
              <div
                onClick={() => setPlaybackPicker('audioPreference')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Audio Preference
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.audioPreference || 'Japanese'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 7: Subtitle Language */}
              <div
                onClick={() => setPlaybackPicker('subtitleLanguage')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Subtitle Language
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.subtitleLanguage || 'English'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 8: Subtitle Preference */}
              <div
                onClick={() => setPlaybackPicker('subtitlePreference')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Subtitle Preference
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.subtitlePreference || 'Automatic'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 9: Subtitle Appearance */}
              <div
                onClick={() => setPlaybackPicker('subtitleAppearance')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Subtitle Appearance
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.subtitleFont || 'Netflix Sans'}, {settings.subtitleSize ?? 15}sp, {settings.subtitleElevation ?? -10}% elevation
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* Option 10: Playback Speed */}
              <div
                onClick={() => setPlaybackPicker('playbackSpeed')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                    Playback Speed
                  </h2>
                  <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight leading-normal">
                    {settings.playbackSpeed || '1x'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Modal Picker for Sleep Timer */}
          {playbackPicker === 'sleepTimer' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setPlaybackPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Sleep Timer</h3>
                  <button
                    type="button"
                    onClick={() => setPlaybackPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Off', label: 'Off', desc: 'Sleep timer disabled' },
                    { id: '15 Minutes', label: '15 Minutes', desc: 'Pause playback in 15 minutes' },
                    { id: '30 Minutes', label: '30 Minutes', desc: 'Pause playback in 30 minutes' },
                    { id: '45 Minutes', label: '45 Minutes', desc: 'Pause playback in 45 minutes' },
                    { id: '60 Minutes', label: '60 Minutes', desc: 'Pause playback in 1 hour' },
                    { id: 'End of Episode', label: 'End of Episode', desc: 'Stop after current episode finishes' },
                  ].map((item) => {
                    const isSelected = (settings.sleepTimer || 'Off') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('sleepTimer', item.id);
                          setPlaybackPicker(null);
                          showToast(`Sleep timer set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Video Quality */}
          {playbackPicker === 'videoQuality' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setPlaybackPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Video Quality</h3>
                  <button
                    type="button"
                    onClick={() => setPlaybackPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Auto', label: 'Auto', desc: 'Intelligent adaptive quality based on network' },
                    { id: '1080p', label: '1080p', desc: 'FHD High Definition crisp video' },
                    { id: '720p', label: '720p', desc: 'HD balanced quality and smooth stream' },
                    { id: '480p', label: '480p', desc: 'SD Standard Definition data saver' },
                    { id: '360p', label: '360p', desc: 'Low bandwidth friendly' },
                  ].map((item) => {
                    const isSelected = (settings.videoQuality || 'Auto') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('videoQuality', item.id);
                          setPlaybackPicker(null);
                          showToast(`Video quality set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Audio Preference */}
          {playbackPicker === 'audioPreference' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setPlaybackPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Audio Preference</h3>
                  <button
                    type="button"
                    onClick={() => setPlaybackPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Japanese', label: 'Japanese', desc: 'Original Japanese audio track' },
                    { id: 'English', label: 'English', desc: 'English dubbed audio track' },
                    { id: 'Spanish', label: 'Spanish', desc: 'Spanish dubbed track' },
                    { id: 'German', label: 'German', desc: 'German dubbed track' },
                    { id: 'French', label: 'French', desc: 'French dubbed track' },
                  ].map((item) => {
                    const isSelected = (settings.audioPreference || 'Japanese') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('audioPreference', item.id);
                          setPlaybackPicker(null);
                          showToast(`Default audio set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Subtitle Language */}
          {playbackPicker === 'subtitleLanguage' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setPlaybackPicker(null)}
            >
              <div
                className="w-full max-w-sm max-h-[85vh] overflow-y-auto bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Subtitle Language</h3>
                  <button
                    type="button"
                    onClick={() => setPlaybackPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'English', label: 'English', desc: 'English subtitles' },
                    { id: 'Spanish', label: 'Spanish', desc: 'Subtítulos en español' },
                    { id: 'French', label: 'French', desc: 'Sous-titres français' },
                    { id: 'German', label: 'German', desc: 'Deutsche Untertitel' },
                    { id: 'Portuguese', label: 'Portuguese', desc: 'Legendas em português' },
                    { id: 'Italian', label: 'Italian', desc: 'Sottotitoli in italiano' },
                    { id: 'Arabic', label: 'Arabic', desc: 'ترجمة عربية' },
                    { id: 'Russian', label: 'Russian', desc: 'Русские субтитры' },
                  ].map((item) => {
                    const isSelected = (settings.subtitleLanguage || 'English') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('subtitleLanguage', item.id);
                          setPlaybackPicker(null);
                          showToast(`Subtitle language set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Subtitle Preference */}
          {playbackPicker === 'subtitlePreference' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setPlaybackPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Subtitle Preference</h3>
                  <button
                    type="button"
                    onClick={() => setPlaybackPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Automatic', label: 'Automatic', desc: 'Intelligently select best available subtitles' },
                    { id: 'Softsubs', label: 'Softsubs', desc: 'Render styled ASS/SRT text subtitles' },
                    { id: 'Hardsubs', label: 'Hardsubs', desc: 'Direct burned-in video subtitles' },
                    { id: 'None', label: 'None', desc: 'Turn off subtitles by default' },
                  ].map((item) => {
                    const isSelected = (settings.subtitlePreference || 'Automatic') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('subtitlePreference', item.id);
                          setPlaybackPicker(null);
                          showToast(`Subtitle preference set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Subtitle Appearance */}
          {playbackPicker === 'subtitleAppearance' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setPlaybackPicker(null)}
            >
              <div
                className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Subtitle Appearance</h3>
                  <button
                    type="button"
                    onClick={() => setPlaybackPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Subtitle Live Preview Box */}
                <div className="relative w-full h-28 bg-[#0a0a0f] rounded-xl border border-white/10 overflow-hidden flex flex-col items-center justify-center p-3">
                  <div className="absolute top-2 left-2 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                    Preview
                  </div>
                  <div
                    style={{
                      fontFamily: settings.subtitleFont || 'Netflix Sans',
                      fontSize: `${settings.subtitleSize || 15}px`,
                      transform: `translateY(${(settings.subtitleElevation ?? -10) * 0.4}px)`,
                      textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)',
                    }}
                    className="text-white font-medium text-center leading-tight tracking-wide"
                  >
                    Where the journey begins.
                    <br />
                    <span className="text-yellow-300">旅の始まり。</span>
                  </div>
                </div>

                {/* Font Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Netflix Sans', 'Outfit', 'Inter', 'Roboto', 'Montserrat', 'Rubik'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => updateSetting('subtitleFont', f)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-center ${
                          (settings.subtitleFont || 'Netflix Sans') === f
                            ? 'bg-[#a855f7] text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/70 uppercase tracking-wider">Font Size</span>
                    <span className="font-bold text-[#c084fc]">{settings.subtitleSize || 15}sp</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="28"
                    step="1"
                    value={settings.subtitleSize || 15}
                    onChange={(e) => updateSetting('subtitleSize', Number(e.target.value))}
                    className="w-full accent-[#a855f7] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>12sp (Small)</span>
                    <span>15sp (Standard)</span>
                    <span>28sp (Large)</span>
                  </div>
                </div>

                {/* Elevation Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/70 uppercase tracking-wider">Vertical Elevation</span>
                    <span className="font-bold text-[#c084fc]">{settings.subtitleElevation ?? -10}%</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="5"
                    value={settings.subtitleElevation ?? -10}
                    onChange={(e) => updateSetting('subtitleElevation', Number(e.target.value))}
                    className="w-full accent-[#a855f7] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>Bottom (-30%)</span>
                    <span>-10% (Default)</span>
                    <span>Higher (+30%)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlaybackPicker(null);
                      showToast('Subtitle appearance saved');
                    }}
                    className="w-full py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Playback Speed */}
          {playbackPicker === 'playbackSpeed' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setPlaybackPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Playback Speed</h3>
                  <button
                    type="button"
                    onClick={() => setPlaybackPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: '0.5x', label: '0.5x', desc: 'Half speed slow motion' },
                    { id: '0.75x', label: '0.75x', desc: 'Slightly slower pace' },
                    { id: '1x', label: '1x', desc: 'Normal speed (Default)' },
                    { id: '1.25x', label: '1.25x', desc: 'Brisk pacing' },
                    { id: '1.5x', label: '1.5x', desc: 'Fast forward speed' },
                    { id: '1.75x', label: '1.75x', desc: 'Super fast pace' },
                    { id: '2x', label: '2x', desc: 'Double speed' },
                  ].map((item) => {
                    const isSelected = (settings.playbackSpeed || '1x') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('playbackSpeed', item.id);
                          setPlaybackPicker(null);
                          showToast(`Playback speed set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= FULL SCREEN READER SHEET (Exact pixel-accurate reproduction of Screenshot_20260905_195354_Anify.jpg) ================= */}
      {settingsSubPage === 'reader' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-5 sm:px-6 pb-28">
            {/* Top Bar: Clean ArrowLeft & "Reader" Header matching screenshot */}
            <div className="flex items-center gap-5 pt-8 pb-7">
              <button
                type="button"
                onClick={() => setSettingsSubPage(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-white tracking-normal">
                Reader
              </h1>
            </div>

            {/* List of 12 options matching Screenshot_20260905_195354_Anify.jpg */}
            <div className="flex flex-col space-y-6 pt-1">
              {/* 1. Manga Reader Mode */}
              <div
                onClick={() => setReaderPicker('mangaReaderMode')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Manga Reader Mode
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.mangaReaderMode || 'Paged'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* 2. Page Turn Animation */}
              <div
                onClick={() => setReaderPicker('pageTurnAnimation')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Page Turn Animation
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.pageTurnAnimation || 'Default'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* 3. Paged Reader Direction */}
              <div
                onClick={() => setReaderPicker('pagedReaderDirection')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Paged Reader Direction
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.pagedReaderDirection || 'Left to Right'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* 4. Image Scale */}
              <div
                onClick={() => setReaderPicker('imageScale')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Image Scale
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.imageScale || 'Fit'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* 5. Zoom Start */}
              <div
                onClick={() => setReaderPicker('zoomStart')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Zoom Start
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.zoomStart || 'Auto'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* 6. Tap Navigation */}
              <div
                onClick={() => setReaderPicker('tapNavigation')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Tap Navigation
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.tapNavigation || 'Edges'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* 7. Reader Background */}
              <div
                onClick={() => setReaderPicker('readerBackground')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Reader Background
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.readerBackground || 'Black'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>

              {/* 8. Crop Borders */}
              <div
                onClick={() => {
                  const nextVal = !settings.cropBorders;
                  updateSetting('cropBorders', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Crop Borders
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    Trim plain page margins in paged modes
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={!!settings.cropBorders}
                    onChange={(v) => {
                      updateSetting('cropBorders', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(15);
                      }
                    }}
                  />
                </div>
              </div>

              {/* 9. Automatic Webtoon */}
              <div
                onClick={() => {
                  const nextVal = !settings.automaticWebtoon;
                  updateSetting('automaticWebtoon', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Automatic Webtoon
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    Use long strip mode when decoded pages are tall
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.automaticWebtoon ?? true}
                    onChange={(v) => {
                      updateSetting('automaticWebtoon', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(15);
                      }
                    }}
                  />
                </div>
              </div>

              {/* 10. Wide Page Zoom */}
              <div
                onClick={() => {
                  const nextVal = !settings.widePageZoom;
                  updateSetting('widePageZoom', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Wide Page Zoom
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    Fit wide landscape pages to screen width
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.widePageZoom ?? true}
                    onChange={(v) => {
                      updateSetting('widePageZoom', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(15);
                      }
                    }}
                  />
                </div>
              </div>

              {/* 11. Keep Screen On */}
              <div
                onClick={() => {
                  const nextVal = !settings.keepScreenOn;
                  updateSetting('keepScreenOn', nextVal);
                  if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Keep Screen On
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    Prevent sleep while the manga reader is open
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <AppToggleSwitch
                    checked={settings.keepScreenOn ?? true}
                    onChange={(v) => {
                      updateSetting('keepScreenOn', v);
                      if (settings.appHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(15);
                      }
                    }}
                  />
                </div>
              </div>

              {/* 12. Preload Pages */}
              <div
                onClick={() => setReaderPicker('preloadPages')}
                className="flex items-center justify-between cursor-pointer group py-1.5 transition-colors"
              >
                <div className="pr-4">
                  <h2 className="text-[16.5px] font-bold text-white tracking-normal leading-tight">
                    Preload Pages
                  </h2>
                  <p className="text-[13.5px] text-[#8e8e98] mt-1 font-normal tracking-normal leading-normal">
                    {settings.preloadPages ? `${settings.preloadPages} pages around current page` : '2 pages around current page'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b876fc] shrink-0 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Modal Picker for Manga Reader Mode */}
          {readerPicker === 'mangaReaderMode' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Manga Reader Mode</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Paged', label: 'Paged', desc: 'Single or double page turning' },
                    { id: 'Vertical', label: 'Continuous (Vertical)', desc: 'Smooth vertical scroll stream' },
                    { id: 'Webtoon', label: 'Webtoon', desc: 'Seamless continuous vertical strip' },
                  ].map((item) => {
                    const isSelected = (settings.mangaReaderMode || 'Paged') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('mangaReaderMode', item.id as any);
                          setReaderPicker(null);
                          showToast(`Reader mode set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Page Turn Animation */}
          {readerPicker === 'pageTurnAnimation' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Page Turn Animation</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Default', label: 'Default', desc: 'Standard smooth transition' },
                    { id: 'Slide', label: 'Slide', desc: 'Sliding carousel motion' },
                    { id: 'Curl', label: 'Curl / Flip', desc: 'Realistic book page curl' },
                    { id: 'Fade', label: 'Fade', desc: 'Gentle opacity crossfade' },
                    { id: 'None', label: 'None', desc: 'Instant page swap' },
                  ].map((item) => {
                    const isSelected = (settings.pageTurnAnimation || 'Default') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('pageTurnAnimation', item.id);
                          setReaderPicker(null);
                          showToast(`Page animation set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Paged Reader Direction */}
          {readerPicker === 'pagedReaderDirection' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Paged Reader Direction</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Left to Right', label: 'Left to Right', desc: 'Western standard reading format' },
                    { id: 'Right to Left', label: 'Right to Left', desc: 'Traditional Japanese Manga (RTL)' },
                    { id: 'Vertical', label: 'Vertical', desc: 'Top to bottom orientation' },
                  ].map((item) => {
                    const isSelected = (settings.pagedReaderDirection || 'Left to Right') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('pagedReaderDirection', item.id as any);
                          setReaderPicker(null);
                          showToast(`Direction set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Image Scale */}
          {readerPicker === 'imageScale' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Image Scale</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Fit', label: 'Fit', desc: 'Fit to screen bounds preserving aspect ratio' },
                    { id: 'Fit Width', label: 'Fit Width', desc: 'Match width of viewport' },
                    { id: 'Fit Height', label: 'Fit Height', desc: 'Match height of viewport' },
                    { id: 'Original Size', label: 'Original Size', desc: 'Native 1:1 image resolution' },
                    { id: 'Stretch', label: 'Stretch', desc: 'Fill entire viewing container' },
                  ].map((item) => {
                    const isSelected = (settings.imageScale || 'Fit') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('imageScale', item.id as any);
                          setReaderPicker(null);
                          showToast(`Image scale set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Zoom Start */}
          {readerPicker === 'zoomStart' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Zoom Start</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Auto', label: 'Auto', desc: 'Auto-align based on reading direction' },
                    { id: 'Left', label: 'Left', desc: 'Anchor zoomed view to top-left' },
                    { id: 'Center', label: 'Center', desc: 'Center zoomed view in viewport' },
                    { id: 'Right', label: 'Right', desc: 'Anchor zoomed view to top-right' },
                  ].map((item) => {
                    const isSelected = (settings.zoomStart || 'Auto') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('zoomStart', item.id as any);
                          setReaderPicker(null);
                          showToast(`Zoom start set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Tap Navigation */}
          {readerPicker === 'tapNavigation' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Tap Navigation</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Edges', label: 'Edges', desc: 'Tap side edges to trigger page turn' },
                    { id: 'Default', label: 'Default', desc: 'Tap left half for prev, right half for next' },
                    { id: 'Disabled', label: 'Disabled', desc: 'Navigate using gestures and controls only' },
                  ].map((item) => {
                    const isSelected = (settings.tapNavigation || 'Edges') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('tapNavigation', item.id as any);
                          setReaderPicker(null);
                          showToast(`Tap navigation set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Reader Background */}
          {readerPicker === 'readerBackground' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Reader Background</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'Black', label: 'Black', desc: 'OLED pure pitch black (#000000)' },
                    { id: 'Dark Gray', label: 'Dark Gray', desc: 'Subtle slate dark gray (#121218)' },
                    { id: 'White', label: 'White', desc: 'Crisp bright white (#FFFFFF)' },
                  ].map((item) => {
                    const isSelected = (settings.readerBackground || 'Black') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('readerBackground', item.id as any);
                          setReaderPicker(null);
                          showToast(`Background set to ${item.label}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modal Picker for Preload Pages */}
          {readerPicker === 'preloadPages' && (
            <div
              className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setReaderPicker(null)}
            >
              <div
                className="w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">Preload Pages</h3>
                  <button
                    type="button"
                    onClick={() => setReaderPicker(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 1, label: '1 page around current page', desc: 'Minimal data usage' },
                    { id: 2, label: '2 pages around current page', desc: 'Balanced speed and caching (Default)' },
                    { id: 3, label: '3 pages around current page', desc: 'Fast reading with buffer' },
                    { id: 5, label: '5 pages around current page', desc: 'High preloading for fast flipping' },
                    { id: 10, label: '10 pages around current page', desc: 'Maximum prefetch ahead' },
                  ].map((item) => {
                    const isSelected = (settings.preloadPages || 2) === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          updateSetting('preloadPages', item.id);
                          setReaderPicker(null);
                          showToast(`Preload pages set to ${item.id}`);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#a855f7]/20 text-[#c084fc]'
                            : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-white/50">{item.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#c084fc] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= FULL SCREEN DOWNLOADS SHEET (Exact pixel-accurate reproduction of Screenshot_20260903_235720_Anify.jpg) ================= */}
      {settingsSubPage === 'downloads' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black flex flex-col overflow-y-auto animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-5 sm:px-6">
            {/* Top Bar: Clean ArrowLeft & "Downloads" Header */}
            <div className="flex items-center gap-5 pt-8 pb-7">
              <button
                onClick={() => setSettingsSubPage(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-white tracking-normal">
                Downloads
              </h1>
            </div>

            {/* List of options matching Screenshot_20260904_071937_Anify.jpg and Screenshot_20260904_072829_Anify.jpg */}
            {(() => {
              const isCustomFolderConnected = Boolean(
                settings.downloadPermissionGranted &&
                settings.downloadPath &&
                settings.downloadPath !== 'Downloads/Anify/Downloaded'
              );

              return (
                <div className="flex flex-col space-y-7 pt-1">
                  {/* Option 1: Download Path */}
                  <div
                    onClick={handleOpenNativeStorageManager}
                    className="cursor-pointer group py-1.5 transition-colors"
                  >
                    <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                      Download Path
                    </h2>
                    <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight">
                      {isCustomFolderConnected
                        ? (settings.downloadPath.startsWith('Internal storage/')
                            ? settings.downloadPath
                            : `Internal storage/${settings.downloadPath}`)
                        : 'Downloads/Anify/Downloaded'}
                    </p>
                  </div>

                  {/* Option 2: App Private Storage (Shown ONLY when a custom folder is connected) */}
                  {isCustomFolderConnected && (
                    <div
                      onClick={() => {
                        updateSetting('downloadPath', 'Downloads/Anify/Downloaded');
                        updateSetting('downloadUri', undefined);
                        updateSetting('downloadPermissionGranted', false);
                        safeRemoveItem('satori_saf_persistable_uri');
                        safeRemoveItem('satori_saf_persistable_timestamp');
                        showToast('Download path reset to App Private Storage');
                      }}
                      className="cursor-pointer group py-1.5 transition-colors"
                    >
                      <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                        App Private Storage
                      </h2>
                      <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight">
                        Reset download path
                      </p>
                    </div>
                  )}

                  {/* Option 3: Delete Files By Default toggle */}
                  <div
                    onClick={() => {
                      updateSetting('deleteFilesByDefault', !settings.deleteFilesByDefault);
                    }}
                    style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
                    className="flex items-center justify-between cursor-pointer select-none py-1.5 px-2 -mx-2 rounded-xl"
                  >
                    <div className="pr-4 select-none">
                      <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">
                        Delete Files By Default
                      </h2>
                      <p className="text-[13.5px] text-white/60 mt-1 font-normal tracking-tight">
                        Preselect file deletion when removing downloads
                      </p>
                    </div>

                    {/* Toggle switch identical to other setting toggles */}
                    <AppToggleSwitch
                      checked={settings.deleteFilesByDefault}
                      onChange={(next) => {
                        updateSetting('deleteFilesByDefault', next);
                      }}
                    />
                  </div>

                  {/* Hidden native input triggering the user's real OS File/Storage Manager */}
                  <input
                    type="file"
                    ref={folderPickerInputRef}
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const firstFile = files[0];
                        const relativePath = (firstFile as any).webkitRelativePath || '';
                        const folderName = relativePath.split('/')[0] || firstFile.name || 'Selected Folder';
                        const formatted = folderName.startsWith('Internal storage/')
                          ? folderName
                          : `Internal storage/${folderName}`;
                        updateSetting('downloadPath', formatted);
                        updateSetting(
                          'downloadUri',
                          `content://com.android.externalstorage.documents/tree/primary%3A${encodeURIComponent(folderName)}`
                        );
                        updateSetting('downloadPermissionGranted', true);
                        showToast(`Download path set: ${formatted}`);
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= FULL SCREEN BOTTOM SHEET: SUBSCRIPTION (Exact replica of Screenshot_20260905_184148_Anify.jpg and Screenshot_20260905_184212_Anify.jpg) ================= */}
      {activeModal === 'subscription' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-4 sm:px-6 pb-12">
            {/* Top Bar: Back Arrow & Subscription */}
            <div className="flex items-center gap-5 pt-8 pb-5">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.3]" />
              </button>
              <h1 className="text-[21px] sm:text-[23px] font-bold text-white tracking-tight">
                Subscription
              </h1>
            </div>

            {/* Top Purple Banner */}
            <div className="bg-[#28153e] rounded-[22px] p-5 mb-5 text-white">
              <h2 className="text-[19px] sm:text-[20px] font-bold tracking-tight mb-1">
                Subscription
              </h2>
              <p className="text-[13px] text-white/80 font-normal">
                Cancel anytime in Google Play.
              </p>
              <p className="text-[14px] font-semibold text-white/95 mt-0.5">
                {subscriptionTab === 'anime'
                  ? 'No active anime subscription.'
                  : 'No active manga and novel subscription.'}
              </p>
            </div>

            {/* Tabs: Anime | Manga & Novels */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSubscriptionTab('anime')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                  subscriptionTab === 'anime'
                    ? 'bg-[#351854] text-[#cf8aff] border border-[#a259ff]/30 font-semibold'
                    : 'bg-transparent text-white/60 hover:text-white'
                }`}
              >
                Anime
              </button>
              <button
                type="button"
                onClick={() => setSubscriptionTab('manga_novels')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                  subscriptionTab === 'manga_novels'
                    ? 'bg-[#351854] text-[#cf8aff] border border-[#a259ff]/30 font-semibold'
                    : 'bg-transparent text-white/60 hover:text-white'
                }`}
              >
                Manga & Novels
              </button>
            </div>

            {/* Plan Cards Container */}
            <div className="flex flex-col space-y-4">
              {subscriptionTab === 'anime' ? (
                /* === ANIME TAB PLANS === */
                <>
                  {/* Plan 1: Lite Anime */}
                  <div className="bg-[#0e0e13] border border-white/[0.09] rounded-[20px] p-5 flex flex-col space-y-3.5 shadow-lg">
                    <div>
                      <h3 className="text-[14px] font-bold text-white tracking-tight">Lite Anime</h3>
                      <div className="text-[26px] font-extrabold text-white tracking-tight mt-0.5">
                        $2.99<span className="text-[15px] font-medium text-white/70">/mo</span>
                      </div>
                      <p className="text-[12px] text-white/50 font-normal mt-0.5">
                        Auto-renews monthly. Cancel anytime.
                      </p>
                    </div>

                    <p className="text-[13.5px] font-bold text-white leading-snug">
                      Ad-free anime playback for everyday watching.
                    </p>

                    <div className="space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Ad-free anime streaming</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/40">
                        <X className="w-4 h-4 text-white/30 shrink-0 stroke-[2]" />
                        <span>Picture-in-Picture mode</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/40">
                        <X className="w-4 h-4 text-white/30 shrink-0 stroke-[2]" />
                        <span>Anime downloads</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Redirecting to Google Play subscription...')}
                      className="w-full py-3 rounded-full bg-[#1c1c24] hover:bg-[#252530] active:scale-[0.99] text-white/60 hover:text-white font-semibold text-[13.5px] transition-all cursor-pointer mt-1"
                    >
                      Choose Lite Anime
                    </button>
                  </div>

                  {/* Plan 2: Pro Anime */}
                  <div className="bg-[#0e0e13] border border-white/[0.09] rounded-[20px] p-5 flex flex-col space-y-3.5 shadow-lg">
                    <div>
                      <h3 className="text-[14px] font-bold text-white tracking-tight">Pro Anime</h3>
                      <div className="text-[26px] font-extrabold text-white tracking-tight mt-0.5">
                        $4.99<span className="text-[15px] font-medium text-white/70">/mo</span>
                      </div>
                      <p className="text-[12px] text-white/50 font-normal mt-0.5">
                        Auto-renews monthly. Cancel anytime.
                      </p>
                    </div>

                    <p className="text-[13.5px] font-bold text-white leading-snug">
                      Ad-free anime playback, Picture-in-Picture mode, and anime downloads.
                    </p>

                    <div className="space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Ad-free anime streaming</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Picture-in-Picture mode</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Anime downloads</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Redirecting to Google Play subscription...')}
                      className="w-full py-3 rounded-full bg-[#1c1c24] hover:bg-[#252530] active:scale-[0.99] text-white/60 hover:text-white font-semibold text-[13.5px] transition-all cursor-pointer mt-1"
                    >
                      Go Pro Anime
                    </button>
                  </div>

                  {/* Plan 3: Pro Annual Anime */}
                  <div className="bg-[#0e0e13] border border-white/[0.09] rounded-[20px] p-5 flex flex-col space-y-3.5 shadow-lg">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-[8px] bg-white/[0.07] border border-white/10 text-[11.5px] font-semibold text-white/70 mb-2">
                        Best value
                      </div>
                      <h3 className="text-[14px] font-bold text-white tracking-tight">
                        Pro Annual Anime
                      </h3>
                      <div className="text-[26px] font-extrabold text-white tracking-tight mt-0.5">
                        $3.99<span className="text-[15px] font-medium text-white/70">/mo</span>
                      </div>
                      <p className="text-[12px] text-white/50 font-normal mt-0.5">
                        Billed once per year and renews annually.
                      </p>
                      <p className="text-[12.5px] font-bold text-[#bd85f8] mt-1">
                        Save 20%% vs Pro Monthly
                      </p>
                    </div>

                    <p className="text-[13.5px] font-bold text-white leading-snug">
                      All Pro anime perks with the lowest monthly equivalent.
                    </p>

                    <div className="space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Ad-free anime streaming</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Picture-in-Picture mode</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Anime downloads</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Redirecting to Google Play subscription...')}
                      className="w-full py-3 rounded-full bg-[#1c1c24] hover:bg-[#252530] active:scale-[0.99] text-white/60 hover:text-white font-semibold text-[13.5px] transition-all cursor-pointer mt-1"
                    >
                      Go Pro Annual Anime
                    </button>
                  </div>
                </>
              ) : (
                /* === MANGA & NOVELS TAB PLANS === */
                <>
                  {/* Plan 1: Lite Manga & Novels */}
                  <div className="bg-[#0e0e13] border border-white/[0.09] rounded-[20px] p-5 flex flex-col space-y-3.5 shadow-lg">
                    <div>
                      <h3 className="text-[14px] font-bold text-white tracking-tight">
                        Lite Manga & Novels
                      </h3>
                      <div className="text-[26px] font-extrabold text-white tracking-tight mt-0.5">
                        $2.99<span className="text-[15px] font-medium text-white/70">/mo</span>
                      </div>
                      <p className="text-[12px] text-white/50 font-normal mt-0.5">
                        Auto-renews monthly. Cancel anytime.
                      </p>
                    </div>

                    <p className="text-[13.5px] font-bold text-white leading-snug">
                      Ad-free manga and novel reading for everyday sessions.
                    </p>

                    <div className="space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Ad-free manga and novel reading</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/40">
                        <X className="w-4 h-4 text-white/30 shrink-0 stroke-[2]" />
                        <span>Manga and novel downloads</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Redirecting to Google Play subscription...')}
                      className="w-full py-3 rounded-full bg-[#1c1c24] hover:bg-[#252530] active:scale-[0.99] text-white/60 hover:text-white font-semibold text-[13.5px] transition-all cursor-pointer mt-1"
                    >
                      Choose Lite Manga & Novels
                    </button>
                  </div>

                  {/* Plan 2: Pro Manga & Novels */}
                  <div className="bg-[#0e0e13] border border-white/[0.09] rounded-[20px] p-5 flex flex-col space-y-3.5 shadow-lg">
                    <div>
                      <h3 className="text-[14px] font-bold text-white tracking-tight">
                        Pro Manga & Novels
                      </h3>
                      <div className="text-[26px] font-extrabold text-white tracking-tight mt-0.5">
                        $4.99<span className="text-[15px] font-medium text-white/70">/mo</span>
                      </div>
                      <p className="text-[12px] text-white/50 font-normal mt-0.5">
                        Auto-renews monthly. Cancel anytime.
                      </p>
                    </div>

                    <p className="text-[13.5px] font-bold text-white leading-snug">
                      Ad-free manga and novel reading with downloads for both.
                    </p>

                    <div className="space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Ad-free manga and novel reading</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Manga and novel downloads</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Redirecting to Google Play subscription...')}
                      className="w-full py-3 rounded-full bg-[#1c1c24] hover:bg-[#252530] active:scale-[0.99] text-white/60 hover:text-white font-semibold text-[13.5px] transition-all cursor-pointer mt-1"
                    >
                      Go Pro Manga & Novels
                    </button>
                  </div>

                  {/* Plan 3: Pro Annual Manga & Novels */}
                  <div className="bg-[#0e0e13] border border-white/[0.09] rounded-[20px] p-5 flex flex-col space-y-3.5 shadow-lg">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-[8px] bg-white/[0.07] border border-white/10 text-[11.5px] font-semibold text-white/70 mb-2">
                        Best value
                      </div>
                      <h3 className="text-[14px] font-bold text-white tracking-tight">
                        Pro Annual Manga & Novels
                      </h3>
                      <div className="text-[26px] font-extrabold text-white tracking-tight mt-0.5">
                        $3.99<span className="text-[15px] font-medium text-white/70">/mo</span>
                      </div>
                      <p className="text-[12px] text-white/50 font-normal mt-0.5">
                        Billed once per year and renews annually.
                      </p>
                      <p className="text-[12.5px] font-bold text-[#bd85f8] mt-1">
                        Save 20%% vs Pro Monthly
                      </p>
                    </div>

                    <p className="text-[13.5px] font-bold text-white leading-snug">
                      All Pro manga and novel perks with the lowest monthly equivalent.
                    </p>

                    <div className="space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Ad-free manga and novel reading</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-white/90">
                        <div className="w-4 h-4 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span>Manga and novel downloads</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Redirecting to Google Play subscription...')}
                      className="w-full py-3 rounded-full bg-[#1c1c24] hover:bg-[#252530] active:scale-[0.99] text-white/60 hover:text-white font-semibold text-[13.5px] transition-all cursor-pointer mt-1"
                    >
                      Go Pro Annual Manga & Novels
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Actions: Restore & Manage in Play */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => showToast('Checking Google Play purchase receipts...')}
                className="py-3.5 rounded-full bg-[#101015] border border-white/20 hover:border-white/40 active:scale-[0.98] text-white font-bold text-[14px] transition-all cursor-pointer text-center"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={() => showToast('Opening Google Play Subscriptions...')}
                className="py-3.5 rounded-full bg-[#101015] border border-white/20 hover:border-white/40 active:scale-[0.98] text-white font-bold text-[14px] transition-all cursor-pointer text-center"
              >
                Manage in Play
              </button>
            </div>

            {/* Bottom Disclaimer */}
            <p className="text-[11.5px] text-white/50 text-left leading-relaxed mt-4">
              Subscriptions auto-renew unless canceled at least 24 hours before renewal. Manage or cancel anytime in Google Play.
            </p>
          </div>
        </div>
      )}


      {/* ================= FULL SCREEN BOTTOM SHEET: REPORT TO DEV (Exact replica of Screenshot_20260905_183812_Anify.jpg) ================= */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-4 sm:px-6 pb-12">
            {/* Top Bar: Back Arrow & Title */}
            <div className="flex items-center gap-5 pt-8 pb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setShowReportTypePicker(false);
                  setShowIssueTypePicker(false);
                }}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.3]" />
              </button>
              <h1 className="text-[21px] sm:text-[23px] font-bold text-white tracking-tight">
                Report to Dev
              </h1>
            </div>

            {/* Container 1: Report Type & Issue Type */}
            <div className="bg-[#101014] border border-white/[0.08] rounded-[18px] divide-y divide-white/[0.08] shadow-lg mb-5 overflow-hidden">
              {/* Row 1: Report Type */}
              <button
                type="button"
                onClick={() => {
                  setShowIssueTypePicker(false);
                  setShowReportTypePicker(!showReportTypePicker);
                }}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <h2 className="text-[15px] font-bold text-white tracking-tight">Report Type</h2>
                  <p className="text-[13px] text-white/70 font-medium">{reportType}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a259ff] stroke-[2.5]" />
              </button>

              {/* Row 2: Issue Type */}
              <button
                type="button"
                onClick={() => {
                  setShowReportTypePicker(false);
                  setShowIssueTypePicker(!showIssueTypePicker);
                }}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <h2 className="text-[15px] font-bold text-white tracking-tight">Issue Type</h2>
                  <p
                    className={`text-[13px] font-medium ${
                      issueType === 'Choose an issue' ? 'text-white/50' : 'text-[#bd85f8]'
                    }`}
                  >
                    {issueType}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a259ff] stroke-[2.5]" />
              </button>
            </div>

            {/* Report Type Picker Dropdown Modal / Sheet */}
            {showReportTypePicker && (
              <div className="bg-[#15151c] border border-white/10 rounded-[18px] p-2 mb-4 space-y-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                  Select Report Type
                </div>
                {['Anime', 'Manga', 'Novel', 'Application'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setReportType(type);
                      setShowReportTypePicker(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-[14px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      reportType === type
                        ? 'bg-[#8c52ff]/20 text-purple-300 font-bold'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <span>{type}</span>
                    {reportType === type && <Check className="w-4 h-4 text-[#bd85f8]" />}
                  </button>
                ))}
              </div>
            )}

            {/* Issue Type Picker Dropdown Modal / Sheet */}
            {showIssueTypePicker && (
              <div className="bg-[#15151c] border border-white/10 rounded-[18px] p-2 mb-4 space-y-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[260px] overflow-y-auto">
                <div className="px-3 py-2 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                  Select Issue
                </div>
                {[
                  'Playback Buffering / Loading error',
                  'Missing Episode / Chapter',
                  'Broken Video Stream or Mirror',
                  'Subtitles Out of Sync / Missing',
                  'Audio Track Mismatch / Missing Dub',
                  'Incorrect Metadata / Thumbnail',
                  'Page Load or Reader glitch',
                  'App Crash / UI bug',
                  'Other feedback',
                ].map((iss) => (
                  <button
                    key={iss}
                    type="button"
                    onClick={() => {
                      setIssueType(iss);
                      setShowIssueTypePicker(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-[13.5px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      issueType === iss
                        ? 'bg-[#8c52ff]/20 text-purple-300 font-bold'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <span>{iss}</span>
                    {issueType === iss && <Check className="w-4 h-4 text-[#bd85f8]" />}
                  </button>
                ))}
              </div>
            )}

            {/* Section: Affected Anime */}
            <div className="space-y-3.5">
              <h3 className="text-[15px] sm:text-[16px] font-bold text-white tracking-tight">
                Affected {reportType === 'Manga' ? 'Manga' : reportType === 'Novel' ? 'Novel' : 'Anime'}
              </h3>

              {/* Search Anime Field */}
              <div className="border border-white/20 rounded-[14px] px-4 py-3 sm:py-3.5 flex items-center gap-3 bg-transparent focus-within:border-white/50 transition-colors">
                <Search className="w-5 h-5 text-white/60 shrink-0" />
                <input
                  type="text"
                  value={affectedAnime}
                  onChange={(e) => setAffectedAnime(e.target.value)}
                  placeholder={`Search ${
                    reportType === 'Manga' ? 'Manga' : reportType === 'Novel' ? 'Novel' : 'Anime'
                  }`}
                  className="w-full bg-transparent text-[14.5px] text-white placeholder:text-white/60 outline-none font-medium"
                />
              </div>

              {/* Episode Field */}
              <div className="border border-white/20 rounded-[14px] px-4 py-3 sm:py-3.5 flex items-center bg-transparent focus-within:border-white/50 transition-colors">
                <input
                  type="text"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  placeholder={
                    reportType === 'Manga' || reportType === 'Novel' ? 'Chapter' : 'Episode'
                  }
                  className="w-full bg-transparent text-[14.5px] text-white placeholder:text-white/60 outline-none font-medium"
                />
              </div>

              {/* Details Field */}
              <div className="border border-white/20 rounded-[14px] p-4 bg-transparent focus-within:border-white/50 transition-colors min-h-[160px]">
                <textarea
                  rows={5}
                  value={reportDetails}
                  onChange={(e) => {
                    if (e.target.value.length <= 4000) {
                      setReportDetails(e.target.value);
                    }
                  }}
                  placeholder="Details"
                  className="w-full bg-transparent text-[14.5px] text-white placeholder:text-white/60 outline-none resize-none font-medium min-h-[125px]"
                />
              </div>

              {/* Character counter right under Details box */}
              <div className="text-[13px] font-normal text-white/60 pl-0.5 -mt-1">
                {reportDetails.length} / 4000
              </div>

              {/* Note text */}
              <p className="text-[13px] text-white/60 leading-normal pt-1">
                App version and device details are attached automatically.
              </p>

              {/* Submit Report button */}
              <button
                type="button"
                onClick={() => {
                  if (!reportDetails.trim() && issueType === 'Choose an issue' && !affectedAnime.trim()) {
                    showToast('Please provide details or select an issue.');
                    return;
                  }
                  showToast('Report submitted successfully! Thank you.');
                  setTimeout(() => {
                    setActiveModal(null);
                    setReportDetails('');
                    setAffectedAnime('');
                    setEpisodeNumber('');
                    setIssueType('Choose an issue');
                  }, 1200);
                }}
                className="w-full py-3.5 sm:py-4 rounded-[16px] bg-[#9d4edd] hover:bg-[#8e3ee0] active:scale-[0.99] text-white font-bold text-[15px] tracking-wide transition-all shadow-lg cursor-pointer mt-3"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL SCREEN BOTTOM SHEET: FAQS (Exact replica of Screenshot_20260905_182920_Anify.jpg) ================= */}
      {activeModal === 'faqs' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-4 sm:px-6 pb-12">
            {/* Top Bar: Back Arrow & FAQs */}
            <div className="flex items-center gap-5 pt-8 pb-6">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.3]" />
              </button>
              <h1 className="text-[21px] sm:text-[23px] font-bold text-white tracking-tight">
                FAQs
              </h1>
            </div>

            {/* List of 10 Cards with 01..10 Purple Pill Badges */}
            <div className="flex flex-col space-y-3 pt-1">
              {faqsList.map((item, idx) => {
                const isOpen = expandedFaq === idx;
                const paddedIndex = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={idx}
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="bg-[#101014] border border-white/[0.08] rounded-[18px] p-3.5 sm:p-4 shadow-lg transition-all cursor-pointer hover:border-white/15"
                  >
                    <div className="flex items-center gap-3.5 justify-between">
                      {/* Purple Index Pill */}
                      <div className="w-8 h-8 rounded-xl bg-[#261539] border border-[#8c52ff]/25 text-[#bd85f8] flex items-center justify-center text-[12.5px] font-extrabold shrink-0">
                        {paddedIndex}
                      </div>
                      {/* Question Title */}
                      <h3 className="text-[14px] sm:text-[14.5px] font-bold text-white tracking-tight leading-snug flex-1">
                        {item.q}
                      </h3>
                      {/* Right Chevron */}
                      <ChevronRight
                        className={`w-4 h-4 text-white/50 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-90 text-purple-400' : ''
                        }`}
                      />
                    </div>
                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-white/[0.08] text-[13px] sm:text-[13.5px] text-white/70 leading-[1.6] pl-[44px]">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL SCREEN BOTTOM SHEET: MANAGE INVITE KEY (Exact replica of Screenshot_20260905_182649_Anify.jpg) ================= */}
      {activeModal === 'inviteKey' && (
        <div className="fixed inset-0 z-[6000] w-full h-full bg-black text-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250 select-none">
          <div className="w-full max-w-xl mx-auto flex flex-col flex-1 px-4 sm:px-6">
            {/* Top Bar: Back Arrow & Manage Invite Key */}
            <div className="flex items-center gap-5 pt-8 pb-6">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer p-1 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.3]" />
              </button>
              <h1 className="text-[21px] sm:text-[23px] font-bold text-white tracking-tight">
                Manage Invite Key
              </h1>
            </div>

            {/* Main Cards List matching Screenshot */}
            <div className="flex flex-col space-y-3.5 pt-1">
              {/* Card 1: Invite Key status */}
              <div className="bg-[#101014] border border-white/[0.08] rounded-[18px] p-4 sm:p-5 space-y-2 shadow-lg">
                <h2 className="text-[15px] font-bold text-white tracking-tight">
                  Invite Key
                </h2>
                <div className="flex items-center gap-2.5 text-[14px] text-white/95 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff7675] shrink-0" />
                  <span>Not eligible to generate a key</span>
                </div>
              </div>

              {/* Card 2: ONLY INVITE PEOPLE YOU TRUST */}
              <div className="bg-[#101014] border border-white/[0.08] rounded-[18px] p-4 sm:p-5 space-y-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#8c52ff] flex items-center justify-center shrink-0">
                    <span className="text-white text-[12px] font-black italic select-none">i</span>
                  </div>
                  <span className="text-[13.5px] sm:text-[14px] font-bold text-white tracking-wide uppercase">
                    ONLY INVITE PEOPLE YOU TRUST
                  </span>
                </div>
                <p className="text-[13px] sm:text-[13.5px] text-white/70 leading-[1.6] font-normal">
                  If someone you directly invite is suspended or banned, the same penalty is automatically applied to your account. It affects only the direct inviter, does not continue to another inviter, and cannot be reversed once applied.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Subcomponents for Settings
const SettingCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-4 bg-[#121218] rounded-2xl border border-white/10 space-y-2.5">
    <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">{title}</label>
    {children}
  </div>
);

const SettingToggle: React.FC<{
  title: string;
  desc: string;
  value: boolean;
  onChange: (val: boolean) => void;
}> = ({ title, desc, value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    className="flex items-center justify-between p-4 bg-[#121218] rounded-2xl border border-white/10 cursor-pointer hover:border-white/20 transition-all"
  >
    <div className="flex-1 pr-4">
      <h4 className="text-xs sm:text-sm font-bold text-white">{title}</h4>
      <p className="text-[11px] text-white/50 mt-0.5">{desc}</p>
    </div>
    <AppToggleSwitch checked={value} onChange={onChange} />
  </div>
);

const SettingSlider: React.FC<{
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}> = ({ title, value, unit, min, max, step, onChange }) => (
  <div className="p-4 bg-[#121218] rounded-2xl border border-white/10 space-y-2">
    <div className="flex justify-between items-center text-xs font-bold">
      <span className="text-white/70 uppercase">{title}</span>
      <span className="text-purple-400 font-mono font-extrabold">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
    />
  </div>
);
