export const enableResetButton = (
  buttonElement: HTMLButtonElement,
  resetCallback: () => void
): void => {
  buttonElement.addEventListener("click", (_) => {
    resetCallback();
  });
};
