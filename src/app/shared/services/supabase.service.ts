import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  constructor(private platform: Platform) { }

  /*Registrarse*/
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  }

  /*Iniciar sesión*/
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  /*Obtener usuario*/
  getUser() {
    return supabase.auth.getUser();
  }

  /*¨Cerrar sesión*/
  async signOut() {
    return await supabase.auth.signOut();
  }

  async getGenderOptions() {
    const { data, error } = await supabase
      .from('Gender')
      .select('id, gender');  
    if (error) throw error;
    return data;
  }
  
  async getProfessionOptions() {
    const { data, error } = await supabase
      .from('Profession')
      .select('idprofession, name')  
      .eq('status', 1);
    if (error) throw error;
    return data;
  }
  /* Recuperar password */
  async resetPassword(email: string) {
    const isMobile = this.platform.is('capacitor') || this.platform.is('cordova');

    const redirectTo = isMobile
      ? 'healthbook://auth/reset-password'
      : `${window.location.origin}/auth/reset-password`;

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  }
  /* Actualizar password */
  async updatePassword(newPassword: string) {
    return await supabase.auth.updateUser({ password: newPassword });
  }

  /*Obtener sesión*/
  async setSessionFromUrlToken() {
    const hash = window.location.hash;
    const accessToken = new URLSearchParams(hash.substring(1)).get('access_token');

    if (accessToken) {
      return await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // solo es requerido para login completo, aquí no
      });
    }

    return { error: 'No access token in URL' };
  }

  /* Actualizar perfil */
  async updateUserProfile(email: string, password?: string | null) {
    const updateData: { email?: string; password?: string } = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    return await supabase.auth.updateUser(updateData);
  }


}
