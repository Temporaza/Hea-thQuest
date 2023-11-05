import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

export interface DoctorAvailability {
  availability: {
    monday: {
      date: string;
      openingTime: string;
      closingTime: string;
    };
    tuesday: {
      date: string;
      openingTime: string;
      closingTime: string;
    };
    wednesday: {
      date: string;
      openingTime: string;
      closingTime: string;
    };
    thursday: {
      date: string;
      openingTime: string;
      closingTime: string;
    };
    friday: {
      date: string;
      openingTime: string;
      closingTime: string;
    };
    // Add similar structures for Tuesday to Friday
  };
}

@Component({
  selector: 'app-doctor-consult',
  templateUrl: './doctor-consult.page.html',
  styleUrls: ['./doctor-consult.page.scss'],
})
export class DoctorConsultPage implements OnInit {
  doctorAvailability: any;


  
  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
    ) { }

    ngOnInit() {
      this.afAuth.authState.subscribe((user) => {
        if (user) {
          const doctorId = user.uid;
    
          // Now, you can safely use doctorId to access the user's UID
          this.firestore.collection('doctors').doc(doctorId).valueChanges().subscribe((data: DoctorAvailability | undefined) => {
            this.doctorAvailability = data;
          });
        } else {
          console.log('User is not authenticated.');
        }
      });
}
}


