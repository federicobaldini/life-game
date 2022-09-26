export const enableZoom = (
  zoomInFunction: () => void,
  zoomOutFunction: () => void,
  drawChange: () => void
): void => {
  addEventListener("keypress", (event: KeyboardEvent) => {
    if (event.code === "BracketRight" || event.code === "Slash") {
      switch (event.code) {
        case "BracketRight":
          zoomInFunction();
          break;
        case "Slash":
          zoomOutFunction();
          break;
      }
      drawChange();
    }
  });

  addEventListener("mousewheel", (event: any) => {
    if (event.wheelDelta < 0) {
      zoomOutFunction();
    } else {
      zoomInFunction();
    }
    drawChange();
  });
};
