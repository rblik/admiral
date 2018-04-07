export class Event {

  constructor(title: string, start: string, length: number, color: string) {
    this.title = title;
    this.start = start;
    this.length = length;
    this.color = color;
  }

  color: string;
  title: string;
  start: string;
  length: number;
}
