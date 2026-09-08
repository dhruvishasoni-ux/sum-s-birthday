import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  WishCard,
  Story,
  PersonalityWordEntry,
  VoiceNote,
  SecretStar,
  UserAccount,
  BlackHoleWish,
  ModalType
} from '../types/celestial';
import { DEFAULT_SECRET_STARS } from '../config/secretStars';
import { DEFAULT_ACCENT_COLOR } from '../services/storage';

interface SkyContextType {
  // Session Authentication & Current User
  currentUser: UserAccount | null;
  registeredAccounts: UserAccount[];
  signUp: (username: string, password: string, avatarUrl: string) => { success: boolean; error?: string };
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  accentColor: string;

  // Sky coordinates & viewport
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  focusOnCoordinates: (xPercent: number, yPercent: number) => void;

  // Celestial objects (In-Memory Session Only)
  wishes: WishCard[];
  stories: Story[];
  personalityWords: PersonalityWordEntry[];
  voiceNotes: VoiceNote[];
  secretStars: SecretStar[];
  blackHoleWishes: BlackHoleWish[];
  isNebulaOpened: boolean;
  isBlackHoleOpened: boolean;

  // Actions
  addWish: (wish: WishCard) => void;
  openWish: (id: string) => void;

  addStory: (story: Story) => void;
  openStory: (id: string) => void;

  addPersonalityWord: (word: string) => { success: boolean; error?: string };
  openPersonality: () => void;

  addVoiceNote: (note: VoiceNote) => void;
  openVoiceNote: (id: string) => void;
  markVoiceNoteHeard: (id: string) => void;

  discoverSecretStar: (id: string) => void;

  addBlackHoleWish: (wishText: string) => { success: boolean; error?: string };
  openBlackHole: () => void;

  // Modals & Active objects
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  authNotice: string | null;
  setAuthNotice: (notice: string | null) => void;
  authMode: 'choice' | 'login' | 'signup';
  setAuthMode: (mode: 'choice' | 'login' | 'signup') => void;

  activeWishId: string | null;
  setActiveWishId: (id: string | null) => void;

  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;

  activeVoiceNoteId: string | null;
  setActiveVoiceNoteId: (id: string | null) => void;

  activeSecretStarId: string | null;
  setActiveSecretStarId: (id: string | null) => void;

  // Dynamic statistics
  friendsCount: number;
  unopenedCount: number;
}

const SkyContext = createContext<SkyContextType | null>(null);

const COLOR_PALETTE = [
  '#f472b6', '#c084fc', '#60a5fa', '#38bdf8', '#4ade80',
  '#facc15', '#fb923c', '#e879f9', '#a78bfa', '#f87171'
];

export const SkyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In-Memory Session Accounts & Login State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [registeredAccounts, setRegisteredAccounts] = useState<UserAccount[]>([]);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'choice' | 'login' | 'signup'>('choice');

  const accentColor = DEFAULT_ACCENT_COLOR;

  // Sky Pan & Zoom with clamping
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // In-Memory Session Data (Resets completely on refresh)
  const [wishes, setWishes] = useState<WishCard[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [personalityWords, setPersonalityWords] = useState<PersonalityWordEntry[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [secretStars, setSecretStars] = useState<SecretStar[]>(DEFAULT_SECRET_STARS);
  const [blackHoleWishes, setBlackHoleWishes] = useState<BlackHoleWish[]>([]);
  const [isNebulaOpened, setIsNebulaOpened] = useState<boolean>(false);
  const [isBlackHoleOpened, setIsBlackHoleOpened] = useState<boolean>(false);

  // Modal State Management
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeWishId, setActiveWishId] = useState<string | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeVoiceNoteId, setActiveVoiceNoteId] = useState<string | null>(null);
  const [activeSecretStarId, setActiveSecretStarId] = useState<string | null>(null);

  // Sign Up Handler
  const signUp = useCallback((username: string, password: string, avatarUrl: string) => {
    const trimmedUsername = username.trim();
    if (!avatarUrl || !avatarUrl.trim()) {
      return { success: false, error: 'A profile picture is required to sign up.' };
    }
    if (!trimmedUsername) {
      return { success: false, error: 'A username is required to sign up.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'A password is required to sign up.' };
    }

    const exists = registeredAccounts.some(
      (acc) => acc.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'This username is already taken in this session. Please choose another.' };
    }

    const newAccount: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: trimmedUsername,
      password: password.trim(),
      avatarUrl: avatarUrl.trim(),
      createdAt: Date.now()
    };

    setRegisteredAccounts((prev) => [...prev, newAccount]);
    setCurrentUser(newAccount);
    setAuthNotice(null);
    return { success: true };
  }, [registeredAccounts]);

  // Login Handler
  const login = useCallback((username: string, password: string) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      return { success: false, error: 'Please enter your username.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const matchedAccount = registeredAccounts.find(
      (acc) => acc.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (!matchedAccount) {
      return { success: false, error: 'No session account found with this username. Please sign up first.' };
    }

    if (matchedAccount.password !== password.trim()) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(matchedAccount);
    setAuthNotice(null);
    return { success: true };
  }, [registeredAccounts]);

  // Logout Handler
  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const focusOnCoordinates = useCallback((xPercent: number, yPercent: number) => {
    const spaceWidth = window.innerWidth * 4;
    const spaceHeight = window.innerHeight * 4;
    const targetX = (xPercent / 100) * spaceWidth;
    const targetY = (yPercent / 100) * spaceHeight;

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    const newOffsetX = viewportCenterX - (targetX - window.innerWidth * 1.5);
    const newOffsetY = viewportCenterY - (targetY - window.innerHeight * 1.5);

    setPanOffset({ x: newOffsetX, y: newOffsetY });
  }, []);

  const addWish = (wish: WishCard) => {
    setWishes((prev) => [wish, ...prev]);
  };

  const openWish = (id: string) => {
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, unopened: false } : w)));
    setActiveWishId(id);
    setActiveModal('wish-view');
  };

  const addStory = (story: Story) => {
    setStories((prev) => [story, ...prev]);
  };

  const openStory = (id: string) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, unopened: false } : s)));
    setActiveStoryId(id);
    setActiveModal('story-view');
  };

  const addPersonalityWord = useCallback((word: string) => {
    if (!currentUser) {
      return { success: false, error: 'You must be logged in to submit a word.' };
    }

    const trimmed = word.trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter a word describing Sum.' };
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (wordCount > 2) {
      return { success: false, error: 'Please enter one or two words only.' };
    }

    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const newEntry: PersonalityWordEntry = {
      id: `word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      word: trimmed,
      creatorId: currentUser.id,
      creatorName: currentUser.username,
      creatorAvatar: currentUser.avatarUrl,
      createdAt: Date.now(),
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      color: randomColor,
      floatDelay: Math.random() * 4,
      floatDuration: 5 + Math.random() * 4
    };

    setPersonalityWords((prev) => [...prev, newEntry]);
    return { success: true };
  }, [currentUser]);

  const openPersonality = () => {
    setIsNebulaOpened(true);
    setActiveModal('personality');
  };

  const addVoiceNote = (note: VoiceNote) => {
    setVoiceNotes((prev) => [note, ...prev]);
  };

  const openVoiceNote = (id: string) => {
    setActiveVoiceNoteId(id);
    setActiveModal('voice-probe');
  };

  const markVoiceNoteHeard = (id: string) => {
    setVoiceNotes((prev) => prev.map((v) => (v.id === id ? { ...v, heard: true } : v)));
  };

  const discoverSecretStar = (id: string) => {
    setSecretStars((prev) => prev.map((s) => (s.id === id ? { ...s, discovered: true } : s)));
    setActiveSecretStarId(id);
    setActiveModal('secret-star');
  };

  const addBlackHoleWish = useCallback((wishText: string) => {
    if (!currentUser) {
      return { success: false, error: 'You must be logged in to submit to the Black Hole.' };
    }

    const trimmed = wishText.trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter a wish or prayer.' };
    }

    const newWish: BlackHoleWish = {
      id: `bh-${Date.now()}`,
      wishText: trimmed,
      creatorId: currentUser.id,
      creatorName: currentUser.username,
      creatorAvatar: currentUser.avatarUrl,
      createdAt: Date.now()
    };

    setBlackHoleWishes((prev) => [newWish, ...prev]);
    return { success: true };
  }, [currentUser]);

  const openBlackHole = () => {
    setIsBlackHoleOpened(true);
    setActiveModal('black-hole');
  };

  // Distinct friends count (contributors)
  const friendsCount = registeredAccounts.length;

  // Dynamic unopened count across universe
  const unopenedCount =
    wishes.filter((w) => w.unopened).length +
    stories.filter((s) => s.unopened).length +
    voiceNotes.filter((v) => !v.heard).length;

  return (
    <SkyContext.Provider
      value={{
        currentUser,
        registeredAccounts,
        signUp,
        login,
        logout,
        accentColor,
        panOffset,
        setPanOffset,
        zoom,
        setZoom,
        focusOnCoordinates,
        wishes,
        stories,
        personalityWords,
        voiceNotes,
        secretStars,
        blackHoleWishes,
        isNebulaOpened,
        isBlackHoleOpened,
        addWish,
        openWish,
        addStory,
        openStory,
        addPersonalityWord,
        openPersonality,
        addVoiceNote,
        openVoiceNote,
        markVoiceNoteHeard,
        discoverSecretStar,
        addBlackHoleWish,
        openBlackHole,
        activeModal,
        setActiveModal,
        authNotice,
        setAuthNotice,
        authMode,
        setAuthMode,
        activeWishId,
        setActiveWishId,
        activeStoryId,
        setActiveStoryId,
        activeVoiceNoteId,
        setActiveVoiceNoteId,
        activeSecretStarId,
        setActiveSecretStarId,
        friendsCount,
        unopenedCount
      }}
    >
      {children}
    </SkyContext.Provider>
  );
};

export const useSky = () => {
  const context = useContext(SkyContext);
  if (!context) {
    throw new Error('useSky must be used within a SkyProvider');
  }
  return context;
};
