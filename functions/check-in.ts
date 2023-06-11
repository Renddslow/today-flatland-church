import { google } from 'googleapis';
import { Handler, HandlerEvent } from '@netlify/functions';

const SHEETS_SERVICE_ACCOUNT = process.env.SHEETS_SERVICE_ACCOUNT;
const SHEET_ID = process.env.SHEET_ID;

const handler: Handler = async (event: HandlerEvent) => {
  const { data } = JSON.parse(event.body);
  const { attributes } = data;

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(SHEETS_SERVICE_ACCOUNT),
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `A:I`,
    insertDataOption: 'INSERT_ROWS',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          attributes.firstName,
          attributes.lastName,
          attributes.email,
          attributes.salvation,
          attributes.recommit,
          attributes.visit,
          attributes.groups,
          attributes.prayerRequest,
          attributes.response,
          new Date(),
        ],
      ],
    },
  });

  return {
    statusCode: 200,
  };
};

export { handler };
