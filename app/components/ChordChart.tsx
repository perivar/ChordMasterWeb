import { FunctionComponent } from "react";

interface Props {
  height?: number;
  width?: number;
  chord: string[];
  showTuning?: boolean;
  tuning?: string[];
}

const ChordChart: FunctionComponent<Props> = ({
  width = 100,
  height = 120,
  showTuning = false, // whether to show the tuning letters
  tuning = ["E", "A", "D", "G", "B", "E"],
  chord,
}) => {
  if (!chord || chord.length <= 0) {
    chord = ["x", "x", "x", "x", "x", "x"];
  }

  let fretPosition = 0;
  let lower = 100;

  chord.forEach(c => {
    if (c !== "x" && parseInt(c) < lower) lower = parseInt(c);
  });

  const normalizedChord = [...chord];
  if (lower === 100) {
    fretPosition = 0;
  } else if (lower >= 3) {
    fretPosition = lower;
    for (let i = 0; i < chord.length; i++) {
      normalizedChord[i] =
        chord[i] === "x" ? "x" : (parseInt(chord[i]) - (lower - 1)).toString();
    }
  }

  const barres: { from: number; to: number; fret: number }[] = [
    // { from: 6, to: 1, fret: 1 },
    // { from: 4, to: 5, fret: 4 },
  ];

  const tuningContainerHeight = 20;
  const chartWidth = width * 0.75;
  const chartHeight = showTuning
    ? height * 0.75 - tuningContainerHeight
    : height * 0.75;

  const circleRadius = chartWidth / 15;
  const bridgeStrokeWidth = Math.ceil(chartHeight / 36);
  const fontSize = Math.ceil(chartWidth / 8);
  const numStrings = chord.length;
  const numFrets = 5;

  const stringSpacing = chartWidth / numStrings;
  const chartXPos = width - chartWidth;
  const chartYPos =
    height - chartHeight - (showTuning ? tuningContainerHeight : 0);
  const fretSpacing = chartHeight / numFrets;
  const defaultColor = "#0ea5e9";
  const strokeWidth = 1;

  const drawText = (x: number, y: number, msg: string) => (
    <text
      key={`text-${x}-${y}-${msg}`}
      fill={defaultColor}
      fontSize={fontSize}
      x={x}
      y={y}
      textAnchor="middle">
      {msg}
    </text>
  );

  const lightUp = (stringNum: number, fret: string) => {
    const mute = fret === "x";
    const fretNum = fret === "x" ? 0 : parseInt(fret);

    const x = chartXPos + stringSpacing * stringNum;
    const y1 = chartYPos + fretSpacing * fretNum - fretSpacing / 2;

    if (!mute && fretNum !== 0) {
      return (
        <circle
          key={`finger-${stringNum}`}
          cx={x}
          cy={y1}
          r={circleRadius}
          strokeWidth={strokeWidth}
          stroke={defaultColor}
          fill={defaultColor}
        />
      );
    }
  };

  const lightBar = (stringFrom: number, stringTo: number, fretNum: number) => {
    const y1 = chartYPos + fretSpacing * (fretNum - 1) + fretSpacing / 2;
    return (
      <line
        strokeWidth={circleRadius * 2}
        strokeLinecap="round"
        stroke={defaultColor}
        x1={chartXPos + stringSpacing * (numStrings - stringFrom)}
        y1={y1}
        x2={chartXPos + stringSpacing * (numStrings - stringTo)}
        y2={y1}
      />
    );
  };

  return (
    <div className="flex items-center justify-center" style={{ height, width }}>
      <svg height={height} width={width}>
        {fretPosition <= 1 ? (
          <rect
            fill={defaultColor}
            width={chartWidth - stringSpacing}
            height={bridgeStrokeWidth}
            x={chartXPos}
            y={chartYPos}
          />
        ) : (
          drawText(
            chartXPos - 10,
            chartYPos + fontSize - 1 + (fretSpacing - fontSize) / 2,
            `${fretPosition}º`
          )
        )}

        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            strokeWidth={1}
            stroke={defaultColor}
            x1={chartXPos + stringSpacing * i}
            y1={chartYPos}
            x2={chartXPos + stringSpacing * i}
            y2={chartYPos + fretSpacing * numFrets}
          />
        ))}

        {Array.from({ length: numFrets }).map((_, i) => (
          <line
            key={`fret-${i}`}
            strokeWidth={1}
            stroke={defaultColor}
            x1={chartXPos}
            y1={chartYPos + fretSpacing * i}
            x2={chartXPos + stringSpacing * (numStrings - 1)}
            y2={chartYPos + fretSpacing * i}
          />
        ))}

        {normalizedChord.map((c, i) => {
          if (c === "x") {
            return drawText(
              chartXPos + stringSpacing * i,
              chartYPos - fontSize,
              "X"
            );
          } else if (c === "0") {
            return (
              <circle
                key={`circle-${i}`}
                cx={chartXPos + stringSpacing * i}
                cy={chartYPos - fontSize - circleRadius}
                r={circleRadius}
                strokeWidth={strokeWidth}
                stroke={defaultColor}
                fill="none"
              />
            );
          }
        })}

        {normalizedChord.map((c, i) => lightUp(i, c))}

        {barres.map(barre => lightBar(barre.from, barre.to, barre.fret))}

        {showTuning &&
          tuning.length === numStrings &&
          tuning.map((t, i) =>
            drawText(
              chartXPos + stringSpacing * i,
              chartYPos + chartHeight + fontSize,
              t
            )
          )}
      </svg>
    </div>
  );
};

export default ChordChart;
