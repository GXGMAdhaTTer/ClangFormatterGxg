import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process from 'child_process';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('clangformattergxg.formatWithClangFormat', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No open text editor');
            return;
        }

        const document = editor.document;
        const clangFormatPath = vscode.workspace.getConfiguration('clang-format').get<string>('path', '.clang-format');
        const clangFormatExecutable = 'clang-format'; // Assuming clang-format is in PATH or you can specify full path here

        // Find the workspace folder or open file's directory
        let workspaceFolder: vscode.WorkspaceFolder | undefined;
        if (vscode.workspace.workspaceFolders) {
            workspaceFolder = vscode.workspace.workspaceFolders[0];
        } else {
            const documentUri = document.uri;
            if (documentUri.scheme === 'file') {
                const folderPath = path.dirname(documentUri.fsPath);
                workspaceFolder = {
                    uri: vscode.Uri.file(folderPath),
                    name: path.basename(folderPath)
                } as any; // As WorkspaceFolder
            }
        }

        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        // const clangFormatFilePath = path.join(workspaceFolder.uri.fsPath, clangFormatPath);

        // Check if .clang-format exists in workspace folder
        if (!fs.existsSync(clangFormatPath)) {
          vscode.window.showErrorMessage(`No .clang-format file found at ${clangFormatPath}`);
          return;
        }
        
        // Run clang-format command
        const formatCommand = `${clangFormatExecutable} -i ${document.uri.fsPath} -style=file:${clangFormatPath}`;
        child_process.exec(formatCommand, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error formatting document: ${error.message}`);
                return;
            }

            if (stderr) {
                vscode.window.showErrorMessage(`clang-format output: ${stderr}`);
                return;
            }

            vscode.window.showInformationMessage('Document formatted successfully');
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}