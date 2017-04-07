import {environment} from "../environments/environment";

export class Url {
  public static getUrl(suffix: string): string {
    return environment.url + suffix;
  }
}
