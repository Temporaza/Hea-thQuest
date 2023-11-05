import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpcomingTaskPageRoutingModule } from './upcoming-task-routing.module';

import { UpcomingTaskPage } from './upcoming-task.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpcomingTaskPageRoutingModule
  ],
  declarations: [UpcomingTaskPage]
})
export class UpcomingTaskPageModule {}
