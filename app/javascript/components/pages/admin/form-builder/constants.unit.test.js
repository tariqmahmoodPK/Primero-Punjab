import * as constants from "./constants";

describe("<FormBuilder /> - Constants", () => {
  it("should have known properties", () => {
    const clonedActions = { ...constants };

    ["NAME", "NEW_FIELD"].forEach(property => {
      expect(clonedActions).to.have.property(property);
      delete clonedActions[property];
    });

    expect(clonedActions).to.be.empty;
  });
});