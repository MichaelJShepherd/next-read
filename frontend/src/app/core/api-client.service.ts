import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

/** Thin transport layer — HTTP calls to Supabase Edge Functions only.
 *  Business logic belongs in feature services, not here. */
@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(private supabase: SupabaseService) {}

  async invokeFunction<T>(name: string, body?: object): Promise<T> {
    const { data, error } = await this.supabase.client.functions.invoke<T>(name, { body });
    if (error) throw error;
    return data as T;
  }
}
