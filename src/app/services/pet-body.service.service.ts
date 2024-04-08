import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PetBodyServiceService {
  private selectedPetBodyUrlSubject = new BehaviorSubject<string>(null);

  selectedPetBodyUrl$: Observable<string | null> =
    this.selectedPetBodyUrlSubject.asObservable();

  constructor() {}

  setSelectedPetBodyUrl(url: string) {
    this.selectedPetBodyUrlSubject.next(url);
  }

  // Get the selected pet body URL from local storage
  getSelectedPetBodyUrl(): string {
    const firestorePetBodyUrl = this.selectedPetBodyUrlSubject.getValue();
    return (
      firestorePetBodyUrl || localStorage.getItem('selectedPetBodyUrl') || null
    );
  }
}
