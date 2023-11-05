import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinishedTaskPage } from './finished-task.page';

const routes: Routes = [
  {
    path: '',
    component: FinishedTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinishedTaskPageRoutingModule {}
