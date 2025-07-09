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
  groupedMessages: { date: Date, messages: ChatMessage[] }[] = [];

  constructor(
    private chatService: ChatService,
    private supabaseService: SupabaseService,
    private modalCtrl: ModalController,
    private appointmentService: AppointmentService
  ) { }

  async ngOnInit() {
    try {
      this.senderUid = await this.supabaseService.getUid();
      await this.loadReceiverName();

      this.chatService.loadMessages(this.idappointment);
      this.chatService.subscribeToMessages(this.idappointment);

      this.chatService.messagesObservable.subscribe(msgs => {
        this.messages = msgs;
        this.groupMessagesByDate(msgs);
        this.markSeenMessages();
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

  async loadReceiverName() {
    try {
      const prof = await this.appointmentService
        .getUserProfessionalProfileByAppointment(this.idappointment)
        .toPromise();

      const basic = await this.appointmentService
        .getUserBasicProfileByAppointment(this.idappointment)
        .toPromise();

      // Determinar si el usuario actual es el profesional o el paciente
      if (prof && prof.UID === this.senderUid && basic) {
        this.receiverName = `${basic.first_name} ${basic.last_name}`;
      } else if (basic && basic.UID === this.senderUid && prof) {
        this.receiverName = `${prof.first_name} ${prof.last_name}`;
      } else {
        this.receiverName = 'Usuario';
      }
    } catch (err) {
      console.error('Error cargando nombres del chat:', err);
      this.receiverName = 'Usuario';
    }
  }

  private async markSeenMessages() {
    if (!this.receiverUid) return;

    const updated = await this.chatService.markMessagesAsSeen(this.idappointment, this.senderUid); // CAMBIO AQUÍ
    console.log('🔍 Resultado actualización:', updated);
  }




  getStatusIcon(message: ChatMessage): string {
    if (message.sender_uid !== this.senderUid) return '';
    return message.seen ? '✔✔' : '✔';
  }

  groupMessagesByDate(messages: ChatMessage[]) {
    const grouped: { [dateKey: string]: { date: Date, messages: ChatMessage[] } } = {};

    messages.forEach(msg => {
      const date = new Date(msg.timestamp);
      const key = date.toDateString();
      if (!grouped[key]) {
        grouped[key] = { date, messages: [] };
      }
      grouped[key].messages.push(msg);
    });

    this.groupedMessages = Object.values(grouped);
  }

  formatDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Hoy';
    if (isYesterday) return 'Ayer';

    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  
}
