export const enableMouseNavigation = (containerElement: HTMLElement): void => {
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseMoveHandler = function (event: MouseEvent) {
    // How far the mouse has been moved
    const dx = event.clientX - pos.x;
    const dy = event.clientY - pos.y;

    // Scroll the element
    containerElement.scrollTop = pos.top - dy;
    containerElement.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);

    containerElement.style.cursor = "default";
    containerElement.style.removeProperty("user-select");
  };

  const mouseDownHandler = (event: MouseEvent) => {
    pos = {
      // The current scroll
      left: containerElement.scrollLeft,
      top: containerElement.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    containerElement.style.cursor = "grabbing";
    containerElement.style.userSelect = "none";

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  document.addEventListener("mousedown", mouseDownHandler);
};
