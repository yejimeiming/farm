import path from 'path';

import { defineConfig } from '@farmfe/core';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import VueRouter from 'unplugin-vue-router/vite';
import UnpluginSvgComponent from 'unplugin-svg-component/vite';

import less from '@farmfe/js-plugin-less';
import postcss from '@farmfe/js-plugin-postcss';
import viewer from '@farmfe/js-plugin-visualizer';

function configureVitePluginVue() {
  // return plugin and its filters
  return {
    // using plugin vue
    vitePlugin: vue(),
    // configuring filters for it. Unmatched module paths will be skipped.
    filters:  ["!node_modules", "node_modules/my-ui"]
  };
}

export default defineConfig({
  compilation: {
    // compilation options here
    // persistentCache: false
    output:{
      path: "build",
      publicPath: "/vue-public-path/",
    }
  },
  plugins: [
    '@farmfe/plugin-sass',
    less(),
    postcss(),
    process.env.FARM_VIEWER ? viewer() : undefined,
    {
      name: 'remove-css-filter-plugin',
      priority: 0,
      transform: {
        filters: {
          resolvedPaths: [
            'src/components/HelloWorld.vue\\?vue&(.+)&lang\\.scss'
          ]
        },
        async executor({ content }) {
          return {
            content: content.replace('filter: alpha(opacity=0);', '')
          };
        }
      }
    }
  ],
  vitePlugins: [
    VueRouter(),
    configureVitePluginVue,
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      imports: [
        VueRouterAutoImports
      ]
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
    }),
    UnpluginSvgComponent({
      iconDir: [path.resolve(process.cwd(), 'src', 'assets')],
      dts: true,
      preserveColor: path.resolve(process.cwd(), 'src', 'assets'),
      dtsDir: process.cwd(),
      svgSpriteDomId: 'my-svg-id',
      prefix: 'icon',
      componentName: 'MySvgIcon',
      symbolIdFormatter: (svgName: string, prefix: string): string => {
        const nameArr = svgName.split('/')
        if (prefix)
          nameArr.unshift(prefix)
        return nameArr.join('-').replace(/\.svg$/, '')
      },
      optimizeOptions: undefined,
      vueVersion: 3,
      scanStrategy: 'component',
      treeShaking: true,
    })
  ]
});
