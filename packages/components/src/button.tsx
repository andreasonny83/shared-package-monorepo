import { MagicNumber, magicNumber } from "@shared/utils";
import React from "react";

const number: MagicNumber = magicNumber;

export const Button = () => (
  <button
    type="button"
    onClick={() => alert(`the meaning if life is ${number}`)}
  >
    Click me
  </button>
);

export { MagicNumber };
