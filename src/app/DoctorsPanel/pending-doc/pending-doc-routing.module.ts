import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingDocPage } from './pending-doc.page';

const routes: Routes = [
  {
    path: '',
    component: PendingDocPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingDocPageRoutingModule {}
