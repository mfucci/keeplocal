import { createAaaaRecord, createARecord, createCnameRecord, createConsoleLog, createMxRecord, createNsRecord, createSoaRecord, createSrvRecord, createTxtRecord, Server } from "denamed";
import dns from "dns";

const resolver = new dns.promises.Resolver();
resolver.setServers(["192.168.1.1"]);

const server = new Server({
  port: 9999,
  log: createConsoleLog(),
});

server.on("query", async query => {
  const { name, type } = query;
  switch (type) {
    case "A":
      (await resolver.resolve4(name, { ttl: true }))
        .forEach(({ address, ttl }) => query.addAnswer(name, createARecord(address), ttl));
      break;
    case "AAAA":
      (await resolver.resolve6(name, { ttl: true }))
        .forEach(({ address, ttl }) => query.addAnswer(name, createAaaaRecord(address), ttl));
      break;
    case "CNAME":
      (await resolver.resolveCname(name))
        .forEach(cname => query.addAnswer(name, createCnameRecord(cname)));
      break;
    case "TXT":
      (await resolver.resolveTxt(name))
        .flat()
        .forEach(txt => query.addAnswer(name, createTxtRecord(txt)));
      break;
    case "MX":
      (await resolver.resolveMx(name))
        .forEach(mx => query.addAnswer(name, createMxRecord(mx)));
      break;
    case "NS":
      (await resolver.resolveNs(name))
        .forEach(ns => query.addAnswer(name, createNsRecord(ns)));
      break;
    case "SOA":
      const { nsname, hostmaster, serial, refresh, retry, expire, minttl } = await resolver.resolveSoa(name);
      query.addAnswer(name, createSoaRecord({ host: nsname, admin: hostmaster, expire, refresh, retry, serial, ttl: minttl }));
      break;
    case "SRV":
      (await resolver.resolveSrv(name))
        .forEach(({ name: target, port, priority, weight }) => query.addAnswer(name, createSrvRecord({port, target, priority, weight})));
      break;
    case "PTR":
      (await resolver.resolvePtr(name))
        .forEach(cname => query.addAnswer(name, createCnameRecord(cname)));
      break;
    default:
      console.log(`Unhandle query type ${type}`);
      server.send(query);
      return;
  }
  server.send(query);
});

server
  .start()
  .then(server => console.log(`Server listening on ${server.address}:${server.port}...`))
  .catch(console.error);
