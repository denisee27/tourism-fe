import useUIStore, { useIsSidebarCollapsed, useToggleSidebar } from "../../../core/stores/uiStore";
import { useAuthStore } from "../../../features/auth/stores/authStore";
import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LogoutModal from "../pages/LogoutModalPage";
import { useSidebar } from "../../hooks/useSidebar";

export const Sidebar = () => {
  const isCollapsed = useIsSidebarCollapsed();
  const toggleSidebar = useToggleSidebar();
  const [activeItem, setActiveItem] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const openLogoutModal = useUIStore((state) => state.openModal);

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

  const getMe = useAuthStore((state) => state.getMe);
  const handleGetMe = () => {
    getMe();
  };

  const handlePickConversation = (sessionId) => {
    try {
      setActiveItem(sessionId);
      localStorage.setItem("sessionId", sessionId);
      // Beritahu halaman lain dalam tab yang sama
      window.dispatchEvent(new CustomEvent("sessionId:changed", { detail: { sessionId } }));
    } catch (err) {
      console.warn("Gagal menyimpan sessionId", err);
    }
  };

  // Dengarkan perubahan localStorage (tab lain) & custom event (tab ini)
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
        flex h-screen flex-col bg-sidebar-background text-white transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
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

      {/* Section Navigation Item */}
      {!isCollapsed && (
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col justify-between">
            <nav className="space-y-2 px-4">
              <button
                type="button"
                className="block px-3 py-2 rounded transition-colors hover:bg-primary/90 hover:cursor-pointer bg-primary text-white w-full text-left"
              >
                <div className="flex items-center">
                  <Plus className="me-3" />
                  New Conversation
                </div>
              </button>

              <button
                type="button"
                onClick={handleGetMe}
                className="block px-3 py-2 border border-sidebar-border rounded transition-colors hover:bg-primary-light hover:text-white hover:cursor-pointer bg-white text-black w-full text-left"
              >
                <div className="flex items-center">
                  <LayoutDashboard className="me-3" />
                  View Conversations
                </div>
              </button>
            </nav>
            <hr className="text-sidebar-border mt-5" />
            <div className="px-2 py-2 flex flex-col gap-1">
              {conversations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePickConversation(item.sessionId)}
                  className={`flex items-center gap-2 hover:bg-muted-foreground/8 hover:cursor-pointer rounded-md p-2 ${activeItem === item.sessionId ? "bg-muted-foreground/8" : ""
                    }`}
                >
                  <MessageSquare
                    className={
                      activeItem === item.sessionId
                        ? "text-primary"
                        : "text-black"
                    }
                  />
                  <div
                    className={`font-medium flex-col ${activeItem === item.sessionId
                      ? "text-primary"
                      : "text-black"
                      }`}
                  >
                    <div className="w-45 text-ellipsis text-md overflow-hidden whitespace-nowrap">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <nav className="mt-auto">
            <hr className="text-sidebar-border mt-5" />
            <div className="mt-auto flex flex-col gap-3 py-2 px-3 text-black">
              <button className="flex items-center gap-3 px-6 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-md transition-colors">
                <User />
                <span className="font-medium">Profile</span>
              </button>
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-6 py-2 text-black hover:text-white hover:cursor-pointer hover:bg-primary-light rounded-md transition-colors">
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
