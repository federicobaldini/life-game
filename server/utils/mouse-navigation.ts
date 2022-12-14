export const enableMouseNavigation = (
  canvasElement: HTMLElement,
  spaceCallback: () => void
): void => {
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseMoveHandler = function (event: MouseEvent) {
    // How far the mouse has been moved
    const dx = event.pageX - pos.x;
    const dy = event.pageY - pos.y;

    // Scroll the element
    canvasElement.style.top = `${pos.top + dy}px`;
    canvasElement.style.left = `${pos.left + dx}px`;
  };

  const mouseUpHandler = function () {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  const mouseDownHandler = (event: MouseEvent) => {
    console.log();
    pos = {
      // The current scroll
      left: canvasElement.offsetLeft,
      top: canvasElement.offsetTop,
      // Get the current mouse position
      x: event.pageX,
      y: event.pageY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  document.addEventListener("mousedown", mouseDownHandler);
  document.addEventListener("keypress", (event: KeyboardEvent): void => {
    if (event.code === "Space") {
      spaceCallback();
    }
  });
};
