/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */

import type { Config } from 'jest';

const config: Config = {
  cache: false,
  collectCoverage: false,
  detectOpenHandles: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@base/api-contract$':
      '<rootDir>/../../packages/api-contract/src/index.ts',
    '^@base/paths$': '<rootDir>/../../packages/paths/src/index.ts',
    '^@base/api/(.*)$': '<rootDir>/../../apps/api/src/$1',
  },
  reporters: ['default', 'summary'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'src/.*\\.(spec|test)\\.ts$',
  testTimeout: 10000,
  transform: { '^.+\\.ts$': 'ts-jest' },
  verbose: true,
};

export default config;
