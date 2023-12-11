import { Component} from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertController, LoadingController } from '@ionic/angular';
import { PetBodyServiceService } from '../services/pet-body.service.service';
import { TaskStatusService } from '../services/task-status.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChangeDetectorRef } from '@angular/core';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  user: any;
  isAudioPlaying: boolean = true;

  // Properties to store download URLs
  petEyesUrl: string;
  petMouthUrl: string;
  petBodyUrl: string;

  selectedPetBodyUrl: string;

  totalPoints: number = 0; // Initialize with a default value

  constructor(
    public authService:AuthenticationService,
    public route: Router,
    private storage: AngularFireStorage,
    private loadingController: LoadingController,
    private petBodyService: PetBodyServiceService,
    private taskStatusService: TaskStatusService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private cdr: ChangeDetectorRef,
    private alertControler: AlertController
  ) {  
  
    this.user = authService.getProfile

      // Subscribe to changes in the task status
      this.taskStatusService.getTaskStatus().subscribe((statusWithPoints) => {
        const { status, points } = statusWithPoints;
      
        // Now you have both status and points to work with
        if (status === 'Completed') {
          // Update the total points when a task is completed
          this.updateTotalPoints(points);
        }
      });
  }
  
  updateTotalPoints(newPoints: number) {
    this.totalPoints += newPoints;
  }


  ionViewDidEnter() {

    // Show loading spinner
    this.createLoading();
    // Get the audio element and play the music
    this.playBackgroundMusic();
    // Fetch download URLs for pet images from Firebase Storage
    this.fetchPetImages();
   
    // Get the audio element and play the music

  }

  ngAfterViewInit() {
    this.taskStatusService.getTotalPoints().subscribe((totalPoints) => {
      this.totalPoints = totalPoints;
       // Manually trigger change detection
       this.cdr.detectChanges();
    });

    this.checkUser();
  }

  async checkUser() {
    try {
      const user = await this.afAuth.currentUser;

      if (user) {
        const userId = user.uid;

        // Pass the userId to fetchTotalPoints
        await this.fetchTotalPoints(userId);

        // Log the user ID for debugging
        console.log('User ID:', userId);

        // Fetch total points using the user ID
        const totalPoints = await this.taskStatusService.getTotalPointsFromFirestore(userId);

        // Update the total points in the local subject
        this.taskStatusService.setTotalPoints(totalPoints);

        // Load saved pet body URL from local storage
        const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();

        if (userDoc.exists) {
          // Get the 'petBodyUrl' field from the user document
          this.petBodyUrl = userDoc.get('petBodyUrl');

          console.log('Selected PetBodyImage URL:', this.petBodyUrl);

          // Subscribe to changes in the selected pet body URL
          this.petBodyService.setSelectedPetBodyUrl(this.petBodyUrl);
        } else {
          console.error('User document not found.');
          // Handle the case when the user document is not found
          // For example, redirect to a different page or show an error message
        }

        // Fetch download URLs for pet images from Firebase Storage
        await this.fetchPetImages();

        // Other initialization code
      } else {
        console.error('User not authenticated.');
        // Handle the case when the user is not authenticated
        // For example, redirect to the login page
        this.route.navigate(['/login']);  // Update this route accordingly
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }

  async fetchPetImages() {
    const loading = await this.createLoading();
    try {
        await loading.present();

        this.petEyesUrl = await this.getDownloadUrl('mata', 'One.png');
        this.petMouthUrl = await this.getDownloadUrl('Mouth', 'M1.png');
        this.petBodyUrl = this.petBodyService.getSelectedPetBodyUrl() || '';

        // Perform additional tasks if needed after fetching all images

    } catch (error) {
        console.error('Error fetching pet images:', error);
    } finally {
        // Dismiss the loading spinner whether successful or not
        await loading.dismiss();
    }
}

async createLoading() {
    const loading = await this.loadingController.create({
        message: 'Preparing your pet...', // You can customize the loading message
        spinner: 'lines-sharp',
        translucent: true,
        cssClass: 'custom-loading-class' // Add a custom CSS class if needed
    });
    return loading;
}
   
  async getDownloadUrl(part: string, imageName: string): Promise<string> {
    const imagePath = `PetDefault/${part}/${imageName}`;
    const storageRef = this.storage.ref(imagePath);
    return storageRef.getDownloadURL().toPromise();
  }
  //End of fetching


  async logout() {
    // Pause the background music before logging out
    this.pauseBackgroundMusic();
  
    const alert = await this.alertControler.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // Handle cancel action if needed
            console.log('Logout canceled');
          }
        },
        {
          text: 'Logout',
          handler: async () => {
            try {
              await this.authService.signOut();
  
              // Clear the local total points subject
              this.taskStatusService.setTotalPoints(0);
  
              // Wait for the sign-out operation to complete
              const isAuthenticated = await this.authService.isAuthenticated();
  
              if (!isAuthenticated) {
                // After logging out, navigate to the login page and clear history
                this.route.navigate(['/landing'], { replaceUrl: true });
  
                // Log the message when the user is not authenticated
                console.log('User is not authenticated.');
              }
            } catch (error) {
              console.error('Error logging out:', error);
              // Handle any logout error, if needed
            }
          }
        }
      ]
    });
  
    await alert.present();
  }

  toggleAudio() {
    const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
    if (audio) {
      if (audio.paused) {
        this.playBackgroundMusic();
      } else {
        this.pauseBackgroundMusic();
      }
    }
  }

  private playBackgroundMusic() {
    const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
    if (audio) {
      audio.play().then(() => {
        this.isAudioPlaying = true;
      }).catch(error => {
        console.log('Failed to play background music:', error.message);
      });
    }
  }

  private pauseBackgroundMusic() {
    const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      this.isAudioPlaying = false;
    }
  }

  async fetchTotalPoints(userId: string) {
    try {
      // Fetch total points using the user ID
      const totalPoints = await this.taskStatusService.getTotalPointsFromFirestore(userId);
  
      // Update the total points in the local subject
      this.taskStatusService.setTotalPoints(totalPoints);
    } catch (error) {
      console.error('Error fetching total points:', error);
    }
  }
  
}



