import * as vscode from 'vscode';

export enum Mode {
  STDIO = 'STDIO',
  TCP = 'TCP'
}

export class JsonnetDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
  context: vscode.ExtensionContext;
  binPath: string;
  mode: Mode;
  channel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext, binPath: string, channel: vscode.OutputChannel, mode: Mode) {
    this.context = context;
    this.binPath = binPath;
    this.mode = mode;
    this.channel = channel;
  }

  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
    executable: vscode.DebugAdapterExecutable | undefined,
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    if (this.mode == Mode.STDIO) {
      this.channel.appendLine("Starting debugger in `stdio` mode");
      return this.getDebugAdapterExecutable(session);
    } else {
      this.channel.appendLine("Starting debugger in `tcp` mode");
      return this.getDebugAdapterServer(session, 54321);
    }
  }

  getDebugAdapterServer(session: vscode.DebugSession, port: number): vscode.DebugAdapterServer {
    this.channel.appendLine(`Jsonnet Debugger will start: 'localhost:${port}'`);
    return new vscode.DebugAdapterServer(port, "localhost");
  }

  getDebugAdapterExecutable(session: vscode.DebugSession): vscode.DebugAdapterExecutable {
    const workspaceConfig = vscode.workspace.getConfiguration('jsonnet');
    const args:string[] = [
      '-d', //debugger
      '-s', //open in stdio
      '--tlaCode', 
      getArgsFromLSP(workspaceConfig, "tlaCode"),
      '--extCode',
      getArgsFromLSP(workspaceConfig, "extCode"),
    ];
    
    try {
      this.channel.appendLine(`Jsonnet Debugger will start: '${this.binPath} ${args.join(' ')}'`);
      return new vscode.DebugAdapterExecutable(this.binPath, args);
    } catch (error) {
      // Handle errors here
      console.error('Error creating debug adapter:', error);
      vscode.window.showErrorMessage('Failed to start debug adapter. Please check the executable path and permissions.');
      return null; // Or handle the error differently
    }

  }
}

function getArgsFromLSP(workspaceConfig: vscode.WorkspaceConfiguration, key: string): string {
  const configValue = workspaceConfig.get('languageServer' + '.' + key);
  const value = JSON.stringify(configValue);
  return `${value}`;
}
