import { Star, ExternalLink, Phone, MapPin, Globe } from "lucide-react";
import type { PlaceResult } from "@/lib/types";

interface PlaceCardProps {
  place: PlaceResult;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div className="card group flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-glow">
      {/* Thumbnail / map header */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-navy-100 to-violet-100">
        {place.thumbnail ? (
          <img
            src={place.thumbnail}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-10 w-10 text-violet-300" />
          </div>
        )}
        {/* Rating badge */}
        {place.rating !== null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-navy-900 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
            {place.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-navy-900 line-clamp-1">
          {place.name}
        </h3>

        {/* Category */}
        {place.category && (
          <span className="mt-1 inline-block text-xs font-medium text-violet-600">
            {place.category}
          </span>
        )}

        {/* Address */}
        {place.address && (
          <p className="mt-2 flex items-start gap-1 text-xs text-navy-500 line-clamp-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-400" />
            {place.address}
          </p>
        )}

        {/* Reviews */}
        {place.reviews !== null && (
          <p className="mt-1.5 text-xs text-navy-400">
            {place.reviews.toLocaleString()} reviews
          </p>
        )}

        {/* Contact info */}
        <div className="mt-3 space-y-1.5">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-1.5 text-xs text-navy-500 hover:text-violet-600"
            >
              <Phone className="h-3.5 w-3.5" />
              {place.phone}
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-navy-500 hover:text-violet-600 line-clamp-1"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              Website
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-navy-50 pt-3">
          {place.maps_url && (
            <a
              href={place.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition-all hover:bg-violet-100"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Maps
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-navy-50 px-3 py-2 text-sm font-medium text-navy-600 transition-all hover:bg-navy-100"
            >
              <Globe className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
