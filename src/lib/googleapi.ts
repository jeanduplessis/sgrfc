/* eslint-disable no-console */
import { readFileSync } from 'fs';
// const readline = require('readline');
import { google, Auth, drive_v3 } from 'googleapis';

export default class GoogleApiHelper {
  static SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive',
  ];

  jwtClient: Auth.JWT | undefined;

  // TODO add error checking and safeguards
  async authenticate(): Promise<boolean> {
    const privateKeyFields = JSON.parse(
      readFileSync('privatekey.json').toString()
    );

    const { client_email, private_key } = privateKeyFields;

    const jwtClient = new Auth.JWT(
      client_email,
      undefined,
      private_key,
      GoogleApiHelper.SCOPES
    );

    const auth = await jwtClient.authorize();

    if (auth) {
      this.jwtClient = jwtClient;
      return true;
    }

    return false;
  }

  // TODO add error checking and safeguards
  private async searchRFCs(pageToken?: string) {
    const auth = this.jwtClient;

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      corpora: 'drive',
      driveId: '0AK4DcztHds_pUk9PVA',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      pageSize: 100,
      q:
        "name contains 'RFC' and parents in '1zP3FxdDlcSQGC1qvM9lHZRaHH4I9Jwwa' or name contains 'RFC' and parents in '1KCq4tMLnVlC0a1rwGuU5OSCw6mdDxLuv'",
      fields: 'nextPageToken, files(id, name)',
      pageToken,
      orderBy: 'createdTime,name',
    });

    // if (!response || response.status !== 200) {
    //   console.log('The API returned an error: ' + response?.statusText);
    // }

    return response.data || undefined;
  }

  async getPagedRFCs(pageToken?: string): Promise<Record<string, any>> {
    const files = [];

    // eslint-disable-next-line no-await-in-loop
    const searchResponse: drive_v3.Schema$FileList = await this.searchRFCs(
      pageToken
    );

    if (searchResponse && searchResponse.files) {
      // eslint-disable-next-line no-await-in-loop
      for await (const file of searchResponse.files) {
        if (file.name && file.name.startsWith('RFC')) {
          files.push(file.name);
        }
      }
    }

    return { files, nextPageToken: searchResponse.nextPageToken };
  }

  async getAllRFCs(): Promise<string[]> {
    const files: string[] = [];

    let pagedResponse;
    let pageToken: string | null | undefined;

    do {
      // eslint-disable-next-line no-await-in-loop
      pagedResponse = await this.getPagedRFCs(
        pageToken ? pageToken : undefined
      );

      pageToken = pagedResponse?.nextPageToken;

      files.push(...pagedResponse.files);
    } while (pageToken);

    files.sort((fileA: string, fileB: string) => {
      const fileAMatches = fileA.match(/^RFC (\d+):? /m);
      const fileBMatches = fileB.match(/^RFC (\d+):? /m);

      if (
        fileAMatches &&
        fileAMatches.length === 2 &&
        fileBMatches &&
        fileBMatches.length === 2
      ) {
        return parseInt(fileAMatches[1], 10) - parseInt(fileBMatches[1], 10);
      }

      return -1;
    });

    return files;
  }
}
