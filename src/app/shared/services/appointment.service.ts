import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AppointmentRequest {
  iduser: number;
  idprofessional: number;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:mm:ss"
}

export interface Appointment {
  idappointment: number;
  iduser: number;
  idprofessional: number;
  appointmentDate: string;
  appointmentTime: string;
  sessionId: string;
  tokenPatient: string;
  tokenProfessional: string;
  status: number;
  createdAt: string;
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

  /** Citas por profesional */
  getProfessionalAppointments(professionalId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/professional/${professionalId}`);
  }

  /** Cambiar estado genérico (status: 0 a 4) */
  updateStatus(id: number, status: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/appointments/${id}/status`, { status });
  }

  /** Confirmar cita (cambia status en tabla a 1) */
  confirmAppointment(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/appointments/${id}/confirm`, {});
  }

  /** Rechazar cita (cambia status en tabla a 2) */
  rejectAppointment(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/appointments/${id}/reject`, {});
  }

  /** Cancelar cita (cambia status en tabla a 3) */
  cancelAppointment(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/appointments/${id}/cancel`, {});
  }

  /** Marcar como completada (cambia status en tabla a 4) */
  completeAppointment(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/appointments/${id}/complete`, {});
  }

  /**
  * Trae el perfil básico del paciente asociado a la cita indicada.
  * El endpoint devuelve un array JSON, extraemos y devolvemos el primer elemento.
  */
  getUserBasicProfileByAppointment(idappointment: number): Observable<any> {
    return this.http
      .get<any[]>(`${this.apiUrl}/appointments/user-profile/${idappointment}`)
      .pipe(
        map(res => {
          if (!res || res.length === 0) {
            throw new Error('Perfil no encontrado');
          }
          return res[0];
        })
      );
  }

  getUserProfessionalProfileByAppointment(idappointment: number): Observable<any> {
    return this.http
      .get<any[]>(`${this.apiUrl}/appointments/professional-profile/${idappointment}`)
      .pipe(
        map(res => {
          console.log('Perfil recibido:', res);
          if (!res || res.length === 0 || !res[0].UID) {
            throw new Error('Perfil no encontrado');
          }
          return res[0]; // ✅ usa el primer objeto
        })
      );
  }


}
