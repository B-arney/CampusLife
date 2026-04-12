import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EventListComponent } from './event-list';
import { EventService } from '../services/event.service';
import { Auth } from '../../services/auth';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideRouter([]),
        {
          provide: EventService,
          useValue: { listEvents: () => of({ events: [] }) }
        },
        {
          provide: Auth,
          useValue: { getToken: () => null, me: () => of({ user: { id: 1, username: 'u', email: 'a@b.c', displayName: null, isVerified: true } }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
