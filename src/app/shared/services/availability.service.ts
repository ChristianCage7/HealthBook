import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) { }

  createAvailability(payload: {
    idprofessional: number;
    day: string;
    start_hour: string;
    end_hour: string;
    available: boolean;
  }) {
    return this.http.post(`${this.apiUrl}/api/calendar/availability`, payload);
  }

  getAvailability(idprofessional: number, date: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/calendar/availability/date/${idprofessional}`,
      { params: { date } }
    );
  }

  createPattern(payload: any) {
    return this.http.post(`${this.apiUrl}/api/calendar/patterns`, payload);
  }

  createException(payload: {
    idprofessional: number;
    day: string;
    start_hour: string;
    end_hour: string;
    reason: string;
  }) {
    return this.http.post(`${this.apiUrl}/api/calendar/exceptions`, payload);
  }

}
