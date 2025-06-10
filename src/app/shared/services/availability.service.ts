import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  createAvailability(payload: {
    idprofessional: number;
    day: string;
    hour: string;
    available: boolean;
  }) {
    return this.http.post(`${this.apiUrl}/api/calendar/availability`, payload);
  }

  getAvailability(idprofessional: number) {
    return this.http.get<any[]>(`${this.apiUrl}/api/calendar/availability/${idprofessional}`);
  }
}
