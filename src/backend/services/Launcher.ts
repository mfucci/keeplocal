import { Service, ServiceBuilder } from "./Service";

export class Launcher {
    readonly launchedServices = new Map<ServiceBuilder<any>, Service>();
    readonly postStartHooks = new Array<CallableFunction>();

    async start<T extends Service>(builder: ServiceBuilder<T>): Promise<T> {
        const service = await this.startRec(builder);
        this.postStartHooks.forEach(hook => hook());
        return service;
    }

    private async startRec<T extends Service>(builder: ServiceBuilder<T>): Promise<T> {
        let service = this.launchedServices.get(builder) as T | undefined;
        if (service !== undefined) {
            return service;
        }
        const { name, dependencyBuilders, build } = builder;
        const dependencies: Service[] = [];
        for (const dependencyBuilder of dependencyBuilders) {
            dependencies.push(await this.startRec<Service>(dependencyBuilder));
        }
        console.log(`Launching ${name}`);
        service = await build(...dependencies);
        this.launchedServices.set(builder, service);
        await service.start(this.postStartHooks);
        console.log(`Launched ${name}`);
        return service;
    }
}
