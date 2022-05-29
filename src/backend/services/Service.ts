/**
 * Base structures for backend services.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  start(postLaunchHooks: CallableFunction[]): Promise<void>;
}

export interface ServiceBuilder<T extends Service> {
  name: string;
  dependencyBuilders: ServiceBuilder<any>[];
  build(...dependencies: Service[]): Promise<T>;
}
