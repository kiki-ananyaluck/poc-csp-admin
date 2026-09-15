import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';
import { join } from 'path';

const tsAliases = {
  '@admin': join(__dirname, 'src/app'),
  '@environments': join(__dirname, 'src/environments'),
  '@services': join(__dirname, 'src/app/services'),
  '@components': join(__dirname, 'src/app/components'),
  '@layouts': join(__dirname, 'src/app/layouts'),
  '@pages': join(__dirname, 'src/app/pages'),
};

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default withModuleFederation(
  {
    ...config,
    /*
     * Remote overrides for production.
     * Each entry is a pair of a unique name and the URL where it is deployed.
     *
     * e.g.
     * remotes: [
     *   ['app1', 'https://app1.example.com'],
     *   ['app2', 'https://app2.example.com'],
     * ]
     */
  },
  { dts: false },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
).then((mfConfig: any) => ({
  ...mfConfig,
  resolve: {
    ...mfConfig.resolve,
    alias: {
      ...(mfConfig.resolve?.alias as object),
      ...tsAliases,
    },
  },
}));
