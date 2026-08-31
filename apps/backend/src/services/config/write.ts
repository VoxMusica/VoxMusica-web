import { readFile, writeFile } from 'node:fs/promises'

import { parseDocument } from 'yaml'

export const updateConfigValue = async (filePath: string, keyPath: string[], value: unknown) => {
  const raw = await readFile(filePath, 'utf-8');
  const doc = parseDocument(raw);

  doc.setIn(keyPath, value); // surgically updates just this key

  writeFile(filePath, doc.toString()); // comments and formatting elsewhere in the file survive
}
