import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_SERVICE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Verify Supabase JWT token và lấy thông tin user
   */
  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    
    if (error) {
      return null;
    }
    
    return data.user;
  }

  /**
   * Lấy thông tin user từ Supabase Auth
   */
  async getUserById(supabaseId: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(supabaseId);
    
    if (error) {
      return null;
    }
    
    return data.user;
  }
}
