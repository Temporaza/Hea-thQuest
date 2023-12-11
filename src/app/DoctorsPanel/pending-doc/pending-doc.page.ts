import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { DocAppointmentService } from 'src/app/services/doc-appointment.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppointmentService } from 'src/app/services/appointment.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pending-doc',
  templateUrl: './pending-doc.page.html',
  styleUrls: ['./pending-doc.page.scss'],
})
export class PendingDocPage implements OnInit {

  doctorUID: string;
  appointments: any[] = [];

  constructor(
    private authService: AngularFireAuth,
    private docAppointmentService: DocAppointmentService,
    private appointmentService: AppointmentService,
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
  ) { 
    this.fetchDoctorAppointments();
  }

  ngOnInit() {
    // Get the authenticated user
    this.authService.authState.subscribe(user => {
    if (user) {
      this.doctorUID = user.uid;
      console.log('Doctor UID:', this.doctorUID);
      this.fetchDoctorAppointments();
    }
    });
  }

  private fetchDoctorAppointments() {
    // Check if the doctorUID is set
    if (this.doctorUID) {
      // Log the collection reference for debugging
      const collectionRef = this.firestore.collection(`doctors/${this.doctorUID}/appointments`);
      console.log('Collection Reference:', collectionRef.ref.path);
  
      // Use the doctorUID to fetch appointments
      collectionRef.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      ).subscribe((appointments: any[]) => {
        this.appointments = appointments;
        console.log('Doctor Appointments:', this.appointments);
      });
    } else {
     
    }
  }


  confirmAppointment(appointment: any) {
    this.updateAppointmentStatus(appointment, 'Confirmed');
  }

  rejectAppointment(appointment: any) {
    this.updateAppointmentStatus(appointment, 'Rejected');
  }

  private updateAppointmentStatus(appointment: any, newStatus: string) {
    const appointmentId = appointment.id;

    if (appointmentId) {
      // Update the status in the doctor's appointments subcollection
      this.docAppointmentService.updateAppointmentStatus(appointmentId, newStatus).then(() => {
        // Update the local status immediately (optional)
        appointment.status = newStatus;

        // Update the status in the parent's appointments subcollection
        const parentUID = appointment.parentUID;
        const parentAppointmentsCollection = this.firestore.collection(`parents/${parentUID}/appointments`);
        const parentAppointmentDocRef = parentAppointmentsCollection.doc(appointmentId);

        parentAppointmentDocRef.update({ status: newStatus }).then(() => {
          console.log('Parent appointment status updated successfully.');
        }).catch((error) => {
          console.error('Error updating parent appointment status:', error);
        });
      });
    } else {
      console.error('Error updating appointment status: Appointment ID is missing.');
    }
  }

  

}
