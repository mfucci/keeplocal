/** 
 * Service worker to allow offline and remote access.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = "v1";

const URLS_TO_CACHE = [
    "/index.html",
    "/index.js",
    "/index.css",
    "/img/favicon.svg",
    "/font/roboto-all-300-normal.woff",
    "/font/roboto-all-400-normal.woff",
    "/font/roboto-all-500-normal.woff",
    "/font/roboto-all-700-normal.woff",
    "/font/roboto-latin-300-normal.woff2",
    "/font/roboto-latin-400-normal.woff2",
    "/font/roboto-latin-500-normal.woff2",
    "/font/roboto-latin-700-normal.woff2",
];

this.addEventListener("install", event =>
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(URLS_TO_CACHE))
    )
);

this.addEventListener("fetch", event =>
    event.respondWith((async () => {
        const { request } = event;

        if (request.method !== "GET") return fetch(request);
        if (!request.url.startsWith("http")) return fetch(request);

        const cachedResponse = await caches.match(request);
        if (!cachedResponse) return await caches.match("/index.html");
        return cachedResponse;
    })())
);

this.addEventListener("activate", event =>
    event.waitUntil(
        caches.keys()
        .then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))))
    )
);