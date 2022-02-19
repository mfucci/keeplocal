import * as assert from "assert";
import { isRandomMac, vendorForMac } from "../src/utils/MacUtils";
import { recordMap } from "../src/utils/ObjectUtils";

describe("MacUtils", () => {
    context("isRandomMac", () => {
        it("returns false when it is not a random MAC", () => {
            assert.equal(isRandomMac("23:2F:AA:BB:12:1F"), false);
        });

        it("returns true when it is a random MAC", () => {
            assert.equal(isRandomMac("26:2F:AA:BB:12:1F"), true);
        });
    });

    context("vendorForMac", () => {
        it("returns the vendor for a known MAC", () => {
            assert.equal(vendorForMac("54:83:3A:8D:72:98"), "Zyxel Communications Corp");
        });

        it("returns <unknown> for an unknown MAC", () => {
            assert.equal(vendorForMac("23:11:11:8D:72:98"), "<unknown>");
        });

        it("returns <random> for a random MAC", () => {
            assert.equal(vendorForMac("26:2F:AA:BB:12:1F"), "<random>");
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
});