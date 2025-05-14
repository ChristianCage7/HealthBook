import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditorService {

  constructor() { }

  getPendingProfessionals(){
    return of([
      {
        idprofessional: 1,
        first_name: 'Paulino',
        last_name: 'Gonza',
        email: 'paulina.vice@gmail.com',
        imgprofile: 'https://healthbook-users.s3.amazonaws.com/Users-IMGProfile/abaf02ac-f66e-41d7-80ac-3fc43360ce8b/profile-img.png',
        datebirth: '2025-05-04 23:07:00+00'
      }
    ])
  }

approveProfessional(idProfessional: number){
    return of({ message: 'Aprobado' });
}

}
