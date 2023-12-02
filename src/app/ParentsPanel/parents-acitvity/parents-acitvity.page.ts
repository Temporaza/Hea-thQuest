import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable,combineLatest } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, switchMap } from 'rxjs/operators';
import { LoadingController, AlertController } from '@ionic/angular';
import { TaskStatusService } from 'src/app/services/task-status.service';



@Component({
  selector: 'app-parents-acitvity',
  templateUrl: './parents-acitvity.page.html',
  styleUrls: ['./parents-acitvity.page.scss'],
})
export class ParentsAcitvityPage implements OnInit {

  userEmail: string = ''; // Variable to store the kid's email
  taskDetails: string = '';
  createdActivities$: Observable<any[]>;
  tasks$: Observable<any>;
  taskStatus: string;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private taskStatusService: TaskStatusService
    ) { }

  ngOnInit() {
    this.taskStatusService.getTaskStatus().subscribe((status: string) => {
      this.taskStatus = status;
    });
    this.loadTasks();
  }

  async loadTasks() {
    const loading = await this.loadingController.create({
      message: 'Loading Tasks...',
      duration: 5000, // Set a maximum duration for the loading indicator
    });

    try {
      await loading.present();

      this.tasks$ = this.afAuth.authState.pipe(
        switchMap((user) => {
          if (user) {
            return this.firestore.collection('parents').doc(user.uid).collection('tasks').snapshotChanges().pipe(
              map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as any;
                  const id = a.payload.doc.id;
                  const userId = data.userId;

                  // Fetch user details from the 'users' collection
                  return this.firestore.collection('users').doc(userId).snapshotChanges().pipe(
                    map(userAction => {
                      const userData = userAction.payload.data() as any;
                      const userEmail = userData.email;
                      return { ...data, id, userEmail };
                    })
                  );
                });
              }),
              switchMap(taskObservables => combineLatest(taskObservables))
            );
          } else {
            return [];
          }
        })
      );
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      // Dismiss the loading indicator regardless of success or failure
      await loading.dismiss();
    }
  }

  async createTask() {
    const loading = await this.loadingController.create({
      message: 'Creating Task...',
      duration: 5000, // Set a maximum duration for the loading indicator
    });
  
    try {
      await loading.present();
  
      const userDoc = await this.firestore.collection('users').ref.where('email', '==', this.userEmail).get();
  
      if (!userDoc.empty) {
        const userId = userDoc.docs[0].id;
  
        const currentUser = this.afAuth.currentUser;
        if (currentUser) {
          const parentId = (await currentUser).uid;
  
          // Create the task object with parentId
          const task = {
            userId: userId,
            parentId: parentId, // Add parentId here
            description: this.taskDetails,
            status: 'pending',
            timestamp: new Date(),
          };
  
          // Add the task to the 'parents' collection
          const parentTaskRef = await this.firestore.collection('parents').doc(parentId).collection('tasks').add(task);
  
          // Get the generated task ID
          const taskId = parentTaskRef.id;
  
          // Add the task to the corresponding user's collection with the assigned UID
          await this.firestore.collection('users').doc(userId).collection('tasks').doc(taskId).set(task);
  
          this.taskDetails = '';
        } else {
          console.error('User not logged in.');
        }
      } else {
        console.log('There is no kid with the email:', this.userEmail);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      // Dismiss the loading indicator regardless of success or failure
      await loading.dismiss();
    }
  }
  
  editTask(task: any) {
    // Implement the logic for editing a task
    console.log('Editing task:', task);
    // Add your editing logic, e.g., opening a modal or navigating to an edit page
  }

  async deleteTask(task: any) {
    // Implement the logic for deleting a task
    const currentUser = this.afAuth.currentUser;
    if (currentUser) {
      const parentId = (await currentUser).uid;
      this.firestore.collection('parents').doc(parentId).collection('tasks').doc(task.id).delete();
    }
    console.log('Deleting task:', task);
    // Add your deletion logic, e.g., showing a confirmation dialog or making an API call
  }


}
