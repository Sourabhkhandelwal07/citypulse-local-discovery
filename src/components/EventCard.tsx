import { Bookmark, BookmarkCheck, ExternalLink, Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import type { EventResult, SavedEvent } from "@/lib/types";
import { generateEventId, isEventSaved, removeSavedEvent, saveEvent } from "@/lib/storage";

interface EventCardProps {
  event: EventResult;
  onSavedChange?: () => void;
}

export function EventCard({ event, onSavedChange }: EventCardProps) {
  const id = generateEventId(event);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    isEventSaved(id).then((isSaved) => {
      if (active) setSaved(isSaved);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const toggleSave = async () => {
    if (saved) {
      await removeSavedEvent(id);
      setSaved(false);
    } else {
      const savedEvent: SavedEvent = { ...event, id, savedAt: Date.now() };
      await saveEvent(savedEvent);
      setSaved(true);
    }
    onSavedChange?.();
  };

  const link = event.link || event.ticket_link || event.source;

  return (
    <div className="card group flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-glow">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-navy-100">
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
            <Calendar className="h-12 w-12 text-violet-300" />
          </div>
        )}
        <button
          onClick={toggleSave}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 ${
            saved
              ? "bg-violet-600 text-white"
              : "bg-white/80 text-navy-600 hover:bg-white hover:text-violet-600"
          }`}
          aria-label={saved ? "Remove bookmark" : "Save event"}
        >
          {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-navy-900 line-clamp-2">
          {event.title}
        </h3>

        {/* Date & time */}
        {(event.date || event.time) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-500">
            {event.date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-violet-500" />
                {event.date}
              </span>
            )}
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-violet-500" />
                {event.time}
              </span>
            )}
          </div>
        )}

        {/* Venue & address */}
        {(event.venue || event.address) && (
          <div className="mt-2 text-xs text-navy-500">
            {event.venue && (
              <span className="flex items-start gap-1">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                <span className="line-clamp-1">{event.venue}</span>
              </span>
            )}
            {event.address && (
              <span className="ml-4.5 block line-clamp-1 text-navy-400">{event.address}</span>
            )}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="mt-3 text-sm text-navy-600 line-clamp-2">{event.description}</p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-navy-50">
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
          {event.ticket_link && event.ticket_link !== link && (
            <a
              href={event.ticket_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-sm font-medium text-accent-600 transition-all hover:bg-accent-100"
            >
              <Ticket className="h-4 w-4" />
              Tickets
            </a>
          )}
          {!link && !event.ticket_link && (
            <span className="text-sm text-navy-400">No link available</span>
          )}
        </div>
      </div>
    </div>
  );
}
