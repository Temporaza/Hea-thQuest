import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular'; // Import NavController
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';

@Component({
  selector: 'app-home-parent',
  templateUrl: './home-parent.page.html',
  styleUrls: ['./home-parent.page.scss'],
})
export class HomeParentPage implements OnInit {

  parentFullName: string = '';

  constructor(
    private authService: AuthenticationForParentsService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.fetchParentName();
  }

  private async fetchParentName() {
    try {
      const user = await this.authService.getProfile();
      if (user && user.uid) {
        const userData = await this.authService.getUserDataByUid(user.uid);
        if (userData && userData.fullname) {
          this.parentFullName = userData.fullname;
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  logout() {
    // Call your authentication service's signOut method to log the user out
    this.authService.signOut()
      .then(() => {
        // After logging out, navigate to the login page or any other desired page
        this.navCtrl.navigateRoot('/landing'); // Navigate to the login page
      })
      .catch((error) => {
        console.error('Error logging out:', error);
        // Handle any logout error, if needed
      });
  }
}
