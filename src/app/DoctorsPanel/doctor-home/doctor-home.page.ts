import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationForDoctorsService } from 'src/app/authenticationDoctors/authentication-for-doctors.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DoctorAvailability } from '../doctor-consult/doctor-consult.page';
import { NavController } from '@ionic/angular';



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
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
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
  
          if (this.doctorAvailability) {
            // Fetch available dates from doctor's availability data
            this.availableDates = this.getAvailableDates(this.doctorAvailability);
            this.highlightedDates = this.availableDates.map(date => ({
              date: date,
              textColor: '#ffffff',
              backgroundColor: '#FFA140'
            }));
          } else {
            console.log('Doctor availability data is undefined.');
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
        // After logging out, navigate to the login page and clear history
        this.router.navigate(['/landing'], { replaceUrl: true });
      })
      .catch((error) => {
        console.error('Error logging out:', error);
        // Handle any logout error, if needed
      });
  }
  // Define the getAvailableDates method here
  getAvailableDates(doctorAvailability: DoctorAvailability): string[] {
    const availableDates: string[] = [];
  
    if (doctorAvailability && doctorAvailability.availability) {
      // Iterate through the availability data and collect available dates
      for (const day of Object.values(doctorAvailability.availability)) {
        if (day.date) {
          availableDates.push(day.date);
        }
      }
    }
  
    return availableDates;
  }
 
}
