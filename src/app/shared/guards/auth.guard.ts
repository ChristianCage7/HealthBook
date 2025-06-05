import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { from, map, of, switchMap, tap, catchError } from 'rxjs';
import { supabase } from '../services/supabase.client';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const userService = inject(UserService);
  const router = inject(Router);

  return from(supabase.auth.getSession()).pipe(
    switchMap(sessionData => {
      const session = sessionData?.data?.session;
      if (!session) {
        router.navigateByUrl('/auth');
        return of(false);
      }

      return from(userService.validateUserStatus()).pipe(
        switchMap(() =>
          userService.isCreditor().pipe(
            tap(isCreditor => {
              if (state.url === '/menu' && isCreditor) {
                router.navigateByUrl('/menu/creditor');
              }
              if (state.url === '/menu/creditor' && !isCreditor) {
                router.navigateByUrl('/menu');
              }
            }),
            map(() => true)
          )
        ),
        catchError(() => {
          supabase.auth.signOut();
          router.navigateByUrl('/auth');
          return of(false);
        })
      );
    })
  );
};
