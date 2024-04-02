import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-custom-navigation',
  templateUrl: './custom-navigation.page.html',
  styleUrls: ['./custom-navigation.page.scss'],
})
export class CustomNavigationPage implements OnInit {
  @Input() imageUrl: string;
  @Input() routerLink: string;

  constructor(private router: Router) {}

  ngOnInit() {}

  navigateToConsultation() {
    this.router.navigateByUrl('/consultation');
  }

  navigateToActivity() {
    this.router.navigateByUrl('/parents-acitvity');
  }

  navigateToQuest() {
    this.router.navigateByUrl('/kids-progress');
  }
  navigateToKids() {
    this.router.navigateByUrl('/vaccination');
  }
  navigateToEBook() {
    this.router.navigateByUrl('/babybook');
  }
}
