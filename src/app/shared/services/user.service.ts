import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { supabase } from './supabase.client';
import { Observable, from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  getUidFromAuth(): Promise<string>{
    return supabase.auth.getSession().then(({data, error}) => {
      if (error || !data.session) throw new Error('No hay sesión activa')
        return data.session.user.id;
    });
  }

  getCurrentUser(): Observable<any> {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid => this.http.get<any>(`${this.apiUrl}/api/users/professional/${uid}`))
    );
  }

    updateUser(user: any): Observable<any> {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid => this.http.put(`${this.apiUrl}/api/users/professional/update`, {
        UID: uid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        idprofession: user.idprofession
      }))
    );
  }

    sendPasswordRecovery(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/password/send-recovery-email?email=${email}`, {});
  }
  
}
