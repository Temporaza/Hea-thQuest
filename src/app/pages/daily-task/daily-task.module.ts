import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DailyTaskPageRoutingModule } from './daily-task-routing.module';

import { DailyTaskPage } from './daily-task.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DailyTaskPageRoutingModule
  ],
  declarations: [DailyTaskPage]
})
export class DailyTaskPageModule {}
