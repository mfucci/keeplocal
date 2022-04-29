
export interface Service {
    start(): Promise<void>;
}

export interface ServiceBuilder<T extends Service> {
    name: string;
    dependencyBuilders: ServiceBuilder<any>[];
    build(...dependencies: Service[]): Promise<T>;
}
