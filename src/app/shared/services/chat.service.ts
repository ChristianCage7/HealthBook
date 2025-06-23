import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  id: number;
  sender_uid: string;
  receiver_uid: string;
  idappointment: number;
  message: string;
  timestamp: string;
  seen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private channel: RealtimeChannel | null = null;
  private messages$ = new BehaviorSubject<ChatMessage[]>([]);

  get messagesObservable() {
    return this.messages$.asObservable();
  }

  async loadMessages(idappointment: number) {
    const { data, error } = await supabase
      .from('Messages')
      .select('*')
      .eq('idappointment', idappointment)
      .order('timestamp', { ascending: true });

    if (!error && data) {
      this.messages$.next(data as ChatMessage[]);
    }
  }

  subscribeToMessages(idappointment: number) {
    this.channel = supabase.channel('chat-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Messages',
        filter: `idappointment=eq.${idappointment}`
      }, payload => {
        const newMsg = payload.new as ChatMessage;
        this.messages$.next([...this.messages$.value, newMsg]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Messages',
        filter: `idappointment=eq.${idappointment}`
      }, payload => {
        this.updateSeenStatus(payload.new as ChatMessage);
      })
      .subscribe();
  }

  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  async sendMessage(sender_uid: string, receiver_uid: string, idappointment: number, message: string) {
    const { error } = await supabase.from('Messages').insert({
      sender_uid,
      receiver_uid,
      idappointment,
      message
    });

    if (error) {
      console.error('Error al enviar mensaje:', error);
    }
  }

  async markMessagesAsSeen(idappointment: number, viewerUid: string) {
    const { error } = await supabase
      .from('Messages')
      .update({ seen: true })
      .eq('idappointment', idappointment)
      .eq('receiver_uid', viewerUid)
      .eq('seen', false);

    if (error) {
      console.error('Error al marcar mensajes como vistos:', error);
    }
  }

  private updateSeenStatus(updatedMessage: ChatMessage) {
    const currentMessages = this.messages$.value;
    const index = currentMessages.findIndex(msg => msg.id === updatedMessage.id);

    if (index > -1) {
      currentMessages[index] = updatedMessage;
      this.messages$.next([...currentMessages]);
    }
  }
}
