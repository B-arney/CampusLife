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
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  interests?: string[];
  imageUrl?: string;
}

export interface CategoryOption {
    name: string;
	count: number;
}
