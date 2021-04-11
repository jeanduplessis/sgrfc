export enum RfcStatus {
  WIP = 'WIP',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  ABANDONED = 'ABANDONED',
  IMPLEMENTED = 'IMPLEMENTED',
}

export default class Rfc {
  id?: string;

  fileName: string;

  isPrivate: boolean;

  number?: number;

  status?: RfcStatus;

  title?: string;

  valid: boolean;

  error?: string;

  constructor(id: string, fileName: string, isPrivate = false) {
    this.id = id;
    this.fileName = fileName;
    this.isPrivate = isPrivate;

    const strictFileNameTokenRegex = /^RFC (\d+):? (WIP|REVIEW|APPROVED|ABANDONED|IMPLEMENTED):? ?(.*)/;

    if (fileName && strictFileNameTokenRegex.test(fileName)) {
      this.valid = true;
      const matches = fileName.match(strictFileNameTokenRegex) as Array<string>;

      this.number = parseInt(matches[1], 10);
      this.status = RfcStatus[matches[2] as keyof typeof RfcStatus];
      this.title = matches[3];
    } else {
      this.valid = false;
      this.error = 'RFC file name not complying with spec';
    }
  }

  toString(): string {
    if (this.valid) {
      return `RFC ${this.number} ${this.status}: ${this.title} ${
        this.isPrivate ? '[PRIVATE]' : ''
      } (${this.id})`;
    }

    return `[INVALID - ${this.error}] ${this.fileName} ${
      this.isPrivate ? '[PRIVATE]' : ''
    } (${this.id})`;
  }
}
