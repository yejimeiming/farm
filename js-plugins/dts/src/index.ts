import type { JsPlugin } from '@farmfe/core';
import path from 'node:path';

import Context from './context.js';
import { pluginName } from './options.js';
import { tryToReadFileSync } from './utils.js';

import type { DtsPluginOptions } from './types.js';

const extension = ['.ts', '.tsx'].map((ext) => `${ext}$`);

export default function farmDtsPlugin(options?: DtsPluginOptions): JsPlugin {
  const ctx = new Context();

  return {
    name: pluginName,
    priority: 1000,
    configResolved(config) {
      ctx.handleResolveOptions(options, config.compilation);
    },
    load: {
      filters: {
        resolvedPaths: [
          ...(Array.isArray(options?.resolvedPaths)
            ? options.resolvedPaths
            : extension)
        ]
      },
      async executor(params) {
        const { resolvedPath } = params;
        const content = await tryToReadFileSync(resolvedPath);
        return {
          content,
          moduleType: 'dts'
        };
      }
    },
    transform: {
      filters: {
        moduleTypes: ['dts']
      },
      async executor(params) {
        const { resolvedPath, content } = params;
        const [url] = resolvedPath.split('?');
        ctx.handleTransform(resolvedPath);

        const ext = path.extname(url).slice(1);

        return {
          content,
          moduleType: ext || 'ts'
        };
      }
    },
    finish: {
      async executor() {
        ctx.handleCloseBundle();
      }
    }
  };
}
