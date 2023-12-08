import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { DocAppointmentService } from 'src/app/services/doc-appointment.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppointmentService } from 'src/app/services/appointment.service';


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
      // Fetch doctor's appointments
      // Fetch doctor's appointments
      this.fetchDoctorAppointments();
    }
    });
  }

  private fetchDoctorAppointments() {
    // Provide the doctorUID as an argument
    this.docAppointmentService.getDoctorAppointments(this.doctorUID).subscribe((appointments: any[]) => {
      this.appointments = appointments.map(appointment => ({
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        doctorFullName: appointment.doctorFullName,
        status: appointment.status || 'Pending',
      }));
  
      // Log the appointments here
      console.log('Appointments:', this.appointments);
    });
  }

  confirmAppointment(appointment: any) {
    const appointmentId = appointment.id;
  
    if (appointmentId) {
      this.docAppointmentService.updateAppointmentStatus(appointmentId, 'Confirmed').then(() => {
        // Update the local status immediately (optional)
        appointment.status = 'Confirmed';
      });
    } else {
      console.error('Error confirming appointment: Appointment ID is missing.');
    }
  }

}
