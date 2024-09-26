declare module "BarreModule" {
  type BarreType = {
    frets: number[];
    barre: number;
    capo?: boolean;
    lite: boolean;
    finger: number; // 0 | 1 | 2 | 3 | 4 | 5;
  };

  type FretXPositionType = {
    [key: number]: number[];
  };

  type OffsetType = {
    [key: number]: number;
  };
}
