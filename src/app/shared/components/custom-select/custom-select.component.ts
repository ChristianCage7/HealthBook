import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-select',
  standalone: false,
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss']
})
export class CustomSelectComponent implements OnInit {
  @Input() label!: string;
  @Input() icon!: string;
  @Input() control!: FormControl;
  @Input() options!: { label: string; value: string }[];

  constructor() { }



  ngOnInit() {
  }

}