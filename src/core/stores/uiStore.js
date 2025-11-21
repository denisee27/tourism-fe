import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { logger } from "../utils/logger";

/**
 * UI Store - Manages global UI state
 *
 * Responsibilities:
 * - Sidebar collapsed/expanded state
 * - Active modals (session expiry, confirmation dialogs, etc.)
 * - Global loading states
 * - Toast notifications queue
 * - Theme (light/dark)
 * - Breadcrumb data
 *
 * Usage:
 * import { useUIStore } from '@/core/stores/uiStore';
 *
 * const isSidebarCollapsed = useUIStore(state => state.isSidebarCollapsed);
 * const toggleSidebar = useUIStore(state => state.toggleSidebar);
 */

const uiStore = (set, get) => ({
  // SIDEBAR STATE
  /**
   * Whether sidebar is collapsed (mobile or user preference)
   */
  isSidebarCollapsed: false,

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar: () => {
    const newState = !get().isSidebarCollapsed;
    logger.stateChange("UIStore", { sidebar: get().isSidebarCollapsed }, { sidebar: newState });
    set({ isSidebarCollapsed: newState });
  },

  /**
   * Set sidebar state explicitly
   */
  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
  },

  // MODAL STATE
  /**
   * Active modals by ID
   * { sessionExpired: true, deleteConfirmation: true, ... }
   */
  modals: {},

  /**
   * Open a modal by ID
   */
  openModal: (modalId, data = null) => {
    logger.debug(`Opening modal: ${modalId}`, { data });
    set((state) => ({
      modals: { ...state.modals, [modalId]: { isOpen: true, data } },
    }));
  },

  /**
   * Close a modal by ID
   */
  closeModal: (modalId) => {
    logger.debug(`Closing modal: ${modalId}`);
    set((state) => ({
      modals: { ...state.modals, [modalId]: { isOpen: false, data: null } },
    }));
  },

  /**
   * Close all modals
   */
  closeAllModals: () => {
    logger.debug("Closing all modals");
    set({ modals: {} });
  },

  /**
   * Check if a modal is open
   */
  isModalOpen: (modalId) => {
    return get().modals[modalId]?.isOpen || false;
  },

  /**
   * Get modal data
   */
  getModalData: (modalId) => {
    return get().modals[modalId]?.data || null;
  },

  // LOADING STATE
  /**
   * Global loading states by key
   * { users: true, invoices: false, ... }
   */
  loadingStates: {},

  /**
   * Set loading state for a specific key
   */
  setLoading: (key, isLoading) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    }));
  },

  /**
   * Check if something is loading
   */
  isLoading: (key) => {
    return get().loadingStates[key] || false;
  },

  /**
   * Clear all loading states
   */
  clearAllLoading: () => {
    set({ loadingStates: {} });
  },

  // TOAST NOTIFICATIONS
  /**
   * Toast notification queue
   * [{ id, type, message, duration }, ...]
   */
  toasts: [],

  /**
   * Add a toast notification
   * @param {Object} toast - { type: 'success'|'error'|'info'|'warning', message, duration }
   */
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || "info",
      message: toast.message,
      duration: toast.duration || 4000,
      createdAt: Date.now(),
    };

    logger.debug("Adding toast", newToast);

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  /**
   * Remove a toast by ID
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  /**
   * Clear all toasts
   */
  clearAllToasts: () => {
    set({ toasts: [] });
  },

  /**
   * Helper methods for common toast types
   */
  showSuccess: (message, duration) => {
    return get().addToast({ type: "success", message, duration });
  },

  showError: (message, duration) => {
    return get().addToast({ type: "error", message, duration });
  },

  showInfo: (message, duration) => {
    return get().addToast({ type: "info", message, duration });
  },

  showWarning: (message, duration) => {
    return get().addToast({ type: "warning", message, duration });
  },

  // THEME
  /**
   * Current theme: 'light' | 'dark' | 'system'
   */
  theme: "light",

  /**
   * Set theme
   */
  setTheme: (theme) => {
    logger.info(`Theme changed to: ${theme}`);
    set({ theme });

    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  /**
   * Toggle between light and dark theme
   */
  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },

  // BREADCRUMBS
  /**
   * Breadcrumb trail
   * [{ label: 'Home', path: '/' }, { label: 'Users', path: '/users' }]
   */
  breadcrumbs: [],

  /**
   * Set breadcrumbs
   */
  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs });
  },

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs: () => {
    set({ breadcrumbs: [] });
  },

  // PAGE METADATA
  /**
   * Current page title
   */
  pageTitle: "",

  /**
   * Set page title
   */
  setPageTitle: (title) => {
    set({ pageTitle: title });
    document.title = title ? `${title} - Enterprise` : "Enterprise";
  },

  // UTILITIES
  /**
   * Reset UI store to initial state
   */
  reset: () => {
    logger.warn("Resetting UI store");
    set({
      isSidebarCollapsed: false,
      modals: {},
      loadingStates: {},
      toasts: [],
      breadcrumbs: [],
      pageTitle: "",
      // Don't reset theme - user preference should persist
    });
  },
});

/**
 * Create UI store with middleware
 * - devtools: Enable Redux DevTools integration
 * - persist: Persist sidebar and theme preferences to localStorage
 */
export const useUIStore = create(
  devtools(
    persist(uiStore, {
      name: "ui-storage",
      // Only persist user preferences
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
    }),
    { name: "UIStore" }
  )
);

/**
 * Selector hooks for better performance
 * Use these instead of accessing the store directly
 */

// Sidebar
export const useIsSidebarCollapsed = () => useUIStore((state) => state.isSidebarCollapsed);

export const useToggleSidebar = () => useUIStore((state) => state.toggleSidebar);

// Modals
export const useModal = (modalId) => ({
  isOpen: useUIStore((state) => state.isModalOpen(modalId)),
  data: useUIStore((state) => state.getModalData(modalId)),
  open: (data) => useUIStore.getState().openModal(modalId, data),
  close: () => useUIStore.getState().closeModal(modalId),
});

// Loading
export const useIsLoading = (key) => useUIStore((state) => state.isLoading(key));

export const useSetLoading = () => useUIStore((state) => state.setLoading);

// Toasts
export const useToasts = () => useUIStore((state) => state.toasts);

export const useShowToast = () => ({
  success: useUIStore((state) => state.showSuccess),
  error: useUIStore((state) => state.showError),
  info: useUIStore((state) => state.showInfo),
  warning: useUIStore((state) => state.showWarning),
});

// Theme
export const useTheme = () => useUIStore((state) => state.theme);

export const useToggleTheme = () => useUIStore((state) => state.toggleTheme);

// Breadcrumbs
export const useBreadcrumbs = () => useUIStore((state) => state.breadcrumbs);

export const useSetBreadcrumbs = () => useUIStore((state) => state.setBreadcrumbs);

// Page Title
export const usePageTitle = () => useUIStore((state) => state.pageTitle);

export const useSetPageTitle = () => useUIStore((state) => state.setPageTitle);

export default useUIStore;
