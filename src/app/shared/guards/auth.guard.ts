import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { from, map, switchMap, tap } from 'rxjs';
import { supabase } from '../services/supabase.client';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return from(supabase.auth.getSession()).pipe(
    switchMap(sessionData => {
      const session = sessionData?.data?.session;
      if (!session) {
        router.navigateByUrl('/auth');
        return [false];
      }

      // Validar si es creditor
      return userService.isCreditor().pipe(
        tap(isCreditor => {
          if (state.url === '/menu' && isCreditor) {
            // Si intenta entrar a /menu pero es creditor => redirigimos
            router.navigateByUrl('/menu/creditor');
          }
          if (state.url === '/menu/creditor' && !isCreditor) {
            // Si no es creditor pero quiere entrar ahí => lo mandamos al menú
            router.navigateByUrl('/menu');
          }
        }),
        map(() => true)
      );
    })
  );
};
