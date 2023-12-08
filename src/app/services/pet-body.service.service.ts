import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PetBodyServiceService {

  private selectedPetBodyUrlSubject = new BehaviorSubject<string>(null);
  selectedPetBodyUrl$ = this.selectedPetBodyUrlSubject.asObservable();

  setSelectedPetBodyUrl(url: string) {
    localStorage.setItem('selectedPetBodyUrl', url);
    this.selectedPetBodyUrlSubject.next(url);
  }
  
  // Get the selected pet body URL from local storage
  getSelectedPetBodyUrl(): string {
    return localStorage.getItem('selectedPetBodyUrl') || null;
  }

  constructor() { }
}
