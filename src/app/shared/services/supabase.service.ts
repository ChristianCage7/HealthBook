import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  constructor(private platform: Platform) {}

  
  async signUp(email:string, password: string){
    return await supabase.auth.signUp({ email, password});
  }

  async signIn(email:string,password:string){
    return await supabase.auth.signInWithPassword({email,password});
  }

  getUser(){
    return supabase.auth.getUser();
  }

  async signOut(){
    return await supabase.auth.signOut();
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
  

}
