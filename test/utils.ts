import * as assert from "assert";
import { vendorForMac } from "../src/utils/MacUtils";
import { deepCopy, diff, recordMap } from "../src/utils/ObjectUtils";

describe("MacUtils", () => {
    context("vendorForMac", () => {
        it("returns the vendor for a known MAC", () => {
            assert.equal(vendorForMac("54:83:3A:8D:72:98"), "Zyxel Communications Corporation");
        });

        it("returns <unknown> for an unknown MAC", () => {
            assert.equal(vendorForMac("23:11:11:8D:72:98"), "<unknown>");
        });

        it("returns <random MAC> for a random MAC", () => {
            assert.equal(vendorForMac("26:2F:AA:BB:12:1F"), "<random MAC>");
        });

        it("returns <private> for a private MAC", () => {
            assert.equal(vendorForMac("70:B3:D5:6F:41:22"), "<private>");
        });
    });
});

describe("ObjectUtils", () => {
    context("recordMap", () => {
        it("maps the values", () => {
            const record:Record<string, number> = {"a": 1, "b": 3};
            const mapFunction = (value: number) => value + 1;
            assert.deepEqual(recordMap(record, mapFunction), {"a": 2, "b": 4});
        });
    });

    context("deepCopy", () => {
        it("deep copies an object", () => {
            const object = {
                e: 22,
                a: 'ddd',
                rt: [
                    "2",
                    {
                        da: new Date(),
                    },
                ],
                bla: {
                    blabla: true,
                },
            };

            const result = deepCopy(object);

            assert.deepEqual(result, object);
        });
    });


    context("diff", () => {
        it("detects added values", () => {
            const oldObject = {
                e: 22,
                a: 'ddd',
            };
            const newObject = { new: 24, ...oldObject};

            const result = diff(oldObject, newObject);

            assert.deepEqual(result, {new: 24});
        });

        it("detects removed values", () => {
            const oldObject = {
                e: 22,
                a: 'ddd',
            };
            const newObject = {
                e: 22
            };

            const result = diff(oldObject, newObject);

            assert.deepEqual(result, {a: undefined});
        });

        it("detects modified values", () => {
            const oldObject = {
                e: 22,
                a: 'ddd',
            };
            const newObject = {
                e: 22,
                a: 'ww',
            };

            const result = diff(oldObject, newObject);

            assert.deepEqual(result, {a: "ww"});
        });

        it("detects diff in dates", () => {
            const oldObject = {
                e: new Date(1),
                a: new Date(2),
            };
            const newObject = {
                e: new Date(1),
                a: new Date(3),
            };

            const result = diff(oldObject, newObject);

            assert.deepEqual(result, {a: new Date(3)});
        });
    });
});