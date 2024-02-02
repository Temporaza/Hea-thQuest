import { Component, OnDestroy} from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertController, LoadingController } from '@ionic/angular';
import { PetBodyServiceService } from '../services/pet-body.service.service';
import { TaskStatusService } from '../services/task-status.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChangeDetectorRef } from '@angular/core';

import { interval, Subscription } from 'rxjs';

import { PointsServiceService } from 'src/app/services/points.service.service';


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

  clickCount: number = 0;
  angryEyesUrl: string = 'assets/eyes/eye4.png';

  // currentHealth: number = 80;
  petHealth: number; 

  showYumImage: boolean = false;
  showHmmImage: boolean = false;

  healthRangeMap = [
    { min: 81, max: 100, eyes: '/assets/eyes/eye1.png', mouth: '/assets/Mouth/M3.png' },
    { min: 61, max: 80, eyes: '/assets/eyes/eye2.png', mouth: '/assets/Mouth/M4.png' },
    { min: 41, max: 60, eyes: '/assets/eyes/eye3.png', mouth: '/assets/Mouth/mouth2.png' },
    { min: 11, max: 40, eyes: '/assets/eyes/eye4.png', mouth: '/assets/Mouth/mouth1.png' },
    { min: 0, max: 10, eyes: '/assets/eyes/eye5.png', mouth: '/assets/Mouth/mouth1.png' },
  ];

  private healthUpdateSubscription: Subscription;

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
    private alertControler: AlertController,
    private pointsService: PointsServiceService
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
    
    this.startHealthUpdateInterval();
  }
  
  updateTotalPoints(newPoints: number) {
    this.totalPoints += newPoints;
  }

  ngOnDestroy() {
    // Unsubscribe from the health update interval when the component is destroyed
    this.stopHealthUpdateInterval();
  }


  async ionViewDidEnter() {
    // Show loading spinner
    this.createLoading();
    // Get the audio element and play the music
    this.playBackgroundMusic();
    // Fetch download URLs for pet images from Firebase Storage
    this.fetchPetImages();
   
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser) {
      await this.fetchPetHealth(currentUser.uid);

        // Check if the user has a pet body URL, if not, set a default one
    if (!this.petBodyUrl) {
      this.setDefaultPetBodyUrl();
    }
      await this.fetchPetImages();
      this.updatePetImages();
    }
  }

  ngOnInit() {
    // Subscribe to points updates
  this.pointsService.points$.subscribe((points) => {
    // Handle points update in the home component
    this.totalPoints = points;
  });
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

        this.petEyesUrl = await this.getDownloadUrl('eyes', 'eye1.png');
        this.petMouthUrl = await this.getDownloadUrl('Mouth', 'M3.png');
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

handlePetClick() {
    this.clickCount++;

    // Check if click count is 5
    if (this.clickCount === 5) {
      // Change eyes to angry eyes for 1 second
      this.petEyesUrl = this.angryEyesUrl;
      this.showHmmImage = true;

      // After 1 second, reset eyes to the original state
      setTimeout(() => {
        this.petEyesUrl = '/assets/eyes/eye1.png';
        this.showHmmImage = false;  // Replace with the original eyes image
      }, 1000);

      // Reset click count
      this.clickCount = 0;
    }

    console.log('Number of clicks on pet body:', this.clickCount);
  }

  handleSaladClick() {
     // Show the Yum image
     this.showYumImage = true;
    // After 1 second, hide the Yum image
    setTimeout(() => {
      this.showYumImage = false;
    }, 2000);

    // Add 5 to the pet's health when the salad is clicked
    const newHealth = Math.min(this.petHealth + 5, 100); // Cap the health at 100
    this.updatePetHealth(newHealth);
    this.updatePetImages(); // Update images based on the current health

    // Log the click for debugging
    console.log('Salad clicked. Pet health increased by 5.');
  }
  

  async fetchPetHealth(userId: string) {
    try {
      const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();
      if (userDoc.exists) {
        const petHealth = userDoc.get('petHealth');
        this.petHealth = petHealth !== undefined ? petHealth : 100;
        this.updatePetImages(); // Update images based on the fetched pet health
      }
    } catch (error) {
      console.error('Error fetching pet health:', error);
    }
  }

  updatePetImages() {
    const matchingRange = this.healthRangeMap.find(
      (range) => this.petHealth >= range.min && this.petHealth <= range.max
    );

    if (matchingRange) {
      this.petEyesUrl = matchingRange.eyes;
      this.petMouthUrl = matchingRange.mouth;
    } else {
      console.error('Pet health value does not match any range.');
    }
  }

  startHealthUpdateInterval() {
    console.log('startHealthUpdateInterval called');

    this.healthUpdateSubscription = interval(100000).subscribe(() => {
      const newHealth = this.petHealth - 10;
      const updatedHealth = Math.max(newHealth, 0);

      this.updatePetHealth(updatedHealth);
      this.updatePetImages(); // Update images based on the current health
    });
  }

  stopHealthUpdateInterval() {
    // Unsubscribe from the health update interval to avoid memory leaks
    if (this.healthUpdateSubscription) {
      this.healthUpdateSubscription.unsubscribe();
    }
  }

  async updatePetHealth(newHealth: number) {
    // Update the pet's health in the local variable and in the Firestore document
    this.petHealth = newHealth;

    // Save the updated pet health to Firestore
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const userId = (await currentUser).uid;
      this.firestore.collection('users').doc(userId).update({ petHealth: newHealth })
        .then(() => {
          console.log('Pet health updated successfully.');
        })
        .catch((error) => {
          console.error('Error updating pet health:', error);
        });
    }
  }

  private async setDefaultPetBodyUrl() {
    // Set the parameters for the default pet body image
    const part = 'Body';
    const imageName = 'Normal.png';
  
    // Fetch the current user
    const currentUser = this.authService.getCurrentUser();
  
    if (currentUser) {
      const userId = (await currentUser).uid;
  
      // Fetch the user document from Firestore
      const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();
  
      // Check if the user document exists and if petBodyUrl is not set
      if (userDoc.exists && !userDoc.get('petBodyUrl')) {
        // Get the download URL for the default pet body image
        this.getDownloadUrl(part, imageName)
          .then((url) => {
            // Update the pet body URL in the local variable
            this.petBodyUrl = url;
  
            // Save the default pet body URL to Firestore
            this.firestore.collection('users').doc(userId).update({ petBodyUrl: url })
              .then(() => {
                console.log('Default pet body URL set successfully.');
              })
              .catch((error) => {
                console.error('Error setting default pet body URL:', error);
              });
          })
          .catch((error) => {
            console.error('Error fetching default pet body URL:', error);
          });
      } else {
        // Use the existing pet body URL from Firestore if available
        this.petBodyUrl = userDoc.get('petBodyUrl');
      }
    }
  }
  
}



