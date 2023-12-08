import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrashGamePageRoutingModule } from './trash-game-routing.module';

import { TrashGamePage } from './trash-game.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrashGamePageRoutingModule
  ],
  declarations: [TrashGamePage]
})
export class TrashGamePageModule {}
