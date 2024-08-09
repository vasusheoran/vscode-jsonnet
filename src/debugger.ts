import * as vscode from 'vscode';

export class JsonnetDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
  context: vscode.ExtensionContext;
  binPath: string;

  constructor(context: vscode.ExtensionContext, binPath: string) {
    this.context = context;
    this.binPath = binPath;
  }

  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
    executable: vscode.DebugAdapterExecutable | undefined,
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    return this.getDebugAdapterExecutable(session);
    // return this.getDebugAdapterServer(session, 54321);
  }

  getDebugAdapterServer(session: vscode.DebugSession, port: number): vscode.DebugAdapterServer {
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
