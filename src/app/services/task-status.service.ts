import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskStatusService {

  private taskStatusSubject = new BehaviorSubject<string>('');


  constructor() { }

  getTaskStatus(): Observable<string> {
    return this.taskStatusSubject.asObservable();
  }

  setTaskStatus(status: string) {
    this.taskStatusSubject.next(status);
  }
}
