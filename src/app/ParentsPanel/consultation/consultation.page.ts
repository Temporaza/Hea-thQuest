import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.page.html',
  styleUrls: ['./consultation.page.scss'],
})
export class ConsultationPage implements OnInit {

  preferredDate: string = ''; // Parent's preferred date
  matchingDoctors: string[] = []; // Array to store matching doctor names

  constructor(
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
  }

  async findMatchingDoctors() {
    try {
      this.matchingDoctors = []; // Clear existing matches
      // Convert the parent's preferred date to ISO format
      const parentPreferredDate = this.convertToDateISO(this.preferredDate);
      
      const doctorsCollection = this.firestore.collection('doctors');
      doctorsCollection.snapshotChanges().subscribe((changes) => {
        changes.forEach((change) => {
          const doctorData = change.payload.doc.data() as { fullname: string, availability: any }; // Update the type correctly
          for (const day in doctorData.availability) {
            if (doctorData.availability[day].date === parentPreferredDate) {
              this.matchingDoctors.push(doctorData.fullname); // Store the doctor's full name
            }
          }
        });
      });
    } catch (error) {
      console.error('Error finding matching doctors:', error);
    }
  }

  // Helper function to convert 'dd/mm/yyyy' to 'yyyy-mm-dd' date format
  convertToDateISO(inputDate: string): string {
    const parts = inputDate.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return inputDate; // Return the original date if it couldn't be converted
  }

}
