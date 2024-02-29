import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToHms'
})
export class SecondsToHmsPipe implements PipeTransform {

  transform(value: number): string {
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    const seconds: number = Math.floor(value % 60);

    const formattedHours: string = this.padZero(hours);
    const formattedMinutes: string = this.padZero(minutes);
    const formattedSeconds: string = this.padZero(seconds);

    if (formattedHours === '00' && formattedMinutes === '00') {
      return `${formattedSeconds} segundos`;
    } else if (formattedHours === '00') {
      return `${formattedMinutes}:${formattedSeconds} minutos`;
    }

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} horas`;
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

}
