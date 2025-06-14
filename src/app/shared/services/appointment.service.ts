import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AppointmentRequest {
  iduser: number;
  idprofessional: number;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:mm:ss"
}

export interface Appointment {
  id: number;
  iduser: number;
  idprofessional: number;
  appointmentDate: string;
  appointmentTime: string;
  sessionId: string;
  tokenPatient: string;
  tokenProfessional: string;
  status: number;
  createdAt: string;
  // …otros campos que devuelva tu backend
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

    createWithSession(request: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.apiUrl}/appointments/create-with-session`,
      request
    );
  }

    /** Trae todas las citas del paciente */
  getUserAppointments(userId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/user/${userId}`);
  }

}
