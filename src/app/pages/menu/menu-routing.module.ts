import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
      },
      {
        path: 'book-appointment',
        loadChildren: () => import('./book-appointment/book-appointment.module').then(m => m.BookAppointmentPageModule),
      },
      {
        path: 'my-sessions',
        loadChildren: () => import('./my-sessions/my-sessions.module').then(m => m.MySessionsPageModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule),
      },
      {
        path: 'creditor',
        loadChildren: () => import('./creditor/creditor.module').then(m => m.CreditorPageModule),
      },

      {
        path: 'creditor-profile-edit',
        loadChildren: () => import('./creditor/creditor-profile-edit/creditor-profile-edit.module').then(m => m.CreditorProfileEditPageModule)
      },
      {
        path: 'professional-dashboard',
        loadChildren: () => import('./professional-dashboard/professional-dashboard.module').then(m => m.ProfessionalDashboardPageModule)
      },
      {
        path: 'professional-sessions',
        loadChildren: () => import('./professional-sessions/professional-sessions.module').then(m => m.ProfessionalSessionsPageModule)
      },
      {
        path: 'manage-availability',
        loadChildren: () => import('./calendar/manage-availability/manage-availability.module').then(m => m.ManageAvailabilityPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      }
    ]
  },
  {
    path: 'professional-dashboard',
    loadChildren: () => import('./professional-dashboard/professional-dashboard.module').then( m => m.ProfessionalDashboardPageModule)
  },
  {
    path: 'professional-sessions',
    loadChildren: () => import('./professional-sessions/professional-sessions.module').then( m => m.ProfessionalSessionsPageModule)
  },
  {
    path: 'manage-availability',
    loadChildren: () => import('./calendar/manage-availability/manage-availability.module').then( m => m.ManageAvailabilityPageModule)
  },
  {
    path: 'calendar',
    loadChildren: () => import('./calendar/calendar.module').then( m => m.CalendarPageModule)
  }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule { }
