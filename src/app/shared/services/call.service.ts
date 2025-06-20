import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private apiUrl = 'http://52.71.93.144:8080/api/call'; // ajusta si usas otra URL

  constructor(private http: HttpClient) { }

  createSession() {
    return this.http.post(`${this.apiUrl}/session`, {}, { responseType: 'text' });
  }

  generateToken(sessionId: string, role: string) {
    return this.http.post(`${this.apiUrl}/token?sessionId=${sessionId}&role=${role}`, {}, { responseType: 'text' });
  }

  getAppointmentsByProfessional(id: number) {
    return this.http.get<any[]>(`${environment.backendUrl}/api/appointments/professional/${id}`);
  }

}
