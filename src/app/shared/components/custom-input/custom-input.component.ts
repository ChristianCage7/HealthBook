import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  standalone: false,
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent  implements OnInit {

  @Input() control!: FormControl;
  @Input() type: string = 'text';
  @Input() label!: string;
  @Input() autocomplete!: string;
  @Input() icon!: string;
  @Input() placeholder!: string;
  @Input() readonly: boolean = false;


  isPassword!: boolean;
  hide: boolean = true;
  
  constructor() { }

  ngOnInit() {
    if (this.type == 'password') this.isPassword = true;
  }

  onDateChange(event: any){
    this.control.setValue(event.detail.value);
  }

  showOrHidePassword(){
    this.hide = !this.hide;
    if (this.hide) this.type = 'password';
    else this.type = 'text';
  }

  
  get isDate(): boolean {
    return this.type === 'date';
  }
}
