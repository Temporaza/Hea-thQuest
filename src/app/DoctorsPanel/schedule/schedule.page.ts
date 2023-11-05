import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {
  mondayDate: string = '';
  mondayOpeningTime: string = '';
  mondayClosingTime: string = '';

  tuesdayDate: string = '';
  tuesdayOpeningTime: string = '';
  tuesdayClosingTime: string = '';

  wednesdayDate: string = '';
  wednesdayOpeningTime: string = '';
  wednesdayClosingTime: string = '';

  thursdayDate: string = '';
  thursdayOpeningTime: string = '';
  thursdayClosingTime: string = '';

 fridayDate: string = '';
 fridayOpeningTime: string = '';
 fridayClosingTime: string = '';
  // Define similar variables for Tuesday to Friday


  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {

    //for local storage so the inputs in the form will retained even if you navigate or refresh
    this.mondayDate = localStorage.getItem('mondayDate') || '';
    this.mondayOpeningTime = localStorage.getItem('mondayOpeningTime') || '';
    this.mondayClosingTime = localStorage.getItem('mondayClosingTime') || '';

    this.tuesdayDate = localStorage.getItem('tuesdayDate') || '';
    this.tuesdayOpeningTime = localStorage.getItem('tuesdayOpeningTime') || '';
    this.tuesdayClosingTime = localStorage.getItem('tuesdayClosingTime') || '';

    this.wednesdayDate = localStorage.getItem('wednesdayDate') || '';
    this.wednesdayOpeningTime = localStorage.getItem('wednesdayOpeningTime') || '';
    this.wednesdayClosingTime = localStorage.getItem('wednesdayClosingTime') || '';

    this.thursdayDate = localStorage.getItem('thursdayDate') || '';
    this.thursdayOpeningTime = localStorage.getItem('thursdayOpeningTime') || '';
    this.thursdayClosingTime = localStorage.getItem('thursdayClosingTime') || '';

    this.fridayDate = localStorage.getItem('fridayDate') || '';
    this.fridayOpeningTime = localStorage.getItem('fridayOpeningTime') || '';
    this.fridayClosingTime = localStorage.getItem('fridayClosingTime') || '';
  }

  async saveAvailability() {
    try {
       // Save the input values to local storage
       localStorage.setItem('mondayDate', this.mondayDate);
       localStorage.setItem('mondayOpeningTime', this.mondayOpeningTime);
       localStorage.setItem('mondayClosingTime', this.mondayClosingTime);

       localStorage.setItem('tuesdayDate', this.tuesdayDate);
       localStorage.setItem('tuesdayOpeningTime', this.tuesdayOpeningTime);
       localStorage.setItem('tuesdayClosingTime', this.tuesdayClosingTime);

       localStorage.setItem('wednesdayDate', this.wednesdayDate);
       localStorage.setItem('wednesdayOpeningTime', this.wednesdayOpeningTime);
       localStorage.setItem('wednesdayClosingTime', this.wednesdayClosingTime);

       localStorage.setItem('thursdayDate', this.thursdayDate);
       localStorage.setItem('thursdayOpeningTime', this.thursdayOpeningTime);
       localStorage.setItem('thursdayClosingTime', this.thursdayClosingTime);

       localStorage.setItem('fridayDate', this.fridayDate);
       localStorage.setItem('fridayOpeningTime', this.fridayOpeningTime);
       localStorage.setItem('fridayClosingTime', this.fridayClosingTime);

      const user = await this.afAuth.currentUser;
      if (user) {
        const doctorId = user.uid;
        const availabilityData = {
          monday: {
            date: this.mondayDate,
            openingTime: this.mondayOpeningTime,
            closingTime: this.mondayClosingTime
          },
          tuesday: {
            date: this.tuesdayDate,
            openingTime: this.tuesdayOpeningTime,
            closingTime: this.tuesdayClosingTime
          },
          wednesday: {
            date: this.wednesdayDate,
            openingTime: this.wednesdayOpeningTime,
            closingTime: this.wednesdayClosingTime
          },
          thursday: {
            date: this.thursdayDate,
            openingTime: this.thursdayOpeningTime,
            closingTime: this.thursdayClosingTime
          },
          friday: {
            date: this.fridayDate,
            openingTime: this.fridayOpeningTime,
            closingTime: this.fridayClosingTime
          },
          // Repeat the above structure for Tuesday to Friday
        };

        // Save the availability data under the doctor's document
        await this.firestore.collection('doctors').doc(doctorId).set({ availability: availabilityData }, { merge: true });
        console.log('Availability saved successfully.');
      } else {
        console.error('User not authenticated.');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  }
  
}