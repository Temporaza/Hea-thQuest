import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-custom-navigation',
  templateUrl: './custom-navigation.page.html',
  styleUrls: ['./custom-navigation.page.scss'],
})
export class CustomNavigationPage implements OnInit {
  @Input() imageUrl: string;
  @Input() routerLink: string;

  constructor(private router: Router, private navCtrl: NavController) {}

  ngOnInit() {}

  navigateToEBook() {
    this.navCtrl.navigateForward('/babyBook', { animated: false });
  }

  navigateToConsultation() {
    this.navCtrl.navigateForward('/consultation', { animated: false });
  }

  navigateToKids() {
    this.navCtrl.navigateForward('/vaccination', { animated: false });
  }

  navigateToActivity() {
    this.navCtrl.navigateForward('/parents-acitvity', { animated: false });
  }

  navigateToQuest() {
    this.navCtrl.navigateForward('/kids-progress', { animated: false });
  }
}
