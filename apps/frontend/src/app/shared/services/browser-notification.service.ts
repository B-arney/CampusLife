import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

type PushSubscriptionResponse = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

@Injectable({
  providedIn: 'root',
})
export class BrowserNotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private cachedPublicKey: string | null = null;

  async ensureNotificationPermission(): Promise<boolean> {
    if (!('Notification' in globalThis)) {
      return false;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    return true;
  }

  async ensurePushSubscription(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in globalThis)) {
      return false;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const publicKey = await this.getPublicKey();
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.base64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const jsonSubscription = subscription.toJSON() as PushSubscriptionResponse;
    await firstValueFrom(this.http.post(`${this.apiUrl}/notifications/subscribe`, jsonSubscription));
    return true;
  }

  private async getPublicKey(): Promise<string> {
    if (this.cachedPublicKey) {
      return this.cachedPublicKey;
    }

    const response = await firstValueFrom(this.http.get<{ publicKey: string }>(`${this.apiUrl}/notifications/public-key`));
    this.cachedPublicKey = response.publicKey;
    return response.publicKey;
  }

  private base64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = globalThis.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let index = 0; index < rawData.length; index++) {
      outputArray[index] = rawData.charCodeAt(index);
    }

    return outputArray;
  }
}