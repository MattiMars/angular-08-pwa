import { Component, inject, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { SwUpdate } from '@angular/service-worker';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'lesson08-angular-pwa';

  isOnline = false;
  modalVersion = false;
  modalPwaEvent: any;
  modalPwaPlatform: string | undefined;

  swUpdate = inject(SwUpdate);
  platform = inject(Platform);

  public ngOnInit(): void {
    this.updateOnlineStatus();

    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt) => evt.type === 'VERSION_READY'),
        map((evt) => {
          console.info(
            `currentVersion=[${evt.currentVersion}] | latestVersion=[${evt.latestVersion}]`
          );
          this.modalVersion = true;
        })
      );
    }

    this.loadModalPwa();
  }

  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  updateVersion() {
    this.modalVersion = false;
    window.location.reload();
  }

  closeVersion() {
    this.modalVersion = false;
  }

  private loadModalPwa() {
    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.modalPwaEvent = event;
        this.modalPwaPlatform = 'ANDROID';
      });
    }

    if (this.platform.IOS && this.platform.SAFARI) {
      const isInStandaloneMode =
        'standalone' in window.navigator && window.navigator['standalone'];
      if (!isInStandaloneMode) {
        this.modalPwaPlatform = 'IOS';
      }
    }
  }

  addToHomeScreen() {
    this.modalPwaEvent.prompt();
    this.modalPwaPlatform = undefined;
  }

  closePwa() {
    this.modalPwaPlatform = undefined;
  }
}
