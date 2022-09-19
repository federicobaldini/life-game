export const enableZoom = (
  zoomInFunction: Function,
  zoomOutFunction: Function,
  drawChange: Function
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
