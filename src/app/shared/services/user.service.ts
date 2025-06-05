import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { supabase } from './supabase.client';
import { Observable, from, switchMap, map, tap } from 'rxjs';

export interface Gender {
  idgender: number;
  gender: string;
}

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
      map(res => Array.isArray(res) && res.length > 0 && res[0].Register?.idprofile === 2)
    );
  }
  isCreditor(): Observable<boolean> {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid => this.http.get<any[]>(`${this.apiUrl}/api/users/creditor/${uid}`)),
      tap(res => console.log('Respuesta del backend isCreditor:', res)),
      map(res => Array.isArray(res) && res.length > 0)
    );
  }

  getGenders(): Observable<Gender[]> {
    return this.http.get<Gender[]>(`${this.apiUrl}/api/users/gender`);
  }

  getCreditorInfo(): Observable<any> {
    return from(this.getUidFromAuth()).pipe(
      switchMap(uid => this.http.get(`${this.apiUrl}/api/users/creditor/${uid}`))
    );
  }

getCurrentUser(): Observable<any> {
  return from(this.getUidFromAuth()).pipe(
    switchMap(uid =>
      this.http.get<any[]>(`${this.apiUrl}/api/users/basic/${uid}`).pipe(
        switchMap(basicRes => {
          if (Array.isArray(basicRes) && basicRes.length > 0) {
            const user = basicRes[0];
            user.uid = uid;
            return of(user);
          }

          // Si no hay datos en UserBasic, buscar como UserProfessional
          return this.http.get<any[]>(`${this.apiUrl}/api/users/professional/${uid}`).pipe(
            map(profRes => {
              if (!Array.isArray(profRes) || profRes.length === 0) {
                throw new Error('Usuario no encontrado');
              }
              const user = profRes[0];
              user.uid = uid;
              return user;
            })
          );
        })
      )
    )
  );
}

updateUser(user: any) {
  const isProfessional = !!user.idprofessional;
  const endpoint = isProfessional
    ? `${this.apiUrl}/api/users/professional/update`
    : `${this.apiUrl}/api/users/basic/update`;

  return this.http.put(endpoint, user, { responseType: 'text' });
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

validateUserStatus(): Promise<void> {
  return this.getUidFromAuth().then(uid => {
    console.log('[Validación] Iniciando validación de estado para UID:', uid);

    return this.http.get<any[]>(`${this.apiUrl}/api/users/basic/${uid}`).toPromise()
      .then(res => {
        console.log('[Validación] Respuesta UserBasic:', res);

        if (!res || res.length === 0) throw new Error('Usuario no encontrado');
        const user = res[0];
        console.log('[Validación] STATUS en UserBasic:', user?.register?.status);

        if (user?.register?.status === 0) {
          console.warn('[Validación] Usuario desactivado (UserBasic)');
          throw new Error('Cuenta desactivada');
        }
      })
      .catch(() => {
        console.log('[Validación] No encontrado en UserBasic, revisando en UserProfessional');

        return this.http.get<any[]>(`${this.apiUrl}/api/users/professional/${uid}`).toPromise()
          .then(res => {
            console.log('[Validación] Respuesta UserProfessional:', res);

            if (!res || res.length === 0) throw new Error('Usuario no encontrado');
            const user = res[0];
            console.log('[Validación] STATUS en UserProfessional:', user?.register?.status);

            if (user?.register?.status === 0) {
              console.warn('[Validación] Usuario desactivado (UserProfessional)');
              throw new Error('Cuenta desactivada');
            }
          });
      });
  });
}

}
