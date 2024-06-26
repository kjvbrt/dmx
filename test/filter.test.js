import { reconnect } from "../js/menu/filter/reconnect.js";
import { InfoBox, Link } from "../js/objects.js";
import {
  Range,
  Checkbox,
  buildCriteriaFunction,
} from "../js/menu/filter/parameters.js";

const parentLinks = [];
const childrenLinks = [];
const particles = [];

beforeAll(() => {
  for (let i = 0; i < 5; i++) {
    const particle = new InfoBox(i);
    particle.momentum = i * 100;
    particle.charge = i;
    particle.mass = i * 10;
    particle.simStatus = i + 23;
    particles.push(particle);
  }

  parentLinks.push(new Link(0, 0, 1));
  parentLinks.push(new Link(1, 0, 2));
  parentLinks.push(new Link(2, 2, 4));
  parentLinks.push(new Link(3, 1, 3));
  parentLinks.push(new Link(4, 3, 4));

  childrenLinks.push(new Link(0, 0, 1));
  childrenLinks.push(new Link(1, 0, 2));
  childrenLinks.push(new Link(2, 1, 3));
  childrenLinks.push(new Link(3, 2, 4));
  childrenLinks.push(new Link(4, 3, 4));

  particles[0].children = [1, 2];
  particles[0].childrenLinks = [0, 1];

  particles[1].parents = [0];
  particles[1].children = [3];
  particles[1].parentLinks = [0];
  particles[1].childrenLinks = [2];

  particles[2].parents = [0];
  particles[2].children = [4];
  particles[2].parentLinks = [1];
  particles[2].childrenLinks = [3];

  particles[3].parents = [1];
  particles[3].children = [4];
  particles[3].parentLinks = [3];
  particles[3].childrenLinks = [4];

  particles[4].parents = [2, 3];
  particles[4].parentLinks = [2, 4];
});

describe("filter by ranges", () => {
  it("filter by a single range parameter", () => {
    const momentum = new Range("momentum");
    momentum.min = 300;
    momentum.max = 1000;
    const rangeFilters = Range.buildFilter([momentum]);
    const criteriaFunction = buildCriteriaFunction(rangeFilters);

    const [newParentLinks, newChildrenLinks, filteredParticles] = reconnect(
      criteriaFunction,
      parentLinks,
      childrenLinks,
      particles
    );

    expect(newChildrenLinks.map((link) => link.id)).toEqual([4]);
    expect(newParentLinks.map((link) => link.id)).toEqual([4]);
    expect(
      filteredParticles.filter((p) => p).map((particle) => particle.id)
    ).toEqual([3, 4]);
  });

  it("filter by a combination of ranges", () => {
    const charge = new Range("charge");
    charge.min = 3;
    const mass = new Range("mass");
    mass.min = 20;
    mass.max = 40;
    const rangeFilters = Range.buildFilter([mass, charge]);
    const criteriaFunction = buildCriteriaFunction(rangeFilters);

    const [newParentLinks, newChildrenLinks, filteredParticles] = reconnect(
      criteriaFunction,
      parentLinks,
      childrenLinks,
      particles
    );

    expect(newChildrenLinks.map((link) => link.id)).toEqual([4]);
    expect(newParentLinks.map((link) => link.id)).toEqual([4]);
    expect(
      filteredParticles.filter((p) => p).map((particle) => particle.id)
    ).toEqual([3, 4]);
  });
});

describe("filter by checkboxes", () => {
  it("filter by a single checkbox", () => {
    const simulatorStatus = new Checkbox("simStatus", 23);
    simulatorStatus.checked = true;
    const checkboxFilters = Checkbox.buildFilter([simulatorStatus]);
    const criteriaFunction = buildCriteriaFunction(checkboxFilters);

    const [newParentLinks, newChildrenLinks, filteredParticles] = reconnect(
      criteriaFunction,
      parentLinks,
      childrenLinks,
      particles
    );

    expect(newChildrenLinks.map((link) => link.id)).toEqual([]);
    expect(newParentLinks.map((link) => link.id)).toEqual([]);
    expect(
      filteredParticles.filter((p) => p).map((particle) => particle.id)
    ).toEqual([0]);
  });

  it("filter by a combination of checkboxes", () => {
    const simulatorStatus1 = new Checkbox("simStatus", 23);
    simulatorStatus1.checked = true;
    const simulatorStatus2 = new Checkbox("simStatus", 26);
    simulatorStatus2.checked = true;
    const simulatorStatus3 = new Checkbox("simStatus", 27);
    simulatorStatus3.checked = true;
    const checkboxFilters = Checkbox.buildFilter([
      simulatorStatus1,
      simulatorStatus2,
      simulatorStatus3,
    ]);
    const criteriaFunction = buildCriteriaFunction(checkboxFilters);

    const [newParentLinks, newChildrenLinks, filteredParticles] = reconnect(
      criteriaFunction,
      parentLinks,
      childrenLinks,
      particles
    );

    expect(newChildrenLinks.map((link) => link.id)).toEqual([0, 1, 4]);
    expect(newParentLinks.map((link) => link.id)).toEqual([0, 1, 4]);
    expect(
      filteredParticles.filter((p) => p).map((particle) => particle.id)
    ).toEqual([0, 3, 4]);
  });
});

describe("filter by ranges and checkboxes", () => {
  it("show all particles when no kind of filter is applied", () => {
    const charge = new Range("charge");
    const simulatorStatus = new Checkbox("simStatus", 26);
    const rangeFilters = Range.buildFilter([charge]);
    const checkboxFilters = Checkbox.buildFilter([simulatorStatus]);
    const criteriaFunction = buildCriteriaFunction(
      rangeFilters,
      checkboxFilters
    );

    const [newParentLinks, newChildrenLinks, filteredParticles] = reconnect(
      criteriaFunction,
      parentLinks,
      childrenLinks,
      particles
    );

    expect(newParentLinks.map((link) => link.id).sort()).toEqual([
      0, 1, 2, 3, 4,
    ]);
    expect(newChildrenLinks.map((link) => link.id).sort()).toEqual([
      0, 1, 2, 3, 4,
    ]);
    expect(filteredParticles.map((particle) => particle.id)).toEqual([
      0, 1, 2, 3, 4,
    ]);
  });

  it("filter by a combination of ranges and checkboxes", () => {
    const charge = new Range("charge");
    charge.max = 3;
    const simulatorStatus = new Checkbox("simStatus", 23);
    simulatorStatus.checked = true;
    const rangeFilters = Range.buildFilter([charge]);
    const checkboxFilters = Checkbox.buildFilter([simulatorStatus]);
    const criteriaFunction = buildCriteriaFunction(
      rangeFilters,
      checkboxFilters
    );

    const [newParentLinks, newChildrenLinks, filteredParticles] = reconnect(
      criteriaFunction,
      parentLinks,
      childrenLinks,
      particles
    );

    expect(newChildrenLinks.map((link) => link.id)).toEqual([]);
    expect(newParentLinks.map((link) => link.id)).toEqual([]);
    expect(
      filteredParticles.filter((p) => p).map((particle) => particle.id)
    ).toEqual([0]);
  });
});
