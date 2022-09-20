export const enableControlButton = (
  buttonElement: HTMLButtonElement,
  gameStatus: { play: boolean },
  animationId: number | null,
  renderLoopCallback: Function
): void => {
  buttonElement.addEventListener("click", (_) => {
    if (gameStatus.play) {
      cancelAnimationFrame(animationId);
      gameStatus.play = false;
      buttonElement.textContent = "RESUME";
    } else {
      renderLoopCallback();
      gameStatus.play = true;
      buttonElement.textContent = "STOP";
    }
  });
};
