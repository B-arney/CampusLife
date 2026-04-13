export interface CreateEventRequest {
  title: string;
  description: string;
  date: string; // matches current form (`datetime-local`)
  location: string;
  category: string;
  interests?: string[];
  imageUrl?: string;
}

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