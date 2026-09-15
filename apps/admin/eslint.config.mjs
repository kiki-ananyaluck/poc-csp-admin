import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      // 'no-restricted-imports': [
      //   'error',
      //   {
      //     patterns: [
      //       {
      //         group: ['**/src/app/*', '../../app/*', '../app/*'],
      //         message: "Use '@admin/*' instead of relative paths to src/app/",
      //       },
      //       {
      //         group: [
      //           '**/src/environments/*',
      //           '../../environments/*',
      //           '../environments/*',
      //         ],
      //         message:
      //           "Use '@environments/*' instead of relative paths to src/environments/",
      //       },
      //       {
      //         group: [
      //           '**/src/app/services/*',
      //           '../../services/*',
      //           '../services/*',
      //         ],
      //         message:
      //           "Use '@services/*' instead of relative paths to src/app/services/",
      //       },
      //       {
      //         group: [
      //           '**/src/app/components/*',
      //           '../../components/*',
      //           '../components/*',
      //         ],
      //         message:
      //           "Use '@components/*' instead of relative paths to src/app/components/",
      //       },
      //       {
      //         group: [
      //           '**/src/app/layouts/*',
      //           '../../layouts/*',
      //           '../layouts/*',
      //         ],
      //         message:
      //           "Use '@layouts/*' instead of relative paths to src/app/layouts/",
      //       },
      //       {
      //         group: ['**/src/app/pages/*', '../../pages/*', '../pages/*'],
      //         message:
      //           "Use '@pages/*' instead of relative paths to src/app/pages/",
      //       },
      //     ],
      //   },
      // ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
