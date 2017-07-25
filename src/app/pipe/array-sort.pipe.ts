import {Pipe} from "@angular/core";

@Pipe({
  name: "sort"
})
export class ArraySortPipe {
  transform(array: any[], field: string): any[] {
    if (!!array) {
      array.sort((a: any, b: any) => {
        if (a[field].toLowerCase() < b[field].toLowerCase()) {
          return -1;
        } else if (a[field].toLowerCase() > b[field].toLowerCase()) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    return array;
  }
}
