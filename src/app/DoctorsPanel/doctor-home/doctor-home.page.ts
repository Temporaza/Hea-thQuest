import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationForDoctorsService } from 'src/app/authenticationDoctors/authentication-for-doctors.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DoctorAvailability } from '../doctor-consult/doctor-consult.page';

@Component({
  selector: 'app-doctor-home',
  templateUrl: './doctor-home.page.html',
  styleUrls: ['./doctor-home.page.scss'],
})
export class DoctorHomePage implements OnInit {

  doctorAvailability: DoctorAvailability | undefined;
  availableDates: string[] = [];
  highlightedDates: any[] = [];

  constructor(
    private authService: AuthenticationForDoctorsService,
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() {
    //prevent to navigate back after login
    history.pushState(null, null, location.href);
    window.onpopstate = function(event: PopStateEvent) {
    history.go(1);
    };

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        const doctorId = user.uid;

        this.firestore.collection('doctors').doc(doctorId).valueChanges().subscribe((data: DoctorAvailability | undefined) => {
          this.doctorAvailability = data;

          // Fetch available dates from doctor's availability data
          if (this.doctorAvailability) {
            this.availableDates = this.getAvailableDates(this.doctorAvailability);
            this.highlightedDates = this.availableDates.map(date => ({
              date: date,
              textColor: '#ffffff', // change as needed
              backgroundColor: '#FFA140' // change as needed
            }));
          }
        });
      } else {
        console.log('User is not authenticated.');
      }
    });
  }

  signOut() {
    this.authService.signOut()
    .then(() => {
      // Successful sign-out, navigate to the 'doctor-login' page
      this.router.navigate(['/doctor-login'], { replaceUrl: true });
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
  }
  // Define the getAvailableDates method here
  getAvailableDates(doctorAvailability: DoctorAvailability): string[] {
    const availableDates: string[] = [];

    // Iterate through the availability data and collect available dates
    for (const day of Object.values(doctorAvailability.availability)) {
      if (day.date) {
        availableDates.push(day.date);
      }
    }

    return availableDates;
  }
  isAvailable(date: string): boolean {
    return this.availableDates.includes(date);
  }
 
}
