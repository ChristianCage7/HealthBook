import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { supabase } from './supabase.client';
import { Observable, from, switchMap, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) { }

  getUidFromAuth(): Promise<string> {
    return supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) throw new Error('No hay sesión activa');
      console.log('UID actual:', data.session.user.id); // 👈 NUEVO
      return data.session.user.id;
    });
  }

  isProfessional(): Observable<boolean> {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid => this.http.get<any[]>(`${this.apiUrl}/api/users/professional/${uid}`)),
      map(res => Array.isArray(res) && res.length > 0 && res[0].register?.idprofile === 2)
    );
  }
  isCreditor(): Observable<boolean> {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid => this.http.get<any[]>(`${this.apiUrl}/api/users/creditor/${uid}`)),
      tap(res => console.log('Respuesta del backend isCreditor:', res)),
      map(res => Array.isArray(res) && res.length > 0)
    );
  }


  getCreditorInfo(): Observable<any> {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid => this.http.get(`${this.apiUrl}/api/users/creditor/${uid}`))
    );
  }

  getCurrentUser() {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid =>
        this.http.get<any>(`${this.apiUrl}/api/users/basic/${uid}`).pipe(
          map((res: any) => {
            console.log('Respuesta backend UserBasic:', res);
            if (!Array.isArray(res) || res.length === 0) {
              throw new Error('Usuario no encontrado en UserBasic');
            }
            const user = res[0];
            user.uid = uid;
            return user;
          }),
          switchMap(user => {
            const idProfile = user.register?.idprofile;
            if (idProfile === 2) {
              return this.http.get<any>(`${this.apiUrl}/api/users/professional/${user.uid}`).pipe(
                map((res: any) => {
                  console.log('Respuesta backend UserProfessional:', res);
                  if (!Array.isArray(res) || res.length === 0) {
                    throw new Error('Usuario no encontrado en UserProfessional');
                  }
                  const profUser = res[0];
                  return profUser;
                })
              );
            }
            return from([user]);
          })
        )
      )
    );
  }

  updateUser(user: any) {
    return this.http.put(`${this.apiUrl}/api/users/basic/update`, user, { responseType: 'text' });
  }

  getProfessions() {
    return this.http.get<any>(`${this.apiUrl}/api/users/profession`).pipe(
      map((res: any) => Array.isArray(res) ? res : [])
    );
  }


  sendPasswordRecovery(email: string) {
    return from(supabase.auth.resetPasswordForEmail(email));
  }

  uploadProfileImage(formData: FormData) {
  return this.http.post(`${this.apiUrl}/api/users/basic/upload-image`, formData, { responseType: 'text' });
}

updateProfessionalUser(user: any) {
  return this.http.put(`${this.apiUrl}/api/users/professional/update`, user, { responseType: 'text' });
}

}
