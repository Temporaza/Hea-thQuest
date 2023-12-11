import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController, ToastController } from '@ionic/angular'; // Import NavController
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { VaccineDetailsModalPage } from 'src/app/modals/vaccine-details-modal/vaccine-details-modal.page';



@Component({
  selector: 'app-home-parent',
  templateUrl: './home-parent.page.html',
  styleUrls: ['./home-parent.page.scss'],
})
export class HomeParentPage implements OnInit {

  parentFullName: string = '';
  checkedVaccines: number[] = []; // Add this line to declare the property
  appointments: any[] = [];

  constructor(
    
    private authService: AngularFireAuth,
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    console.log('ngOnInit called');
    this.fetchParentName();
    this.fetchAppointments()
    // Retrieve the checked state from Firestore
    this.authService.authState.subscribe(user => {
      if (user) {
        console.log('Authenticated user:', user);
  
        const userId = user.uid;
  
        // Get the reference to the document
        const parentDocRef = this.firestore.collection('parents').doc(userId);
  
        // Use onSnapshot to listen for real-time changes
        parentDocRef.valueChanges().subscribe((data: { checkedVaccines: number[] }) => {
          if (data) {
            this.checkedVaccines = data.checkedVaccines || [];
            console.log('checkedVaccines:', this.checkedVaccines);
          }
        });
  
        this.fetchParentName();
      } else {
        console.log('User not authenticated.');
        this.router.navigate(['/landing']);
      }
    });
  }

  private async fetchParentName() {
    try {
      const user = await this.authService.currentUser;
      if (user && user.uid) {
        // Use the user data directly if it contains the fullname
        this.parentFullName = user.displayName || '';
  
        // If you need to fetch additional data from Firestore, you can do so here
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  isActivityLocked(): boolean {
    // Check if all 8 checkboxes are checked
    // console.log('Number of checked vaccines:', this.checkedVaccines.length);
    return this.checkedVaccines.length !== 8;
  }

  navigateToActivity() {
    // Implement the navigation logic to the Activity page
    this.router.navigate(['/parents-activity']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Logout',
          handler: () => {
            this.authService.signOut()
              .then(() => {
                this.navCtrl.navigateRoot('/landing');
              })
              .catch((error) => {
                console.error('Error logging out:', error);
                // Handle any logout error, if needed
              });
          },
        },
      ],
    });
  
    await alert.present();
  }

  private fetchAppointments() {
    this.authService.authState.subscribe(async (user) => {
      if (user) {
        const parentUID = user.uid;
        const appointmentsCollection = this.firestore.collection(`parents/${parentUID}/appointments`);
  
        appointmentsCollection.snapshotChanges().subscribe((appointments: any[]) => {
          this.appointments = appointments.map(appointment => ({
            id: appointment.payload.doc.id,
            ...appointment.payload.doc.data(),
            status: appointment.payload.doc.data().status || 'Pending'
          }));
        });
      }
    });
  }

  async deleteAppointment(appointment: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Sure kabang gusto mo ito idelete Sis???? pag hindi baka sapukin kita',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              const user = await this.authService.currentUser;
              if (!user) {
                // Handle the case where the user is not authenticated
                console.error('User not authenticated.');
                return;
              }
          
              const parentUID = user.uid;
              const parentAppointmentDocRef = this.firestore.collection('parents').doc(parentUID).collection('appointments').doc(appointment.id);
              const doctorUID = appointment.doctorUID;
              const doctorAppointmentDocRef = this.firestore.collection('doctors').doc(doctorUID).collection('appointments').doc(appointment.id);
          
              // Use Firestore batch write for atomic operation
              const batch = this.firestore.firestore.batch();
              batch.delete(parentAppointmentDocRef.ref);
              batch.delete(doctorAppointmentDocRef.ref);
          
              await batch.commit();
          
              // Update the appointments array in your component to reflect the changes
              this.appointments = this.appointments.filter((a) => a.id !== appointment.id);
          
              // Show a success message
              this.presentSuccessMessage('Appointment deleted successfully.');
            } catch (error) {
              console.error('Error deleting appointment:', error);
              this.presentErrorMessage('Error deleting appointment');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  private async presentSuccessMessage(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'success',
    });
    await toast.present();
  }

  private async presentErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message: `Error: ${message}`,
      duration: 2000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  }


}
