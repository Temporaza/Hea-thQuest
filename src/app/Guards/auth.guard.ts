import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationForDoctorsService } from '../authenticationDoctors/authentication-for-doctors.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthenticationForDoctorsService,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['doctor-login']);
      return false;
    }
    return true;
  }
}
