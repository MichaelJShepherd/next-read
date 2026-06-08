import { inject, Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = inject(SupabaseService).client;

  readonly session = signal<Session | null>(null);

  get userId(): string | null {
    return this.session()?.user?.id ?? null;
  }

  async init(): Promise<void> {
    const { data: { session } } = await this.client.auth.getSession();
    this.session.set(session);

    if (!session) {
      const { data } = await this.client.auth.signInAnonymously();
      this.session.set(data.session);
    }

    this.client.auth.onAuthStateChange((_, s) => this.session.set(s));
  }
}
