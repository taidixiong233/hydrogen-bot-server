import Error from "tderrors";

export default class ErrorChild {
  constructor(private error: Error, private readonly from: string) {}
  public on = this.error.on;
  public once = this.error.once;
  public off = this.error.off;

  postError(errorName: string, ...args: unknown[]): void {
    if (args.length <= 0) {
      this.error.postError(`[${this.from}] ${errorName}`);
    } else {
      this.error.postError(`[${this.from}] ${errorName}`, args);
    }
    return;
  }
  postLog(errorName: string, ...args: unknown[]): void {
    if (args.length <= 0) {
      this.error.postLog(`[${this.from}] ${errorName}`);
    } else {
      this.error.postLog(`[${this.from}] ${errorName}`, args);
    }
    return;
  }
}
