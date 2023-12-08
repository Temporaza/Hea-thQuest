import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppointmentPage } from 'src/app/modals/appointment/appointment.page';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.page.html',
  styleUrls: ['./consultation.page.scss'],
})
export class ConsultationPage implements OnInit {

  preferredDate: string = ''; // Parent's preferred date
  matchingDoctors: string[] = []; // Array to store matching doctor names
  private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  private zone: NgZone
  matchingDoctors$: Observable<{ fullname: string, ClinicAddress: string, contact: string, email: string, availability: any }[]>;


  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  async findMatchingDoctors() {
    try {
      this.matchingDoctors = [];
      const parentPreferredDate = this.convertToDateISO(this.preferredDate);
  
      console.log('Parent Preferred Date:', parentPreferredDate);
  
      const doctorsCollection = this.firestore.collection('doctors');
      this.matchingDoctors$ = doctorsCollection.snapshotChanges().pipe(
        map(changes => {
          return changes.map(change => {
            const doctorData = change.payload.doc.data() as {
              fullname: string,
              ClinicAddress: string,
              contact: string,
              email: string,
              availability: any
            };
  
            // Check if the doctor is available on the parent's preferred date
            for (const day in doctorData.availability) {
              const availabilityInfo = doctorData.availability[day];
              if (availabilityInfo.date === parentPreferredDate) {
                console.log('Doctor Matched:', doctorData.fullname);
                return {
                  ...doctorData,
                  preferredDayAvailability: availabilityInfo,
                  preferredDayFormatted: this.formatDate(parentPreferredDate)
                };
              }
            }
  
            console.log('No Match for:', doctorData.fullname);
            return null; // or handle the case where there is no match
          });
        })
      );
  
    } catch (error) {
      console.error('Error finding matching doctors:', error);
    }
  }

  // Add this helper function to format the date
  formatDate(date: string): string {
    const parts = date.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date; // Return the original date if it couldn't be converted
  }

  formatTime(time: string): string {
    const parts = time.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      return `${formattedHours}:${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })} ${period}`;
    }
    return time; // Return the original time if it couldn't be converted
  }

  // Helper function to convert 'dd/mm/yyyy' to 'yyyy-mm-dd' date format
  convertToDateISO(inputDate: string): string {
    const parts = inputDate.split('/');
    if (parts.length === 3) {
      // Assuming input date format is 'dd/mm/yyyy'
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return inputDate; // Return the original date if it couldn't be converted
  }

  getAvailabilityDays(availability: any): string[] {
    return Object.keys(availability);
  }

async makeAppointment(doctor: any) {
  const modal = await this.modalController.create({
    component: AppointmentPage,
    componentProps: {
      doctor: doctor,
      doctorFullName: doctor.fullname,

    },
  });

  return await modal.present();
}

}
