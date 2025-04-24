import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
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

}
