import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  users: any;
  sub: any = [];
  senderId: any;
  constructor(private router: Router, private fire: FirebaseService) {}

  ngOnInit() {
    
  }

  ionViewWillEnter(){
    // your code to initialize
    this.senderId = localStorage.getItem('userId');
    const usub = this.fire.getUser().subscribe((r) => {
      if(r.docs && r.docs.length) {
        const filteredData = r.docs.filter((h) => h.id != this.senderId)
        this.users = filteredData.map((x) => {
          const data = {
            id: x.id,
            name: x.data().name,
            avatar: x.data().name.charAt(0)
          }
          return data;
        });
      } else {
        
      }
      this.processMsg();
    });
    this.sub.push(usub);
 }

  gotoChat(id) {
    localStorage.setItem('receiverId', id);
    this.router.navigate(['/chat'])
  }

  logOut() {
    localStorage.removeItem('userId');
    localStorage.removeItem('receiverId');
    this.router.navigate(['/login'])
  }

  processMsg() {
    this.users.map((user) => {
      user.msg = [];
      user.unread = [];
      const rsub =  this.fire.getMsg().subscribe((mg) => {
        const userId = user.id;
          if (mg && mg.length) {
            mg.map((mg) => {
              let data1: any = {};
              data1 = mg.payload.doc.data();
              if ((data1.sender == this.senderId || data1.receiver == this.senderId) && (data1.receiver == userId || data1.sender == userId)) {
                user.msg.push(data1);
                if (!data1.read && data1.sender == userId) {
                  user.unread.push(data1);
                }
              }
            })
          }
          user.unreadCnt = user.unread && user.unread.length;
          if (user.msg && user.msg.length>0) {
            user.lastMsg =    user.msg[user.msg.length-1].msg;
            user.lastMsgTime = user.msg[user.msg.length-1].date.split(' ')[1] + ' ' + user.msg[user.msg.length-1].date.split(' ')[2];
          }
      });
      //this.data.list.push(user);
      this.sub.push(rsub);
    });
    //console.log(this.users);
  }

}
