import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private db: AngularFirestore, public toastController: ToastController, private localNotifications: LocalNotifications) { }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  doRegister(user) {
    return this.db.collection('users').add({
      name: user.name,
      password: user.password,
    });
  }

  doLogin(user): Observable<any> {
    return this.db.collection('users', ref => ref.where('name', '==', user.name).where('password', '==', user.password)).get();
  }

  addMsg(msg) {
    return this.db.collection('messages').add(msg);
  }

  getUser(): Observable<any> {
    return this.db.collection('users').get();
  }

  getMsg(): Observable<any> {
    return this.db.collection('messages', ref => ref.orderBy('date', 'asc')).stateChanges();
  }

  updateRead(id) {
    return this.db.collection('messages').doc(id).update({read: true});
  }

  notify() {
    console.log('notify');
    this.localNotifications.schedule({
      id: 1,
      text: 'Init ILocalNotification',
      //sound: isAndroid? 'file://sound.mp3': 'file://beep.caf',
      data: { secret: 'secret' }
    });
  }
}
