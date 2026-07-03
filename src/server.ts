import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import ExcelJS from 'exceljs';
import { join } from 'node:path';
import { promises as fs } from 'fs';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// parse JSON bodies for API endpoints
app.use(express.json());

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// API: save contact submissions to an Excel file
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

    const dataDir = join(import.meta.dirname, '..', 'data');
    const filePath = join(dataDir, 'contacts.xlsx');
    await fs.mkdir(dataDir, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(filePath);
    } catch {
      // File doesn't exist yet, so create a new workbook.
    }

    const worksheet = workbook.getWorksheet('Contacts') ?? workbook.addWorksheet('Contacts');

    if (!worksheet.getRow(1).getCell(1).value) {
      worksheet.columns = [
        { header: 'Timestamp', key: 'timestamp', width: 28 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Message', key: 'message', width: 60 },
      ];
    }

    worksheet.addRow({
      timestamp: new Date().toISOString(),
      name,
      email,
      message,
    });

    await workbook.xlsx.writeFile(filePath);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Failed to save contact', err);
    return res.status(500).json({ error: 'Failed to save' });
  }
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
