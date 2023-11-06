import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-patient-data',
  templateUrl: './patient-data.page.html',
  styleUrls: ['./patient-data.page.scss'],
})
export class PatientDataPage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }


  pending(){
    this.router.navigate(['pending-doc']);
  }
}
