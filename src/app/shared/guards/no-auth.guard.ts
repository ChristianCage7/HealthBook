import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { from, map, tap } from 'rxjs';
import { supabase } from '../services/supabase.client';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  return from(supabase.auth.getSession()).pipe(
    tap(sessionData => {
      const session = sessionData?.data?.session;
      if (session) {
        // Si ya hay sesión, redirigimos
        router.navigateByUrl('/menu');
      }
    }),
    map(sessionData => {
      const session = sessionData?.data?.session;
      return !session; // true si no hay sesión (permitido), false si hay sesión (bloqueado)
    })
  );
};
