import {
  MapPin,
  Phone,
  Info,
  FileText,
  Link as LinkIcon,
  Navigation,
} from "lucide-react";

import { ScheduledEvent } from "@/api/model";
import { DetailsBlock } from "@/components/shared/details-block";
import { LinkCard } from "@/components/shared/link-card";

export function EventDetailsContent({ event }: { event: ScheduledEvent; }) {

  return (
    <>
      {/* CONNECTION DETAILS */}
      {(event.event_link || event.phone_number) && (
        <DetailsBlock
          className="space-y-4"
          icon={Info}
          label="Détails de connexion"
          variant="list"
        >
          {/* Link */}
          {event.event_link && (
            <LinkCard
              href={event.event_link}
              icon={LinkIcon}
              label="Lien Visio"
              value={event.event_link}
              isExternal
              variant="blue"
            />
          )}

          {/* Phone */}
          {event.phone_number && (
            <LinkCard
              href={`tel:${event.phone_number}`}
              icon={Phone}
              label="Téléphone"
              value={event.phone_number}
              valueClassName="font-mono"
            />
          )}
        </DetailsBlock>
      )}

      {/* Location */}
      {event.location && (
        <DetailsBlock
          icon={MapPin}
          label="Adresse / Lieu"
        >
          {event.location}
        </DetailsBlock>
      )}

      {/* INSTRUCTIONS */}
      {event.instructions && (
        <DetailsBlock
          icon={Navigation}
          label="Instructions"
        >
          {event.instructions}
        </DetailsBlock>
      )}

      {/* PERSONAL NOTES */}
      {event.notes && (
        <DetailsBlock
          icon={FileText}
          label="Notes Personnelles"
        >
          {event.notes}
        </DetailsBlock>
      )}
    </>
  );
}
