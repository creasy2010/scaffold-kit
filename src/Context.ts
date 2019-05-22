import * as path from 'path';
import ExecutionInfo from './ExecutionInfo';
import Instruction from './Instruction';
import AppendFileInfo from './instructions/AppendFileInfo';
import CreateFileInfo from './instructions/CreateFileInfo';
import DeleteFileInfo from './instructions/DeleteFileInfo';
import DetachFromFileInfo from './instructions/DetachFromFileInfo';
import RollbackFileInfo from './instructions/RollbackFileInfo';
import RollbackJSONFileInfo from './instructions/RollbackJSONFileInfo';
import UpdateFileInfo from './instructions/UpdateFileInfo';
import UpdateJSONFileInfo from './instructions/UpdateJSONFileInfo';
import OptionRules from './OptionRules';
import Options from './Options';
import firstDefined from './utilities/firstDefined';

class Context implements ExecutionInfo {

  // middleware extentions

  public optionDefinitions: OptionRules = {};
  public savedOptions: Options = {};

  // user execution information

  public wd: string;
  public args: string[];
  public options: Options;

  // context options

  public overwrite: boolean = false;
  public silent: boolean = false;
  public mockInstall: boolean = false;

  // execution behavior

  public disableFlush: boolean = false;

  // instructions

  public instructions: Instruction[];
  private templateLocation?: string;

  // initialize method

  constructor(executionInfo: ExecutionInfo) {
    this.wd = executionInfo.wd;
    this.args = executionInfo.args;
    this.options = executionInfo.options;
    this.instructions = [];
  }

  // instruction methods

  public async useTemplateFrom(
    templateLocation: string,
    callback: () => Promise<void>
  ) {
    this.templateLocation = templateLocation;
    await callback();
    this.templateLocation = undefined;
  }

  public createFile(detail: CreateFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at),
        content: detail.content,
        context: detail.context,
        from: detail.from ? this.applyTemplate(detail.from) : detail.from,
        overwrite: firstDefined(detail.overwrite, this.overwrite)
      },
      type: 'createFile'
    });
  }

  public createFiles(details: CreateFileInfo[]) {
    for (const detail of details) {
      this.createFile(detail);
    }
  }

  public deleteFile(detail: DeleteFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at)
      },
      type: 'deleteFile'
    });
  }

  public deleteFiles(details: DeleteFileInfo[]) {
    for (const detail of details) {
      this.deleteFile(detail);
    }
  }

  public appendFile(detail: AppendFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at),
        content: detail.content,
        context: detail.context,
        from: detail.from ? this.applyTemplate(detail.from) : detail.from,
      },
      type: 'appendFile'
    });
  }

  public appendFiles(details: AppendFileInfo[]) {
    for (const detail of details) {
      this.appendFile(detail);
    }
  }

  public detachFromFile(detail: DetachFromFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at),
        content: detail.content,
        context: detail.context,
        from: detail.from ? this.applyTemplate(detail.from) : detail.from,
      },
      type: 'detachFromFile'
    });
  }

  public detachFromFiles(details: DetachFromFileInfo[]) {
    for (const detail of details) {
      this.detachFromFile(detail);
    }
  }

  public updateFile(detail: UpdateFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at),
        updator: detail.updator,
        rollbacker: detail.rollbacker
      },
      type: 'updateFile'
    });
  }

  public updateFiles(details: UpdateFileInfo[]) {
    for (const detail of details) {
      this.updateFile(detail);
    }
  }

  public rollbackFile(detail: RollbackFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at),
        updator: detail.updator,
        rollbacker: detail.rollbacker
      },
      type: 'rollbackFile'
    });
  }

  public rollbackFiles(details: RollbackFileInfo[]) {
    for (const detail of details) {
      this.rollbackFile(detail);
    }
  }

  public updateJSONFile(detail: UpdateJSONFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at),
        updator: detail.updator,
        rollbacker: detail.rollbacker
      },
      type: 'updateJSONFile'
    });
  }

  public updateJSONFiles(details: UpdateJSONFileInfo[]) {
    for (const detail of details) {
      this.updateJSONFile(detail);
    }
  }

  public rollbackJSONFile(detail: RollbackJSONFileInfo) {
    this.instructions.push({
      detail: {
        at: this.applyDestination(detail.at),
        updator: detail.updator,
        rollbacker: detail.rollbacker
      },
      type: 'rollbackJSONFile'
    });
  }

  public rollbackJSONFiles(details: RollbackJSONFileInfo[]) {
    for (const detail of details) {
      this.rollbackFile(detail);
    }
  }
  // instruction helpers

  private applyTemplate(relTempPath: string) {
    if (!relTempPath) return undefined;
    if (!this.templateLocation) return relTempPath;
    return path.resolve(this.templateLocation, relTempPath);
  }

  private applyDestination(relDestPath: string) {
    return path.resolve(this.wd, relDestPath);
  }

}

export default Context;
