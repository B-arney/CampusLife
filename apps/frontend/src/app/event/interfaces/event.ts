export interface CampusEvent {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  startsAt: string;
  location?: string;
  category: string;
  hostName: string;
  hostId: number;
  interests?: string[];
  rsvpCount?: number;
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

export interface UpdateEventRequest {
  event: {
    id: number;
    title: string;
    description: string;
    startsAt: string;
    location: string;
    category: string;
    imageUrl: string | null;
    interests: unknown;
    hostId: number;
    createdAt: string;
  };
}
