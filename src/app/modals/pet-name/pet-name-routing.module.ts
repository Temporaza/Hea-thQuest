import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetNamePage } from './pet-name.page';

const routes: Routes = [
  {
    path: '',
    component: PetNamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PetNamePageRoutingModule {}
