/* eslint-disable no-console */
import { readFileSync } from 'fs';
// const readline = require('readline');
import { google, Auth, drive_v3 } from 'googleapis';
import Rfc from '../types/rfc';

export default class ApiHelper {
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
      ApiHelper.SCOPES
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
      fields: 'nextPageToken, files(id, name, parents)',
      pageToken,
      orderBy: 'createdTime,name',
    });

    // if (!response || response.status !== 200) {
    //   console.log('The API returned an error: ' + response?.statusText);
    // }

    return response.data || undefined;
  }

  async getPagedRFCs(pageToken?: string): Promise<Record<string, any>> {
    const rfcs: Rfc[] = [];

    // eslint-disable-next-line no-await-in-loop
    const searchResponse: drive_v3.Schema$FileList = await this.searchRFCs(
      pageToken
    );

    if (searchResponse && searchResponse.files) {
      // eslint-disable-next-line no-await-in-loop
      for await (const file of searchResponse.files) {
        if (file.name && file.name.startsWith('RFC')) {
          rfcs.push(
            new Rfc(
              file.name,
              file.parents?.includes('1KCq4tMLnVlC0a1rwGuU5OSCw6mdDxLuv') // is the file from the private RFCs folder
            )
          );
        }
      }
    }

    return { rfcs, nextPageToken: searchResponse.nextPageToken };
  }

  async getAllRFCs(): Promise<Rfc[]> {
    const rfcs: Rfc[] = [];

    let pagedResponse;
    let pageToken: string | null | undefined;

    do {
      // eslint-disable-next-line no-await-in-loop
      pagedResponse = await this.getPagedRFCs(
        pageToken ? pageToken : undefined
      );

      pageToken = pagedResponse?.nextPageToken;

      rfcs.push(...pagedResponse.rfcs);
    } while (pageToken);

    rfcs.sort((a: Rfc, b: Rfc) => {
      if (a.number && b.number) {
        return a.number - b.number;
      }

      return 1;
    });

    return rfcs;
  }
}
