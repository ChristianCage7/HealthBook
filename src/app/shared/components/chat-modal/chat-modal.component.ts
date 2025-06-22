import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { ModalController, IonContent } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss'],
  standalone: false
})
export class ChatModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() receiverUid!: string;
  @Input() idappointment!: number;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  receiverName: string = 'Usuario';
  senderUid: string = '';
  messages: ChatMessage[] = [];
  messageText: string = '';

  constructor(
    private chatService: ChatService,
    private supabaseService: SupabaseService,
    private modalCtrl: ModalController,
    private appointmentService: AppointmentService
  ) { }

  async ngOnInit() {
    try {
      this.senderUid = await this.supabaseService.getUid();
      this.loadReceiverName();

      this.chatService.loadMessages(this.idappointment);
      this.chatService.subscribeToMessages(this.idappointment);
      this.chatService.messagesObservable.subscribe(msgs => {
        this.messages = msgs;
        setTimeout(() => this.scrollToBottom(), 100);
      });
    } catch (err) {
      console.error('Error en el chat:', err);
      alert('Debes iniciar sesión para usar el chat');
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 500);
  }

  ngOnDestroy() {
    this.chatService.unsubscribe();
  }

  sendMessage() {
    const trimmed = this.messageText.trim();
    if (!trimmed) return;

    this.chatService.sendMessage(
      this.senderUid,
      this.receiverUid,
      this.idappointment,
      trimmed
    );

    this.messageText = '';
    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom() {
    try {
      if (this.content) {
        this.content.scrollToBottom(300).catch(() => {
          console.warn('No se pudo hacer scroll al final');
        });
      }
    } catch (err) {
      console.warn('Error haciendo scroll:', err);
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  loadReceiverName() {
    this.appointmentService.getUserProfessionalProfileByAppointment(this.idappointment).subscribe({
      next: (res) => {
        this.receiverName = res?.first_name + ' ' + res?.last_name;
      },
      error: () => {
        this.appointmentService.getUserBasicProfileByAppointment(this.idappointment).subscribe({
          next: (res) => {
            this.receiverName = res?.first_name + ' ' + res?.last_name;
          },
          error: () => {
            this.receiverName = 'Usuario';
          }
        });
      }
    });
  }
}
