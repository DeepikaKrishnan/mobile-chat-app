import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {IonContent} from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  msglist: any = [];
  msg: any;
  senderId: any;
  receiverId: any;
  receiverData: any;
  senderData: any;
  sub: any = [];
  @ViewChild('input', {static: false}) searchInput: { setFocus: () => void; } ;
  @ViewChild('scrollElement', {static: false}) content: IonContent;
  constructor(private router: Router, private dp: DatePipe, private fire: FirebaseService) {
    this.senderId = localStorage.getItem('userId');
    this.receiverId = localStorage.getItem('receiverId');
    const usub = this.fire.getUser().subscribe((r) => {
      if(r.docs && r.docs.length) {
        const receiverData = r.docs.find((x) => x.id == this.receiverId);
        if (receiverData) {
          this.receiverData = receiverData.data();
        }
        const senderData = r.docs.find((x) => x.id == this.senderId);
        if (senderData) {
          this.senderData = senderData.data();
        }
      }
    });
   }

   ngOnInit() {
    const rsub = this.fire.getMsg().subscribe((x) => {
      if (x && x.length) {
        const filteredData = x.filter((v: any) => {
          if (v.type == 'added') {
            let data1: any;
            data1 = v.payload.doc.data();
            return (data1.sender == this.senderId || data1.receiver == this.senderId) && (data1.receiver == this.receiverId || data1.sender == this.receiverId);
          }
        });
        const newData = filteredData.map((x: any) => {
          let data: any = {};
          data = x.payload.doc.data();
          return data;
        });

        const receiverData = x.filter((v: any) => { 
          if (v.type == 'added') {
            let data1: any;
            data1 = v.payload.doc.data();
            return (data1.receiver == this.senderId && data1.sender == this.receiverId);
          }
        });

        receiverData.map((x)=> {
          this.fire.updateRead(x.payload.doc.id);
        });
        this.msglist.push(...newData);
      }
      this.sub.push(rsub);
      });
      //console.log(this.msglist);
  }

  ionViewDidEnter(){
    this.updateScroll();
  }

  sendMsg() {
    if (this.msg) {
      const msg = {
        sender: this.senderId,
        receiver: this.receiverId,
        type: 'text',
        msg: this.msg,
        date: this.dp.transform(new Date(), 'yyyy-MM-dd hh:mm a'),
        read: false
      };
     // this.msglist.push(msg); 
      this.msg = '';
      this.fire.addMsg(msg).then((x) => {
        this.updateScroll();
      });
    }
  }

  ngOnDestroy() {
    this.sub.map((x: any) => {
      x.unsubscribe();
    });
  }

  logOut() {
    localStorage.removeItem('userId');
    localStorage.removeItem('receiverId');
    this.router.navigate(['/login']);
  }

  focusSearch() {
    this.searchInput.setFocus();
  }

  updateScroll() {
    //console.log('scrollToBottom');
    this.content.scrollToBottom();
  }

}
