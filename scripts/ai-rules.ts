#!/usr/bin/env node

import { createEngine } from '../packages/engine/src';

interface CliOptions {
    command?: string;
    workspace: string;
    target?: string;
    yes: boolean;
    json: boolean;
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));

    if (!options.command || options.command === 'help') {
        printHelp();
        return;
    }

    const engine = createEngine({ workspaceRoot: options.workspace });

    switch (options.command) {
        case 'scan': {
            const result = await engine.scanWorkspace();
            output(options, result, [
                `Source: ${result.sourceFile || 'not found'}`,
                `Rule files: ${result.ruleFiles.length}`,
                ...result.ruleFiles.map(file => `- ${file.aiType}: ${file.path} (${file.syncStatus})`)
            ]);
            break;
        }

        case 'status': {
            const status = await engine.getStatus();
            output(options, status, [
                `Source: ${status.hasSource ? 'found' : 'not found'}`,
                `Synced: ${status.syncedRules}`,
                `Outdated: ${status.outdatedRules}`,
                `Missing: ${status.absentRules}`
            ]);
            break;
        }

        case 'init': {
            requireYes(options);
            const sourcePath = await engine.createSourceFile();
            output(options, { sourcePath }, [`Created ${sourcePath}`]);
            break;
        }

        case 'sync': {
            requireYes(options);

            if (options.target) {
                await engine.syncTarget(options.target, { overwrite: true, addHeader: true });
                output(options, { syncedTarget: options.target }, [`Synced ${options.target}`]);
            } else {
                const result = await engine.syncAll({ overwrite: true, addHeader: true });
                output(options, result, [
                    `Synced files: ${result.syncedFiles.length}`,
                    `Failed files: ${result.failedFiles.length}`,
                    ...result.failedFiles.map(file => `- ${file}`)
                ]);

                if (!result.success) {
                    process.exitCode = 1;
                }
            }
            break;
        }

        case 'consolidate': {
            requireYes(options);
            const sourcePath = await engine.consolidateRules({ overwrite: true });
            output(options, { sourcePath }, [`Consolidated rules into ${sourcePath}`]);
            break;
        }

        default:
            throw new Error(`Unknown command: ${options.command}`);
    }
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {
        command: args[0],
        workspace: process.cwd(),
        yes: false,
        json: false
    };

    for (let index = 1; index < args.length; index++) {
        const arg = args[index];

        switch (arg) {
            case '--workspace':
                options.workspace = args[++index];
                break;
            case '--target':
                options.target = args[++index];
                break;
            case '--yes':
            case '-y':
                options.yes = true;
                break;
            case '--json':
                options.json = true;
                break;
            default:
                throw new Error(`Unknown option: ${arg}`);
        }
    }

    return options;
}

function requireYes(options: CliOptions): void {
    if (!options.yes) {
        throw new Error('This command can write files. Re-run with --yes to confirm.');
    }
}

function output(options: CliOptions, jsonValue: unknown, lines: string[]): void {
    if (options.json) {
        console.log(JSON.stringify(jsonValue, null, 2));
        return;
    }

    console.log(lines.join('\n'));
}

function printHelp(): void {
    console.log(`AI Rules Manager

Usage:
  ai-rules <command> [options]

Commands:
  scan          Scan the workspace without writing files
  status        Print synchronization summary without writing files
  init          Create Ai_Rules.md
  sync          Sync all targets or one target with --target <id>
  consolidate   Consolidate scattered rule files into Ai_Rules.md

Options:
  --workspace <path>  Workspace path (defaults to current directory)
  --target <id>      Target AI id for sync
  --yes, -y          Confirm commands that write files
  --json            Print JSON output
`);
}

main().catch(error => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exitCode = 1;
});
