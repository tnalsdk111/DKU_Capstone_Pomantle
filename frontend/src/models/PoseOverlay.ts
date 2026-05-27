export type PoseOverlayData = {
  pose: ([number, number] | null)[];
  leftHand: ([number, number] | null)[];
  rightHand: ([number, number] | null)[];
  sourceSize: {
    width: number;
    height: number;
  };
};
