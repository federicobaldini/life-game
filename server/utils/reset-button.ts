export const enableResetButton = (
  buttonElement: HTMLButtonElement,
  callback: Function
): void => {
  buttonElement.addEventListener("click", (_) => {
    callback();
  });
};
