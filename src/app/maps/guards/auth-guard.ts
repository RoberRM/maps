import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { map, take } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly afAuth: AngularFireAuth, private readonly router: Router) {}

  canActivate() {
    return this.afAuth.authState.pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['']);
          return false;
        }
      })
    );
  }
}