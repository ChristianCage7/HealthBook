import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { sharedStandaloneImports } from 'src/app/shared_standalone';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [sharedStandaloneImports]
})
export class MainPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
