import { Compass, Calendar, MapPin, Sparkles, Bookmark, History, LayoutDashboard, Settings, X, Menu } from "lucide-react";
import { useState } from "react";

export type PageId =
  | "home"
  | "events"
  | "places"
  | "ask"
  | "saved"
  | "history"
  | "dashboard"
  | "preferences";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Explore", icon: Compass },
  { id: "events", label: "Events", icon: Calendar },
  { id: "places", label: "Nearby Places", icon: MapPin },
  { id: "ask", label: "Ask CityPulse", icon: Sparkles },
  { id: "saved", label: "Saved Events", icon: Bookmark },
  { id: "history", label: "History", icon: History },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "preferences", label: "Preferences", icon: Settings },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-soft lg:hidden">
        <button
          onClick={() => handleNavigate("home")}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold text-navy-900">CityPulse</span>
        </button>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-navy-700 hover:bg-navy-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy-900/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-navy-900">CityPulse</div>
              <div className="text-xs text-navy-500">Discover your city</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-navy-600 hover:bg-navy-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-violet-600 text-white shadow-soft"
                    : "text-navy-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-72 flex-col border-r border-navy-100 bg-white lg:flex">
        <div className="p-6">
          <button
            onClick={() => handleNavigate("home")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-glow">
              <Compass className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="font-display text-xl font-bold text-navy-900">CityPulse</div>
              <div className="text-xs text-navy-500">Discover your city</div>
            </div>
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-violet-600 text-white shadow-soft"
                    : "text-navy-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    active ? "" : "group-hover:scale-110"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="rounded-xl bg-gradient-to-br from-navy-900 to-navy-700 p-4 text-white">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
              <Sparkles className="h-4 w-4" />
              Powered by SerpApi
            </div>
            <p className="mt-2 text-xs text-navy-200">
              Live event & place discovery via Google Search and Google Maps APIs.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
