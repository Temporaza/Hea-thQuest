import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthenticationForDoctorsService } from '../authenticationDoctors/authentication-for-doctors.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthenticationForDoctorsService, private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // You can use the 'state' parameter here if needed in the future
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      // Redirect to the login page if not authenticated
      return this.router.parseUrl('/landing');
    }
  }
}
