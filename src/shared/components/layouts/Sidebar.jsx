import useUIStore, { useIsSidebarCollapsed, useToggleSidebar } from "../../../core/stores/uiStore";
import { useAuthStore } from "../../../features/auth/stores/authStore";
import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LogoutModal from "../pages/LogoutModalPage";
import { useSidebar } from "../../hooks/useSidebar";
import { useStoreConvo } from "../store/convoStore";
import { getListConvo } from "../../api/index.js";
import { useQueryClient } from "@tanstack/react-query";

export const Sidebar = () => {
  const queryClient = useQueryClient();
  const isCollapsed = useIsSidebarCollapsed();
  const toggleSidebar = useToggleSidebar();
  const [activeItem, setActiveItem] = useState(localStorage.getItem('sessionId') || null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [items, setItems] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const FETCH_DELAY_MS = 2000;
  const listRef = useRef(null);
  const debounceRef = useRef(null);
  const mountedRef = useRef(true);
  const openLogoutModal = useUIStore((state) => state.openModal);
  const setConversationAi = useStoreConvo((state) => state.setConversationAi);
  const setMessages = useStoreConvo((state) => state.setMessages);


  const handleLogout = () => {
    openLogoutModal("logoutModal", {});
  };

  const filters = useMemo(() => {
    return {
      page,
      limit,
    };
  }, [page, limit]);

  const {
    data: { data: conversations = [], meta } = {},
    isLoading,
    isFetching,
    error,
  } = useSidebar(filters);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const uniqueById = (arr) => {
    const seen = new Set();
    return arr.filter((x) => {
      const key = x.id ?? x.sessionId;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  useEffect(() => {
    if (!isLoading) {
      if (page === 1) {
        setItems(uniqueById(conversations));
        // set hasMore from meta
        const totalPages = meta?.totalPages ?? (meta?.total && meta?.limit ? Math.ceil(meta.total / meta.limit) : undefined);
        if (typeof totalPages === "number") setHasMore(page < totalPages);
        // keep scroll at top on initial open
        if (listRef.current) {
          listRef.current.scrollTop = 0;
        }
      }
    }
  }, [conversations, isLoading, page, meta]);

  useEffect(() => {
    // auto scroll only when loading next pages (not initial open)
    // Dihapus: jangan auto-scroll setelah data baru datang
  }, [items.length, page]);

  const fetchNextPage = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    setFetchError(null);
    const nextPage = page + 1;
    try {
      // Delay 2 detik sebelum melakukan fetch
      await new Promise((res) => setTimeout(res, FETCH_DELAY_MS));
      const { data: nextData = [], meta: nextMeta } = await getListConvo({ page: nextPage, limit });
      if (!mountedRef.current) return;
      setItems((prev) => uniqueById([...(prev || []), ...(Array.isArray(nextData) ? nextData : [])]));
      setPage(nextPage);
      const totalPages = nextMeta?.totalPages ?? (nextMeta?.total && nextMeta?.limit ? Math.ceil(nextMeta.total / nextMeta.limit) : undefined);
      if (typeof totalPages === "number") setHasMore(nextPage < totalPages);
      // Jangan paksa scroll ke bawah; biarkan posisi pengguna tetap
    } catch (err) {
      if (!mountedRef.current) return;
      setFetchError(err?.message || "Gagal memuat data berikutnya");
    } finally {
      if (mountedRef.current) setIsFetchingMore(false);
    }
  };

  const onScrollEl = (el) => {
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (nearBottom) {
      fetchNextPage();
    }
  };

  const debouncedScroll = (e) => {
    // Capture target immediately to avoid React SyntheticEvent pooling
    const target = e.currentTarget;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onScrollEl(target), 150);
  };

  const getMe = useAuthStore((state) => state.getMe);
  const handleGetMe = () => {
    getMe();
  };

  const handlePickConversation = (sessionId) => {
    try {
      if (sessionId) {
        setActiveItem(sessionId);
        setConversationAi(true);
        queryClient.invalidateQueries({ queryKey: ["keyPoint"] });
        queryClient.refetchQueries({ queryKey: ["keyPoint"] });
        localStorage.setItem("sessionId", sessionId);
        window.dispatchEvent(new CustomEvent("sessionId:changed", { detail: { sessionId } }));
        return
      }
      setActiveItem(null);
      setConversationAi(false);
      setMessages([]);
      localStorage.removeItem("sessionId");
    } catch (err) {
      console.warn("Gagal menyimpan sessionId", err);
    }
  };

  useEffect(() => {
    const onStorage = (e) => {
      try {
        if (e.key === "sessionId") {
          setActiveItem(e.newValue);
        }
      } catch (err) {
        console.warn("Listener storage error", err);
      }
    };
    const onSessionChange = (e) => {
      try {
        const sid = e?.detail?.sessionId ?? localStorage.getItem("sessionId");
        if (sid) setActiveItem(sid);
      } catch (err) {
        console.warn("Listener sessionId:changed error", err);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sessionId:changed", onSessionChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sessionId:changed", onSessionChange);
    };
  }, []);

  return (
    <aside
      className={`
        border-e border-sidebar-border
        flex h-screen flex-col bg-sidebar-background text-white transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* section header */}
      <div className="flex flex-col">
        <div className="mb-2 p-4 flex items-center justify-between">
          {!isCollapsed && <p className="text-2xl font-bold text-black">TravelMind</p>}
          <button
            onClick={toggleSidebar}
            className="rounded text-black p-1 hover:text-gray-700 hover:cursor-pointer transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>
        {!isCollapsed && (
          <>
            <nav className="space-y-2 px-4">
              <button
                onClick={() => handlePickConversation(null)}
                type="button"
                className="block px-3 py-2 rounded transition-colors hover:bg-primary/90 hover:cursor-pointer bg-primary text-white w-full text-left"
              >
                <div className="flex items-center">
                  <Plus className="me-3" />
                  New Conversation
                </div>
              </button>

              {/* <button
                type="button"
                onClick={handleGetMe}
                className="block px-3 py-2 border border-sidebar-border rounded transition-colors hover:bg-primary-light hover:text-white hover:cursor-pointer bg-white text-black w-full text-left"
              >
                <div className="flex items-center">
                  <LayoutDashboard className="me-3" />
                  View Conversations
                </div>
              </button> */}
            </nav>
            <hr className="text-sidebar-border mt-5" />
          </>
        )}
      </div>

      {/* Section Navigation Item (scroll only this section) */}
      {!isCollapsed && (
        <div className="flex flex-1 flex-col min-h-0">
          <div ref={listRef} onScroll={debouncedScroll} className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handlePickConversation(item.sessionId)}
                className={`flex items-center gap-2 hover:bg-muted-foreground/8 hover:cursor-pointer rounded-md p-2 ${activeItem === item.sessionId ? "bg-muted-foreground/8" : ""}`}
              >
                <MessageSquare
                  className={activeItem === item.sessionId ? "text-primary" : "text-black"}
                />
                <div className={`font-medium flex-col ${activeItem === item.sessionId ? "text-primary" : "text-black"}`}>
                  <div className="w-45 text-ellipsis text-md overflow-hidden whitespace-nowrap">
                    {item.sessionId}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {(isLoading || isFetching || isFetchingMore) && (
              <div className="flex items-center justify-center py-2">
                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
            {fetchError && (
              <div className="text-red-600 text-sm px-2 py-1">{fetchError}</div>
            )}
          </div>

          {/* section profile (fixed at bottom) */}
          <nav className="shrink-0 flex flex-col">
            <hr className="text-sidebar-border" />
            <div className="flex flex-col gap-3 py-2 px-3 text-black">
              {/* <button className="flex items-center gap-3 px-6 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-md transition-colors">
                <User />
                <span className="font-medium">Profile</span>
              </button> */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-start gap-3 py-2 px-3 text-black hover:text-white hover:cursor-pointer hover:bg-primary-light rounded-md transition-colors"
              >
                <LogOut />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
          <LogoutModal />
        </div>
      )}
    </aside>
  );
};
