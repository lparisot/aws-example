import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {
  CognitoUserPool, CognitoUserSession,
  CognitoUserAttribute, CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';

import { User } from './user.model';

// see https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js
// Use case 1
const POOL_DATA = {
  UserPoolId: 'eu-west-1_d1qZm9x2k', // found in general settings, Pool Id
  ClientId: '5p68ek99o9qudmd6l9biu1hibb' // found in general settings/App clients, App client id
};
const userPool = new CognitoUserPool(POOL_DATA);

@Injectable()
export class AuthService {
  authIsLoading = new BehaviorSubject<boolean>(false);
  authDidFail = new BehaviorSubject<boolean>(false);
  authStatusChanged = new Subject<boolean>();
  registeredUser: CognitoUser;

  constructor(private router: Router) {}

  // see https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js
  // Use case 1
  signUp(username: string, email: string, password: string): void {
    this.authIsLoading.next(true);
    const user: User = {
      username: username,
      email: email,
      password: password
    };
    const attributeList: CognitoUserAttribute[] = [];
    const emailAttribute = {
      Name: 'email',
      Value: user.email
    };
    attributeList.push(new CognitoUserAttribute(emailAttribute));

    userPool.signUp(user.username, user.password, attributeList, null, (err, result) => {
      if (err) {
        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }
      this.authDidFail.next(false);
      this.authIsLoading.next(false);
      this.registeredUser = result.user;
    });
    return;
  }
  // see https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js
  // Use case 2
  confirmUser(username: string, code: string) {
    this.authIsLoading.next(true);
    const userData = {
      Username: username,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }
      this.authDidFail.next(false);
      this.authIsLoading.next(false);
      this.router.navigate(['/']);
    });
  }
  // see https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js
  // Use case 4. Authenticating a user and establishing a user session with the Amazon Cognito Identity service.
  signIn(username: string, password: string): void {
    this.authIsLoading.next(true);
    const authData = {
      Username: username,
      Password: password
    };
    const authDetails = new AuthenticationDetails(authData);
    const userData = {
      Username : username,
      Pool : userPool
    };
    const cognitoUser = new CognitoUser(userData);
    const that = this;
    cognitoUser.authenticateUser(authDetails, {
        onSuccess (result: CognitoUserSession) {
          that.authStatusChanged.next(true);
          that.authDidFail.next(false);
          that.authIsLoading.next(false);
          console.log(result);
        },

        onFailure (err) {
          that.authDidFail.next(true);
          that.authIsLoading.next(false);
          console.log(err);
        }
    });
    return;
  }
  //Use case 16. Retrieving the current user from local storage.
  getAuthenticatedUser() {
    return userPool.getCurrentUser();
  }
  // Use case 14. Signing out from the application.
  logout() {
    this.getAuthenticatedUser().signOut();
    this.authStatusChanged.next(false);
  }
  isAuthenticated(): Observable<boolean> {
    const user = this.getAuthenticatedUser();
    const obs = Observable.create((observer) => {
      if (!user) {
        observer.next(false);
      } else {
        user.getSession((err, session) => {
          if (err) {
            observer.next(false);
          } else {
            if (session.isValid()) {
              observer.next(true);
            } else {
              observer.next(false);
            }
          }
        });
      }
      observer.complete();
    });
    return obs;
  }
  initAuth() {
    this.isAuthenticated().subscribe(
      (auth) => this.authStatusChanged.next(auth)
    );
  }
}
