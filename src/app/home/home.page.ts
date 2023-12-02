import { Component} from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';


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

  constructor(
    public authService:AuthenticationService,
    public route: Router,
    private storage: AngularFireStorage,
  ) {  
  
    this.user = authService.getProfile

  }
  ionViewDidEnter() {
    // Get the audio element and play the music
    this.playBackgroundMusic();
  }

  //fetching the images in fireabase storage
  async ngOnInit() {
    // Fetch download URLs for pet images from Firebase Storage

      this.petEyesUrl = await this.getDownloadUrl('mata', 'One.png');
      this.petMouthUrl = await this.getDownloadUrl('Mouth', 'M1.png');
      this.petBodyUrl = await this.getDownloadUrl('Body', 'body.png');
   
    // Other initialization code
   
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

    this.authService.signOut().then(()=>{
      this.route.navigate(['/landing'])
    }).catch((error)=>{
      console.log(error);
    })
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
}



