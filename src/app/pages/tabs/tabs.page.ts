import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { sharedStandaloneImports } from 'src/app/shared_standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, sharedStandaloneImports]
})
export class TabsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  

}
