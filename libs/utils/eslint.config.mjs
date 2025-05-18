import base from "../../eslint.base.config.mjs";
import { generateNestedOverridesConfig } from "../../eslint.overrides.config.mjs";

//================================================

export default [...base, ...generateNestedOverridesConfig()];
