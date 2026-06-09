import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

// Anonymous-only auth. Every visitor gets a persisted anonymous Supabase
// session so their recommendations and selections can be tracked. The session
// is stored by supabase-js, so a returning visitor keeps the same identity.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly _userId = signal<string | null>(null);
  readonly userId = this._userId.asReadonly();

  private inflight: Promise<string | null> | null = null;

  /**
   * Ensures an anonymous session exists, reusing the persisted one if present.
   * Idempotent and concurrency-safe. Best-effort: returns null (never throws)
   * if anonymous sign-ins are unavailable, so the app keeps working untracked.
   */
  ensureSession(): Promise<string | null> {
    const current = this._userId();
    if (current) return Promise.resolve(current);
    if (this.inflight) return this.inflight;

    this.inflight = this.resolveSession().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async resolveSession(): Promise<string | null> {
    try {
      const { data } = await this.supabase.client.auth.getSession();
      if (data.session) {
        this._userId.set(data.session.user.id);
        return data.session.user.id;
      }

      const { data: signed, error } = await this.supabase.client.auth.signInAnonymously();
      if (error || !signed.user) return null;

      this._userId.set(signed.user.id);
      return signed.user.id;
    } catch {
      return null;
    }
  }
}
