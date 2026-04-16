module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: ['*.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};
