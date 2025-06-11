import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

    // Enviar rating
  rateProfessional(idprofessional: number, iduser: number, score: number): Observable<any> {
    const body = { idprofessional, iduser, score };
    return this.http.post(`${this.apiUrl}/evaluation/rating`, body);
  }

    // Enviar comentario
  commentProfessional(idprofessional: number, iduser: number, comment: string): Observable<any> {
    const body = { idprofessional, iduser, comment };
    return this.http.post(`${this.apiUrl}/evaluation/comment`, body);
  }

    // Obtener promedio de rating
  getAverageRating(idprofessional: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evaluation/ratings/${idprofessional}`);
  }

  // Obtener comentarios
  getComments(idprofessional: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evaluation/comments/${idprofessional}`);
  }

  // Eliminar comentario (opcional)
  deleteComment(idcomment: number, iduser: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/evaluation/comment/${idcomment}?iduser=${iduser}`, {});
  }
}
