import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DoctorConsultPage } from './doctor-consult.page';

const routes: Routes = [
  {
    path: '',
    component: DoctorConsultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorConsultPageRoutingModule {}
