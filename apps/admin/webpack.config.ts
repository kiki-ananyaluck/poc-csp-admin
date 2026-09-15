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
export default withModuleFederation(config, { dts: false }).then(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mfConfig: any) => (angularConfig: any) => {
    const baseConfig = mfConfig(angularConfig);
    return {
      ...baseConfig,
      resolve: {
        ...baseConfig.resolve,
        alias: {
          ...(baseConfig.resolve?.alias as object),
          ...tsAliases,
        },
      },
    };
  },
);
