import 'mocha';
import * as sinon from 'sinon';
import * as _fs from 'fs';
import { expect } from 'chai';
import { JsonFileService } from './json-file.service';

describe('Json File Service', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('getJson should throw if "fs" module throws', (done) => {
    sandbox.stub(_fs, 'readFile').yields(new Error("test error"), null);
    let subject = new JsonFileService();
    subject.getJson("test.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('getJson should return resolved promise', (done) => {
    sandbox.stub(_fs, 'readFile').yields(null, "{}");
    let subject = new JsonFileService();
    subject.getJson("test.json").then(_ => done());
  });

  it('writeJson should throw if "fs" module throws', (done) => {
    sandbox.stub(_fs, 'writeFile').yields(new Error("test error"));
    let subject = new JsonFileService();
    subject.writeJson("test.json", {})
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('writeJson should return resolved promise', (done) => {
    sandbox.stub(_fs, 'writeFile').yields(null);
    let subject = new JsonFileService();
    subject.writeJson("test.json", {}).then(_ => done());
  });

})