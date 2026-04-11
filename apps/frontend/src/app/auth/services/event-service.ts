import { Injectable } from '@angular/core';
import { CampusEvent } from '../interfaces/event';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly events: CampusEvent[] = [
    {
      id: 'spring-hackathon-2026',
      title: 'Spring Hackathon 2026',
      shortDescription: '48-hour team hackathon with mentors and prizes.',
      description: 'Join students from all majors for a 48-hour build sprint. We provide mentors, API credits, snacks, and a final demo day with jury feedback.',
      startsAt: '2026-05-03T10:00:00.000Z',
      location: 'Innovation Lab, Building B, Room 204',
      category: 'Technology',
      hostName: 'Student Tech Guild',
      rsvpCount: 126,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
      mapUrl: 'https://maps.google.com/?q=Innovation+Lab+Building+B'
    },
    {
      id: 'career-fair-2026',
      title: 'Campus Career Fair',
      shortDescription: 'Meet employers, internship programs, and alumni recruiters.',
      description: 'Connect with over 40 companies and organizations hiring interns and juniors. Bring your CV and prepare for mini interviews at dedicated booths.',
      startsAt: '2026-06-11T08:30:00.000Z',
      location: 'Main Hall',
      category: 'Career',
      hostName: 'Career Center',
      rsvpCount: 212,
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
      mapUrl: 'https://maps.google.com/?q=Campus+Main+Hall'
    },
    {
      id: 'winter-ball-2025',
      title: 'Winter Ball 2025',
      shortDescription: 'Annual formal night with live music and dance.',
      description: 'An evening gala celebrating campus life with live music, performances, and awards for student communities.',
      startsAt: '2025-12-12T19:00:00.000Z',
      location: 'Grand Auditorium',
      category: 'Social',
      hostName: 'Student Union',
      rsvpCount: 389,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
      mapUrl: 'https://maps.google.com/?q=Grand+Auditorium+Campus'
    }
  ];

  private readonly rsvpedEventIds = new Set<string>();

  getEvents(): CampusEvent[] {
    return this.events;
  }

  getEventById(id: string): CampusEvent | undefined {
    return this.events.find((event) => event.id === id);
  }

  hasUserRsvped(eventId: string): boolean {
    return this.rsvpedEventIds.has(eventId);
  }

  rsvp(eventId: string): boolean {
    const event = this.getEventById(eventId);
    if (!event || this.rsvpedEventIds.has(eventId)) {
      return false;
    }

    this.rsvpedEventIds.add(eventId);
    event.rsvpCount += 1;
    return true;
  }
}
