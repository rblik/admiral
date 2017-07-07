export class Event {

  constructor(title: string, start: string, length: number) {
    this.title = title;
    this.start = start;
    this.length = length;
  }

  title: string;
  start: string;
  length: number;
}
