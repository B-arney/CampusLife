import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EventComponent } from './event';
import { EventService } from '../auth/event/services/event.service';
import { Auth } from '../auth/services/auth';
import { ActivatedRoute } from '@angular/router';

describe('Event', () => {
  let component: EventComponent;
  let fixture: ComponentFixture<EventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        },
        {
          provide: EventService,
          useValue: {
            createEvent: () => of({ event: {} as any }),
            getEvent: () => of({ event: {} as any }),
            updateEvent: () => of({ event: {} as any }),
            deleteEvent: () => of(undefined)
          }
        },
        {
          provide: Auth,
          useValue: {
            getToken: () => null,
            me: () => of({ user: { id: 1, username: 'u', email: 'a@b.c', displayName: null, isVerified: true } })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
