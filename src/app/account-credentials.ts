import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccountCredentials {
  private admin: { username: string; password: string } | null = null;

  saveAdmin(username: string, password: string) {
    this.admin = { username, password };
  }

  readAdmin() {
    return this.admin;
  }
}
