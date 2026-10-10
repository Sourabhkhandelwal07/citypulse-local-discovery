import { useState, useCallback } from "react";
import { Sidebar, type PageId } from "@/components/Sidebar";
import { LandingPage } from "@/pages/LandingPage";
import { EventsPage } from "@/pages/EventsPage";
import { PlacesPage } from "@/pages/PlacesPage";
import { AskPage } from "@/pages/AskPage";
import { SavedPage } from "@/pages/SavedPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PreferencesPage } from "@/pages/PreferencesPage";
import type { SearchHistoryEntry } from "@/lib/types";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("home");
  const [eventsQuery, setEventsQuery] = useState("");
  const [eventsCity, setEventsCity] = useState("");
  const [placesQuery, setPlacesQuery] = useState("");
  const [placesCity, setPlacesCity] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = useCallback((page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleQuickSearch = useCallback(
    (query: string, city: string) => {
      setEventsQuery(query);
      setEventsCity(city);
      setCurrentPage("events");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleRerunSearch = useCallback((entry: SearchHistoryEntry) => {
    if (entry.mode === "events") {
      setEventsQuery(entry.query);
      setEventsCity(entry.city);
      setCurrentPage("events");
    } else {
      setPlacesQuery(entry.query);
      setPlacesCity(entry.city);
      setCurrentPage("places");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSavedChange = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-navy-50">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 pt-20 lg:px-8 lg:py-8">
          {currentPage === "home" && (
            <LandingPage onNavigate={handleNavigate} onQuickSearch={handleQuickSearch} />
          )}
          {currentPage === "events" && (
            <EventsPage
              key={`${eventsQuery}-${eventsCity}-${refreshKey}`}
              initialQuery={eventsQuery}
              initialCity={eventsCity}
              onSavedChange={handleSavedChange}
            />
          )}
          {currentPage === "places" && (
            <PlacesPage
              key={`${placesQuery}-${placesCity}`}
              initialQuery={placesQuery}
              initialCity={placesCity}
            />
          )}
          {currentPage === "ask" && <AskPage />}
          {currentPage === "saved" && <SavedPage refreshKey={refreshKey} />}
          {currentPage === "history" && (
            <HistoryPage onRerunSearch={handleRerunSearch} refreshKey={refreshKey} />
          )}
          {currentPage === "dashboard" && (
            <DashboardPage
              onNavigate={handleNavigate}
              onRerunSearch={handleRerunSearch}
              refreshKey={refreshKey}
            />
          )}
          {currentPage === "preferences" && <PreferencesPage />}
        </div>
      </main>
    </div>
  );
}
