import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';

import EpAsyncApiDocumentService from '../../../src/services/EpAsyncApiDocumentService';
import { EpAsyncApiDocument, T_EpAsyncApiMessageDocumentMap } from '../../../src/documents/EpAsyncApiDocument';
import { EpAsyncApiError } from '../../../src/utils/EpAsyncApiErrors';
import { E_EpAsyncApiSchemaFormatType } from '../../../src/documents/EpAsyncApiMessageDocument';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

let AsyncApiSpecFile: string;
// let AsyncApiSpecFile_X_EpApplicationDomainName: string;
let AsyncApiDocument: EpAsyncApiDocument;
describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize globals`, async () => {
      try {
        AsyncApiSpecFile = `${TestConfig.getConfig().dataRootDir}/test-pass/avro+json-schema.spec.yml`;
        // AsyncApiSpecFile_X_EpApplicationDomainName = "Discovery";
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should parse spec`, async () => {
      try {
        AsyncApiDocument = await EpAsyncApiDocumentService.createFromFile({
          filePath: AsyncApiSpecFile,
        });
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should validate best practices`, async () => {
      try {
        AsyncApiDocument.validate_BestPractices();
      } catch(e) {
        expect(e instanceof EpAsyncApiError, TestLogger.createNotEpAsyncApiErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpAsyncApiTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should validate schema format of messages`, async () => {
      try {
        const epAsyncApiMessageDocumentMap: T_EpAsyncApiMessageDocumentMap = AsyncApiDocument.getEpAsyncApiMessageDocumentMap();
        for(const [key, epAsyncApiMessageDocument] of epAsyncApiMessageDocumentMap) {
          const epAsyncApiSchemaFormatType: E_EpAsyncApiSchemaFormatType = epAsyncApiMessageDocument.getSchemaFormatType();
          let expectedSchemaFormatType: E_EpAsyncApiSchemaFormatType;
          if(key.includes('json')) expectedSchemaFormatType = E_EpAsyncApiSchemaFormatType.APPLICATION_JSON;
          else if(key.includes('avro')) expectedSchemaFormatType = E_EpAsyncApiSchemaFormatType.APPLICATION_AVRO;
          const message = `\nkey=${key}, \nexpectedSchemaFormatType=${expectedSchemaFormatType}, \nepAsyncApiSchemaFormatType=${epAsyncApiSchemaFormatType}`;
          expect(epAsyncApiSchemaFormatType, message).to.eq(expectedSchemaFormatType);
        }
      } catch(e) {
        expect(false, TestLogger.createTestFailMessageForError('failed', e)).to.be.true;
      }
    });

});

