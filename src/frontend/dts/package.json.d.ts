/**
 * Type definitions for package.json
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

declare module "*package.json" {
  const npmPackage: {
    version: string;
  };
  export default npmPackage;
}
