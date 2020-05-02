import { Component, OnInit,  } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { FirebaseService } from './services/firebase.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit{
  senderId: any;
  sub: any = [];
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private localNotifications: LocalNotifications,
    private fire: FirebaseService,
    private router: Router,
    private active: ActivatedRoute
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#000000');
      //this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.senderId = localStorage.getItem('userId');
    const rsub =  this.fire.getMsg().subscribe((r) => {
      if(r && r.length) {
        const receiverData = r.filter((v: any) => { 
          if (v.type == 'added') {
            let data1: any;
            data1 = v.payload.doc.data();
            return (data1.receiver == this.senderId);
          }
        });

        receiverData.map((x)=> {
          let data1: any;
            data1 = x.payload.doc.data();
            if (this.router.url !== 'login' && this.router.url !== '/chat') {
              if (data1.sender != this.senderId && !data1.read) {
                if (data1.type == 'text') {
                  this.notify(data1.msg, data1.sender);
                }
              }
            }
        })
      }
     })
     this.sub.push(rsub);
  }

  notify(msg, senderId) {
    let sender;
    const usub = this.fire.getUser().subscribe((r) => {
      if(r.docs && r.docs.length) {
        const senderData = r.docs.find((x) => x.id == senderId);
        if (senderData) {
          sender = senderData.data();
          console.log('notify', sender.name);
          this.localNotifications.schedule({
            id: 1,
            text: msg,
            title: 'New Message from '+ sender.name,
            data: { secret: 'secret' },
            icon: 'assets/icon/chatd.png',
            sound: this.platform.is('android')? 'file://assets/sounds/shame.mp3': 'file://assets/sounds/bell.mp3',
            foreground: true
          });
        }
      }
    });
    
  }
  }
