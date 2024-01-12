import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot, DocumentData } from '@angular/fire/compat/firestore';

interface UserData {
  age?: number; // Adjust the type according to your actual data structure
  // Add other fields as needed
}

interface Game {
  id: string;
  title: string;
  description: string;
  ageRating: number;
  // Add other game properties as needed
}

@Component({
  selector: 'app-search-games',
  templateUrl: './search-games.page.html',
  styleUrls: ['./search-games.page.scss'],
})
export class SearchGamesPage implements OnInit {

  usersUID: string;
  agePreference: number;
  foundGames: Game[];
  buttonClicked: boolean = false;
  
  // Explicitly type the Firestore collection
  private gamesCollection: AngularFirestoreCollection<Game>;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { 
      // Initialize the games collection
      this.gamesCollection = this.firestore.collection<Game>('games');
  }

  ngOnInit() {
    // Fetch current user data when the component initializes
    this.fetchCurrentUserData();
  }

  fetchCurrentUserData() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        // The user is logged in, get the UID
        this.usersUID = user.uid;

        // Fetch user data from Firestore based on the UID
        this.fetchUserData(this.usersUID);
      } else {
        console.error('No user is logged in.');
      }
    });
  }


  async fetchUserData(usersUID: string) {
    try {
      const userDoc = await this.firestore
        .collection('users')
        .doc(usersUID)
        .get()
        .toPromise();

      if (userDoc.exists) {
        // Cast userData to the defined interface UserData
        const userData = userDoc.data() as UserData;

        // Extract age from user data and set it to agePreference
        this.agePreference = userData.age || null;

        console.log('User Data:', userData);

        // Don't proceed with finding games here, do it only when the button is clicked
      } else {
        console.error('User document not found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  findGames() {
    // Proceed with finding games only when the button is clicked
    if (this.usersUID && this.agePreference) {
      console.log('Current User Age:', this.agePreference);

      // Get the reference to the underlying CollectionReference
      const collectionRef = this.gamesCollection.ref;

      // Query games based on ageRating
      collectionRef
        .where('ageRating', '<=', this.agePreference)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            this.foundGames = querySnapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Game)
            );
            console.log('Found Games:', this.foundGames);

            // Display the title and description of matching games
            this.displayMatchingGames();
          } else {
            console.log('No games found for the specified age rating.');
            // You can handle the case when no games are found, for example, by displaying a message to the user.
          }

          // Set the buttonClicked flag to true after finding games
          this.buttonClicked = true;
        })
        .catch((error) => {
          console.error('Error finding games:', error);
        });
    } else {
      console.error('Invalid user or age preference.');
    }
  }

  displayMatchingGames() {
    // Filter games where ageRating matches the user's age
    const matchingGames = this.foundGames.filter(
      (game) => game.ageRating === this.agePreference
    );

    // Display the title and description of matching games
    matchingGames.forEach((game) => {
      console.log('Matching Game Title:', game.title);
      console.log('Matching Game Description:', game.description);
      // You can use these values to display information in your Angular template
      // For example, you can bind these values to HTML elements using Angular directives.
    });
  }
  
}
