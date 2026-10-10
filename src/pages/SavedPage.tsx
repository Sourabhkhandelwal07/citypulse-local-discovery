import { useState, useEffect } from "react";
import { Bookmark, Search, Trash2, ExternalLink, Calendar, MapPin, Inbox } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/States";
import { getSavedEvents, removeSavedEvent } from "@/lib/storage";
import type { SavedEvent } from "@/lib/types";

interface SavedPageProps {
  refreshKey?: number;
}

export function SavedPage({ refreshKey = 0 }: SavedPageProps) {
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    const data = await getSavedEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [refreshKey]);

  const filtered = filter.trim()
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(filter.toLowerCase()) ||
          (e.venue?.toLowerCase().includes(filter.toLowerCase()) ?? false) ||
          (e.address?.toLowerCase().includes(filter.toLowerCase()) ?? false)
      )
    : events;

  const handleRemove = async (id: string) => {
    await removeSavedEvent(id);
    await loadEvents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">Saved Events</h1>
          <p className="mt-2 text-navy-500">
            Your bookmarked events — stored in the cloud and available across sessions.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
          <Bookmark className="h-4 w-4" />
          {events.length} saved
        </div>
      </div>

      {/* Search filter */}
      {events.length > 0 && (
        <SearchBar
          value={filter}
          onChange={setFilter}
          placeholder="Filter saved events by title, venue, or location..."
          className="max-w-xl"
        />
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No saved events yet"
          description="Bookmark events from the search results to find them here later. Your saved events persist across page refreshes."
        />
      )}

      {/* Filtered empty state */}
      {events.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No matching events"
          description={`No saved events match "${filter}". Try a different search term.`}
        />
      )}

      {/* Saved events list */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event, i) => {
            const link = event.link || event.ticket_link || event.source;
            return (
              <div
                key={event.id}
                className="card group flex flex-col overflow-hidden animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative h-40 overflow-hidden bg-navy-100">
                  {event.thumbnail ? (
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-100 to-navy-100">
                      <Calendar className="h-10 w-10 text-violet-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-base font-semibold leading-snug text-navy-900 line-clamp-2">
                    {event.title}
                  </h3>
                  {(event.date || event.time) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-500">
                      {event.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-violet-500" />
                          {event.date}
                        </span>
                      )}
                    </div>
                  )}
                  {(event.venue || event.address) && (
                    <p className="mt-2 flex items-start gap-1 text-xs text-navy-500 line-clamp-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                      {event.venue || event.address}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-3 text-sm text-navy-600 line-clamp-2">{event.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2 border-t border-navy-50 pt-3">
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition-all hover:bg-violet-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Event
                      </a>
                    )}
                    <button
                      onClick={() => handleRemove(event.id)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
