import {describe, expect, it} from '@jest/globals'
import sum from "./sum";

describe("example test suite 1", ()=>{
  it("should add 1 + 2 to equal 3", ()=>{
    const result = sum(1, 2);
    expect(result).toEqual(3);
  })
});
