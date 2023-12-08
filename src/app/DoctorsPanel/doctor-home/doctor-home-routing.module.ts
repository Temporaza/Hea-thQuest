import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DoctorHomePage } from './doctor-home.page';
import { AuthGuard } from 'src/app/Guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DoctorHomePage,
    canActivate: [AuthGuard], // Apply the AuthGuard here
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorHomePageRoutingModule {}
