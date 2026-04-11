export interface CampusEvent {
  id: string;
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
}
