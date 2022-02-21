import * as assert from "assert";
import { vendorForMac } from "../src/utils/MacUtils";
import { recordMap } from "../src/utils/ObjectUtils";

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
});