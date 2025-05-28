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
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule { }
