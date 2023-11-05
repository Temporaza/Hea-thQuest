import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpcomingTaskPage } from './upcoming-task.page';

const routes: Routes = [
  {
    path: '',
    component: UpcomingTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpcomingTaskPageRoutingModule {}
