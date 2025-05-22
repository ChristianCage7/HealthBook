import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private apiUrl = 'http://localhost:8080/api'; // Asegúrate que este sea el base URL correcto

  constructor(private http: HttpClient) { }

  /**
   * Obtener los profesionales pendientes de aprobación
   */
  getPendingProfessionals(): Observable<Professional[]> {
    return this.http.get<Professional[]>(`${this.apiUrl}/users/professional/pending`);
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

}
