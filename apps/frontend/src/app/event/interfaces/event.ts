export interface CampusEvent {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  startsAt: string;
  location?: string;
  category: string;
  hostName: string;
  rsvpCount: number;
  imageUrl?: string;
  mapUrl?: string;
  hasUserRsvped?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string; // matches current form (`datetime-local`)
  location: string;
  category: string;
  interests?: string[];
  imageUrl?: string;
}

export type UpdateEventRequest = CreateEventRequest;

export interface CreateEventResponse {
  event: {
    id: number;
    title: string;
    description: string;
    startAt: string;
    location: string;
    category: string;
    imageUrl: string | null;
    interests: unknown;
    hostId: number;
    createdAt: string;
  };
}

export interface EventSummary {
  id: number;
  title: string;
  description: string;
  startAt: string;
  location: string;
  category: string;
  imageUrl: string | null;
  interests: unknown;
  hostId: number;
  createdAt: string;
}

export interface SingleEventResponse {
  event: EventSummary;
}

export interface ListEventsResponse {
  events: EventSummary[];
}