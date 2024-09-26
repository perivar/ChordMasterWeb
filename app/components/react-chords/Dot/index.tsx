import React from "react";
import { DotType, OffsetsProp } from "DotModule";

const positions = {
  string: [50, 40, 30, 20, 10, 0],
  fret: [-4, 6.5, 18, 30, 42, 54],
  finger: [-3, 8, 19.5, 31.5, 43.5],
};

const offset: OffsetsProp = {
  4: 0,
  6: -1,
};

const getStringPosition = (string: number, strings: number) =>
  positions.string[string + offset[strings]];

const radius = {
  open: 2,
  fret: 4,
};

const Dot: React.FC<DotType> = ({
  string,
  fret = 0,
  finger,
  strings,
  lite = false,
}) =>
  fret === -1 ? (
    <text
      fontSize="0.7rem"
      fill="#444"
      fontFamily="Verdana"
      textAnchor="middle"
      x={getStringPosition(string, strings)}
      y="-2">
      x
    </text>
  ) : (
    <g>
      <circle
        strokeWidth="0.25"
        stroke="#444"
        fill={fret === 0 ? "transparent" : "#444"}
        cx={getStringPosition(string, strings)}
        cy={positions.fret[fret]}
        r={fret === 0 ? radius["open"] : radius["fret"]}
      />
      {!lite && finger > 0 && (
        <text
          fontSize="3pt"
          fontFamily="Verdana"
          textAnchor="middle"
          fill="white"
          x={getStringPosition(string, strings)}
          y={positions.finger[fret]}>
          {finger}
        </text>
      )}
    </g>
  );

export default Dot;
