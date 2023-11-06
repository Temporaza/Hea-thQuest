import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './Guards/auth.guard';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'daily-task',
    loadChildren: () => import('./pages/daily-task/daily-task.module').then( m => m.DailyTaskPageModule)
  },
  {
    path: 'pet',
    loadChildren: () => import('./pages/pet/pet.module').then( m => m.PetPageModule)
  },
  {
    path: 'upcoming-task',
    loadChildren: () => import('./pages/upcoming-task/upcoming-task.module').then( m => m.UpcomingTaskPageModule)
  },
  {
    path: 'finished-task',
    loadChildren: () => import('./pages/finished-task/finished-task.module').then( m => m.FinishedTaskPageModule)
  },
  {
    path: 'shop',
    loadChildren: () => import('./pages/shop/shop.module').then( m => m.ShopPageModule)
  },
  {
    path: 'parent-login',
    loadChildren: () => import('./ParentsPanel/parent-login/parent-login.module').then( m => m.ParentLoginPageModule),


  },
  {
    path: 'parent-register',
    loadChildren: () => import('./ParentsPanel/parent-register/parent-register.module').then( m => m.ParentRegisterPageModule)
  },
  {
    path: 'home-parent',
    loadChildren: () => import('./ParentsPanel/home-parent/home-parent.module').then( m => m.HomeParentPageModule),
    
  },


  {
    path: 'doctor-login',
    loadChildren: () => import('./DoctorsPanel/doctor-login/doctor-login.module').then( m => m.DoctorLoginPageModule),
   
  },
  {
    path: 'doctor-register',
    loadChildren: () => import('./DoctorsPanel/doctor-register/doctor-register.module').then( m => m.DoctorRegisterPageModule)
  },
  {
    path: 'doctor-home',
    loadChildren: () => import('./DoctorsPanel/doctor-home/doctor-home.module').then( m => m.DoctorHomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'kids-progress',
    loadChildren: () => import('./ParentsPanel/kids-progress/kids-progress.module').then( m => m.KidsProgressPageModule)
  },
  {
    path: 'consultation',
    loadChildren: () => import('./ParentsPanel/consultation/consultation.module').then( m => m.ConsultationPageModule)
  },
  {
    path: 'vaccination',
    loadChildren: () => import('./ParentsPanel/vaccination/vaccination.module').then( m => m.VaccinationPageModule)
  },
  {
    path: 'vaccine-details-modal',
    loadChildren: () => import('./modals/vaccine-details-modal/vaccine-details-modal.module').then( m => m.VaccineDetailsModalPageModule)
  },
  {
    path: 'patient-data',
    loadChildren: () => import('./DoctorsPanel/patient-data/patient-data.module').then( m => m.PatientDataPageModule)
  },
  {
    path: 'schedule',
    loadChildren: () => import('./DoctorsPanel/schedule/schedule.module').then( m => m.SchedulePageModule)
  },
  {
    path: 'doctor-consult',
    loadChildren: () => import('./DoctorsPanel/doctor-consult/doctor-consult.module').then( m => m.DoctorConsultPageModule)
  },
  {
    path: 'pending-doc',
    loadChildren: () => import('./DoctorsPanel/pending-doc/pending-doc.module').then( m => m.PendingDocPageModule)
  },
 

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
