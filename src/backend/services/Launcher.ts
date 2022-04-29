import { Service, ServiceBuilder } from "./Service";

export class Launcher {
    readonly launchedServices = new Map<ServiceBuilder<any>, Service>();

    async start<T extends Service>(builder: ServiceBuilder<T>): Promise<T> {
        var service = this.launchedServices.get(builder) as T | undefined;
        if (service !== undefined) {
            return service;
        }
        const { name, dependencyBuilders, build } = builder;
        const dependencies: Service[] = [];
        for (var dependencyBuilder of dependencyBuilders) {
            dependencies.push(await this.start<Service>(dependencyBuilder));
        }
        console.log(`Launching ${name}`);
        service = await build(...dependencies);
        this.launchedServices.set(builder, service);
        await service.start();
        console.log(`Launched ${name}`);
        return service;
    }
}
