import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  
  user: any;

  constructor(
    public authService:AuthenticationService,
    public route: Router,
  
  ) {  this.user = authService.getProfile}

  async logout() {
    this.authService.signOut().then(()=>{
      this.route.navigate(['/landing'])
    }).catch((error)=>{
      console.log(error);
    })
  }

}
