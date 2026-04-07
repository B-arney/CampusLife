export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  category: string;
  startAt?: string;
  date?: string;
  imageUrl?: string;
  interests?: string[];
}

export interface CampusEvent {
  id: number; // may be string
  title: string;
  description: string;
  location: string;
  category: string;
  startAt: string; 
  createdAt: string; 
  imageUrl: string | null;
  interests: string[]; 
  hostId: number;
}

export interface Interest {
  name: string;
  code: string;
}
