export const enableControlButton = (
  buttonElement: HTMLButtonElement,
  playElement: { play: boolean },
  callback: Function
): void => {
  buttonElement.addEventListener("click", (_) => {
    if (playElement.play) {
      playElement.play = false;
      buttonElement.textContent = "RESUME";
    } else {
      callback();
      playElement.play = true;
      buttonElement.textContent = "STOP";
    }
  });
};
