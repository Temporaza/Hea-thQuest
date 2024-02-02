// babybook.page.ts

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-babybook',
  templateUrl: './babybook.page.html',
  styleUrls: ['./babybook.page.scss'],
})
export class BabybookPage implements OnInit {

  images: string[] = [
    'assets/ebook/content/Ebook FitQuest Junior-01.png',
    'assets/ebook/content/Ebook FitQuest Junior-02.png',
    'assets/ebook/content/Ebook FitQuest Junior-03.png',
    'assets/ebook/content/Ebook FitQuest Junior-04.png',
    'assets/ebook/content/Ebook FitQuest Junior-06.png',
    'assets/ebook/content/Ebook FitQuest Junior-07.png',
    'assets/ebook/content/Ebook FitQuest Junior-08.png',
    'assets/ebook/content/Ebook FitQuest Junior-09.png',
    'assets/ebook/content/Ebook FitQuest Junior-10.png',

    'assets/ebook/content/Ebook FitQuest Junior-11.png',
    'assets/ebook/content/Ebook FitQuest Junior-12.png',
    'assets/ebook/content/Ebook FitQuest Junior-13.png',
    'assets/ebook/content/Ebook FitQuest Junior-14.png',
    'assets/ebook/content/Ebook FitQuest Junior-15.png',
    'assets/ebook/content/Ebook FitQuest Junior-16.png',
    'assets/ebook/content/Ebook FitQuest Junior-17.png',
    'assets/ebook/content/Ebook FitQuest Junior-18.png',
    'assets/ebook/content/Ebook FitQuest Junior-19.png',
    'assets/ebook/content/Ebook FitQuest Junior-20.png',

    'assets/ebook/content/Ebook FitQuest Junior-21.png',
    'assets/ebook/content/Ebook FitQuest Junior-22.png',
    'assets/ebook/content/Ebook FitQuest Junior-23.png',
    'assets/ebook/content/Ebook FitQuest Junior-24.png',
    'assets/ebook/content/Ebook FitQuest Junior-25.png',
    'assets/ebook/content/Ebook FitQuest Junior-26.png',
    'assets/ebook/content/Ebook FitQuest Junior-27.png',
    'assets/ebook/content/Ebook FitQuest Junior-28.png',
    'assets/ebook/content/Ebook FitQuest Junior-29.png',
    'assets/ebook/content/Ebook FitQuest Junior-30.png',

    'assets/ebook/content/Ebook FitQuest Junior-31.png',
    'assets/ebook/content/Ebook FitQuest Junior-32.png',
    'assets/ebook/content/Ebook FitQuest Junior-33.png',
    'assets/ebook/content/Ebook FitQuest Junior-34.png',
    'assets/ebook/content/Ebook FitQuest Junior-35.png',
  ];

  currentPage: number = 0;

  constructor() { }

  ngOnInit() {
  }

  nextPage() {
    if (this.currentPage < this.images.length - 1) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}
