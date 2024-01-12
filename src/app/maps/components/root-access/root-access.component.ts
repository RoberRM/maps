import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';

@Component({
  selector: 'root-access',
  templateUrl: './root-access.component.html',
  styleUrls: ['./root-access.component.scss']
})
export class RootAccessComponent {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit(): void {
    this.afAuth.signInWithPopup(new GoogleAuthProvider())
      .then(() => {
        this.router.navigate(['/add-locations']);
      })
      .catch(() => {
        this.router.navigate(['/']);
      });
  }

}
