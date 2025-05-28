import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Professional {
  idprofessional: number;
  first_name: string;
  last_name: string;
  email: string;
  imgprofile: string;
  datebirth: string;
  approve: number;
}

@Injectable({
  providedIn: 'root'
})
export class CreditorService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtener los profesionales pendientes de aprobación
   */
  getPendingProfessionals(): Observable<Professional[]> {
    return this.http.get<Professional[]>(`${this.apiUrl}/users/professional/pending`);
  }

  getUser(uid: string, isProfessional: boolean): Observable<any> {
    const base = this.apiUrl;
    const path = isProfessional ? 'professional' : 'basic';
    return this.http.get<any>(`${base}/users/${path}/${uid}`);
  }


  getDocumentsByProfessional(idProfessional: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/professional/documents/${idProfessional}`);
  }

  /**
   * Aprobar profesional por ID
   */
  approveProfessional(idProfessional: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/professional/${idProfessional}/approve`, {});
  }

  rejectProfessional(idProfessional: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/professional/${idProfessional}/reject`, {});
  }

  approveDocument(docId: number, idCreditor: number, comment: string) {
    const url = `${this.apiUrl}/documents/${docId}/approve`;
    const body = { idcreditor: idCreditor, comment };
    return this.http.post(url, body, { responseType: 'text' });
  }

  rejectDocument(docId: number, idCreditor: number, comment: string) {
    const url = `${this.apiUrl}/documents/${docId}/reject`;
    const body = { idcreditor: idCreditor, comment };
    return this.http.post(url, body, { responseType: 'text' });
  }

}
